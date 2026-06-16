/**
 * Утилиты для определения дублей кандидатов.
 * Правила:
 * - регистр игнорируется
 * - е = ё
 * - отсутствие отчества не мешает (сравниваем по первым двум словам если у одного из двух нет отчества)
 */

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameParts(fullName) {
  return normalize(fullName).split(' ').filter(Boolean);
}

/**
 * Возвращает true если два ФИО совпадают с учётом правил
 */
export function namesMatch(a, b) {
  const pa = nameParts(a);
  const pb = nameParts(b);
  if (pa.length === 0 || pb.length === 0) return false;

  // Фамилия и имя должны совпасть
  if (pa[0] !== pb[0]) return false;
  if (pa.length >= 2 && pb.length >= 2 && pa[1] !== pb[1]) return false;

  return true;
}

/**
 * Принимает список кандидатов (с полями id, full_name, birth_date, created_date).
 * Возвращает Set из id дублей (т.е. НЕ первого по дате добавления).
 */
export function findDuplicateIds(candidates) {
  const duplicates = new Set();

  // Сортируем по дате создания — самый ранний идёт первым
  const sorted = [...candidates].sort((a, b) => {
    const da = new Date(a.created_date || 0).getTime();
    const db = new Date(b.created_date || 0).getTime();
    return da - db;
  });

  for (let i = 0; i < sorted.length; i++) {
    if (duplicates.has(sorted[i].id)) continue; // уже помечен как дубль
    for (let j = i + 1; j < sorted.length; j++) {
      if (duplicates.has(sorted[j].id)) continue;
      const sameDate = sorted[i].birth_date && sorted[j].birth_date &&
        sorted[i].birth_date === sorted[j].birth_date;
      if (sameDate && namesMatch(sorted[i].full_name, sorted[j].full_name)) {
        duplicates.add(sorted[j].id);
      }
    }
  }

  return duplicates;
}