import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { candidate_id, agency_id } = body;

    let query: any = {};
    if (candidate_id) {
      query.candidate_id = candidate_id;
    } else if (agency_id) {
      const candidates = await base44.entities.Candidate.filter({ agency_id });
      const candidateIds = candidates.map(c => c.id);
      if (candidateIds.length === 0) {
        return Response.json({ message: 'No candidates found for this agency', forms: [] });
      }
      query.candidate_id = { $in: candidateIds };
    } else {
      return Response.json({ error: 'candidate_id or agency_id required' }, { status: 400 });
    }

    const forms = await base44.entities.CandidateForm.filter(query, '-created_date', 100);

    const requiredDocs = [
      { id: 'passport', label: 'Паспорт РФ', required: true },
      { id: 'birth_cert', label: 'Свидетельство о рождении', required: false },
      { id: 'medical_book', label: 'Медицинская книжка', required: true },
      { id: 'driving_license', label: 'Водительское удостоверение', required: false },
      { id: 'education_cert', label: 'Диплом об образовании', required: true }
    ];

    const results = forms.map(form => {
      const uploadedDocTypes = new Set((form.uploaded_docs || []).map(d => d.doc_type));
      const missing = requiredDocs.filter(d => d.required && !uploadedDocTypes.has(d.id));

      return {
        candidate_id: form.candidate_id,
        form_status: form.status,
        uploaded_count: form.uploaded_docs?.length || 0,
        missing_required: missing.map(m => m.label),
        is_complete: missing.length === 0,
        documents: (form.uploaded_docs || []).map(d => ({
          type: d.doc_type,
          name: d.name,
          uploaded_at: d.uploaded_at
        }))
      };
    });

    return Response.json({
      status: 'success',
      total_forms: results.length,
      complete: results.filter(r => r.is_complete).length,
      incomplete: results.filter(r => !r.is_complete).length,
      forms: results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});