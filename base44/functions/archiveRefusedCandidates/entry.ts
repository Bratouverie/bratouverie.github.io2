import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'admin') {
      return Response.json({ error: 'Only admins can archive candidates' }, { status: 403 });
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

    if (dry_run) {
      return Response.json({
        status: 'dry_run',
        criteria,
        total_would_archive: candidates.length,
        candidates: candidates.map(c => ({
          id: c.id,
          full_name: c.full_name,
          position: c.position,
          agency_name: c.agency_name,
          sb_check: c.sb_check,
          medical_check: c.medical_check,
          payment_basis: c.payment_basis
        })),
        message: `Найдено ${candidates.length} кандидатов для архивации по критерию "${criteria}"`
      });
    }

    // Perform actual archiving
    const archived = await base44.entities.Candidate.updateMany(query, { $set: { is_archived: true } });

    return Response.json({
      status: 'success',
      criteria,
      archived_count: archived.modified_count || candidates.length,
      message: `Архивировано ${archived.modified_count || candidates.length} кандидатов`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});