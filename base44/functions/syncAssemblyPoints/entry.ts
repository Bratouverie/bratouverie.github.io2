import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: только для администраторов' }, { status: 403 });
    }

    const [candidates, cities] = await Promise.all([
      base44.asServiceRole.entities.Candidate.list('-created_date', 500),
      base44.asServiceRole.entities.City.list('-created_date', 500),
    ]);

    const cityNames = new Set(cities.map(c => c.name.toLowerCase()));
    const active = candidates.filter(c => !c.is_archived && c.city);

    const missingMap = {};
    active.forEach(c => {
      const key = c.city.toLowerCase();
      if (!cityNames.has(key)) {
        if (!missingMap[key]) {
          missingMap[key] = { name: c.city, count: 0 };
        }
        missingMap[key].count++;
      }
    });

    const missingList = Object.values(missingMap).sort((a, b) => b.count - a.count).slice(0, 10);

    // Параллельно получаем координаты для всех новых городов
    const results = await Promise.all(
      missingList.map(async (mc) => {
        try {
          const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Найди географические координаты города "${mc.name}" в России или странах СНГ. Верни JSON с широтой (lat), долготой (lon) и названием региона (region). Если город не существует или не найден — верни {"error": true}.`,
            add_context_from_internet: true,
            model: 'gemini_3_flash',
            response_json_schema: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lon: { type: 'number' },
                region: { type: 'string' },
                error: { type: 'boolean' },
              },
            },
          });

          if (llmRes && !llmRes.error && llmRes.lat != null && llmRes.lon != null) {
            await base44.asServiceRole.entities.City.create({
              name: mc.name,
              region: llmRes.region || '',
              lat: llmRes.lat,
              lon: llmRes.lon,
              source: 'llm',
            });
            return { name: mc.name, region: llmRes.region || '', lat: llmRes.lat, lon: llmRes.lon, candidates: mc.count, success: true };
          } else {
            return { name: mc.name, reason: 'Координаты не найдены', success: false };
          }
        } catch (e) {
          return { name: mc.name, reason: e.message, success: false };
        }
      })
    );

    const added = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    const allCities = await base44.asServiceRole.entities.City.list('-created_date', 500);
    const assemblyPoints = allCities
      .filter(c => c.lat != null && c.lon != null)
      .map(c => ({ name: c.name, region: c.region || '', lat: c.lat, lon: c.lon }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return Response.json({
      new_cities_added: added,
      added_count: added.length,
      failed: failed,
      total_assembly_points: assemblyPoints.length,
      assembly_points: assemblyPoints,
      synced_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});