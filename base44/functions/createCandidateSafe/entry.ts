import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function normalizeName(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

function namesMatch(a, b) {
  const pa = normalizeName(a).split(' ').filter(Boolean);
  const pb = normalizeName(b).split(' ').filter(Boolean);
  if (pa.length === 0 || pb.length === 0) return false;
  if (pa[0] !== pb[0]) return false;
  if (pa.length >= 2 && pb.length >= 2 && pa[1] !== pb[1]) return false;
  return true;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { candidate_data, actor } = body;

    if (!candidate_data?.full_name || !candidate_data?.birth_date) {
      return Response.json(
        { success: false, error: 'full_name и birth_date обязательны' },
        { status: 400 }
      );
    }

    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // Server-side duplicate check across ALL candidates (not agency-scoped)
    // Filter by exact birth_date first (efficient), then name-match
    const sameBirthDate = await sr.entities.Candidate.filter(
      { birth_date: candidate_data.birth_date },
      '-created_date',
      500
    );

    const duplicates = sameBirthDate.filter(
      (c) => !c.is_archived && !c.deleted_at && namesMatch(c.full_name, candidate_data.full_name)
    );

    if (duplicates.length > 0) {
      return Response.json(
        {
          success: false,
          error: 'duplicate',
          existing_candidate: {
            id: duplicates[0].id,
            full_name: duplicates[0].full_name,
            agency_name: duplicates[0].agency_name || '',
            birth_date: duplicates[0].birth_date,
          },
        },
        { status: 409 }
      );
    }

    // Generate form token
    const token =
      'cf-' +
      Math.random().toString(36).substring(2, 10) +
      '-' +
      Math.random().toString(36).substring(2, 10);

    // Create candidate
    const created = await sr.entities.Candidate.create({
      ...candidate_data,
      form_token: token,
      form_status: 'pending',
    });

    // Create linked CandidateForm (atomic — if this fails, candidate still has token)
    let formRecord = null;
    if (created?.id) {
      try {
        formRecord = await sr.entities.CandidateForm.create({
          candidate_id: created.id,
          form_token: token,
          status: 'pending',
        });
      } catch (formErr) {
        // Form creation failed but candidate exists — onboarding page will recover
        console.error('CandidateForm creation failed:', formErr.message);
      }
    }

    // Log action
    try {
      await sr.entities.CandidateLog.create({
        candidate_id: created.id || 'new',
        candidate_name: candidate_data.full_name || '',
        action: 'create',
        changed_by_name: actor?.name || 'Неизвестно',
        changed_by_role: actor?.role || 'admin',
        agency_name: actor?.agency_name || '',
        changes: '',
        timestamp: new Date().toISOString(),
      });
    } catch (logErr) {
      console.error('Log creation failed:', logErr.message);
    }

    return Response.json({
      success: true,
      candidate: created,
      form_record: formRecord,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});