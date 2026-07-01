import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { period = 'month', groupBy = 'agency', include_deleted = false } = body;

    const candidates = await base44.entities.Candidate.list('-created_date', 1000);
    const agencies = await base44.entities.Agency.list('-created_date', 500);

    const now = new Date();
    let startDate = new Date();

    if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'quarter') startDate.setMonth(now.getMonth() - 3);

    const deletedCount = candidates.filter(c => c.deleted_at).length;

    const filteredCandidates = candidates.filter(c => {
      if (!include_deleted && c.deleted_at) return false;
      if (!c.created_date) return true;
      const createdDate = new Date(c.created_date);
      return createdDate >= startDate;
    });

    let analytics: any = {};

    if (groupBy === 'agency') {
      agencies.forEach(agency => {
        const agencyCandidates = filteredCandidates.filter(c => c.agency_id === agency.id);
        analytics[agency.name] = {
          total: agencyCandidates.length,
          sb_approved: agencyCandidates.filter(c => c.sb_check === 'Согласован').length,
          med_approved: agencyCandidates.filter(c => c.medical_check === 'Прошёл').length,
          both_approved: agencyCandidates.filter(c => c.sb_check === 'Согласован' && c.medical_check === 'Прошёл').length,
          ready_to_send: agencyCandidates.filter(c => c.payment_basis === 'Готовится к отправке').length,
          refused: agencyCandidates.filter(c => c.is_archived).length
        };
      });
    } else if (groupBy === 'position') {
      const positions = [...new Set(filteredCandidates.map(c => c.position))];
      positions.forEach(position => {
        const posCandidates = filteredCandidates.filter(c => c.position === position);
        analytics[position || 'Не указана'] = {
          total: posCandidates.length,
          sb_approved: posCandidates.filter(c => c.sb_check === 'Согласован').length,
          med_approved: posCandidates.filter(c => c.medical_check === 'Прошёл').length,
          both_approved: posCandidates.filter(c => c.sb_check === 'Согласован' && c.medical_check === 'Прошёл').length
        };
      });
    }

    return Response.json({
      status: 'success',
      period,
      groupBy,
      include_deleted,
      total_candidates: filteredCandidates.length,
      deleted_count: deletedCount,
      analytics
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});