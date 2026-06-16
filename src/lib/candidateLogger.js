/**
 * Логирование действий с кандидатами.
 * Вызывается из Candidates.jsx и AgencyWorkspace.jsx
 */
import { base44 } from '@/api/base44Client';

/**
 * action: 'create' | 'update' | 'delete'
 * candidate: объект кандидата
 * oldData: предыдущее состояние (для update)
 * actor: { name, role: 'admin'|'agency', agency_name? }
 */
export async function logCandidateAction({ action, candidate, oldData, actor }) {
  let changes = null;

  if (action === 'update' && oldData) {
    const diff = {};
    const FIELDS = ['full_name','position','phone','birth_date','citizenship','birth_place',
      'health_status','city','assembly_point','arrival_date','sb_check','medical_check',
      'comment','payment_basis','payment_made','is_archived'];
    for (const f of FIELDS) {
      if (String(oldData[f] ?? '') !== String(candidate[f] ?? '')) {
        diff[f] = { from: oldData[f] ?? '', to: candidate[f] ?? '' };
      }
    }
    changes = Object.keys(diff).length > 0 ? JSON.stringify(diff) : null;
    if (!changes) return; // Ничего не изменилось — лог не нужен
  }

  await base44.entities.CandidateLog.create({
    candidate_id: candidate.id || 'new',
    candidate_name: candidate.full_name || '',
    action,
    changed_by_name: actor?.name || 'Неизвестно',
    changed_by_role: actor?.role || 'admin',
    agency_name: actor?.agency_name || '',
    changes: changes || '',
    timestamp: new Date().toISOString(),
  });
}