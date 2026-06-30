/**
 * Утилиты для проверки обязательных документов кандидата.
 */

export const REQUIRED_DOC_TYPES = [
  { id: 'passport_main', label: 'Паспорт (разворот с фото)' },
  { id: 'passport_reg', label: 'Паспорт (страница с пропиской)' },
  { id: 'snils', label: 'СНИЛС' },
];

/**
 * Возвращает список обязательных документов, которых нет в загруженных.
 * @param {Array} docs — массив документов (из candidate.documents или form.uploaded_docs)
 * @returns {Array} — отсутствующие обязательные типы
 */
export function getMissingRequiredDocs(docs = []) {
  const uploadedTypes = new Set(
    docs.map(d => d.doc_type || d.type).filter(Boolean)
  );
  return REQUIRED_DOC_TYPES.filter(dt => !uploadedTypes.has(dt.id));
}

/**
 * Проверяет, есть ли у кандидата незагруженные обязательные документы.
 * Учитывает только кандидатов с заполненной анкетой или с хотя бы одним документом.
 * @param {Object} candidate — запись кандидата
 * @returns {boolean}
 */
export function hasMissingRequiredDocs(candidate) {
  if (!candidate) return false;
  const docs = candidate.documents || [];
  const missing = getMissingRequiredDocs(docs);
  if (candidate.form_status === 'completed') return missing.length > 0;
  if (docs.length > 0) return missing.length > 0;
  return false;
}