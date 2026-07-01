import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Allow admin and moderator roles
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return Response.json({ error: 'Insufficient permissions. Admin or moderator role required.' }, { status: 403 });
    }

    const body = await req.json();
    const { criteria, dry_run = true } = body;

    if (!criteria || !['sb_refused', 'med_refused', 'personal_refusal'].includes(criteria)) {
      return Response.json({ error: 'Invalid criteria: sb_refused, med_refused, or personal_refusal' }, { status: 400 });
    }

    let query: any = { is_archived: false };

    if (criteria === 'sb_refused') {
      query.sb_check = 'Не согласован';
    } else if (criteria === 'med_refused') {
      query.medical_check = 'Не прошёл';
    } else if (criteria === 'personal_refusal') {
      query.payment_basis = 'Отказался от отправки';
    }

    const candidates = await base44.entities.Candidate.filter(query, '-created_date', 1000);

    // Exclude soft-deleted candidates from archiving
    const activeCandidates = candidates.filter(c => !c.deleted_at);

    if (dry_run) {
      return Response.json({
        status: 'dry_run',
        criteria,
        total_would_archive: activeCandidates.length,
        candidates: activeCandidates.map(c => ({
          id: c.id,
          full_name: c.full_name,
          position: c.position,
          agency_name: c.agency_name,
          sb_check: c.sb_check,
          medical_check: c.medical_check,
          payment_basis: c.payment_basis
        })),
        message: `Найдено ${activeCandidates.length} кандидатов для архивации по критерию "${criteria}"`
      });
    }

    // Perform actual archiving using bulkUpdate with specific IDs (excludes soft-deleted)
    const ids = activeCandidates.map(c => c.id);
    if (ids.length === 0) {
      return Response.json({
        status: 'success',
        criteria,
        archived_count: 0,
        message: `Нет кандидатов для архивации по критерию "${criteria}"`
      });
    }

    const archived = await base44.entities.Candidate.bulkUpdate(
      ids.map(id => ({ id, is_archived: true }))
    );

    return Response.json({
      status: 'success',
      criteria,
      archived_count: ids.length,
      message: `Архивировано ${ids.length} кандидатов`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});