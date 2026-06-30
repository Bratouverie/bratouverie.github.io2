import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { candidate_id } = body;

    if (!candidate_id) {
      return Response.json({ error: 'candidate_id required' }, { status: 400 });
    }

    const candidate = await base44.entities.Candidate.get(candidate_id);
    if (!candidate) {
      return Response.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const cities = await base44.entities.City.list('-created_date', 500);
    const assemblyPoints = await base44.entities.City.filter({ is_assembly_point: true }, '-created_date', 200);

    const candidateCity = cities.find(c => c.name?.toLowerCase() === candidate.city?.toLowerCase());
    
    if (!candidateCity?.lat || !candidateCity?.lon) {
      return Response.json({
        candidate: candidate.full_name,
        city: candidate.city,
        assembly_point: candidate.assembly_point,
        assembly_distance: candidate.assembly_distance,
        available_points: assemblyPoints.map(p => ({ id: p.id, name: p.name, region: p.region })),
        message: 'Координаты города кандидата не найдены в справочнике'
      });
    }

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    };

    const pointsWithDistance = assemblyPoints
      .filter(p => p.lat != null && p.lon != null)
      .map(p => ({
        id: p.id,
        name: p.name,
        region: p.region,
        distance: calculateDistance(candidateCity.lat, candidateCity.lon, p.lat, p.lon)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    return Response.json({
      candidate: candidate.full_name,
      city: candidate.city,
      current_assembly_point: candidate.assembly_point,
      current_distance: candidate.assembly_distance,
      suggested_points: pointsWithDistance,
      message: `Найдено ${pointsWithDistance.length} ближайших пунктов сбора`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});