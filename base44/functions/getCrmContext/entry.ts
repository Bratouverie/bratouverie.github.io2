import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// =====================================================
// ЕДИНЫЙ ИСТОЧНИК ЗНАНИЙ ДЛЯ АГЕНТА
// При обновлении сайта (FAQ, контакты, инструкция) —
// обновляйте этот блок, чтобы агент всегда владел актуальными данными
// =====================================================
const KNOWLEDGE_BASE = {
  company: {
    name: 'ООО «Братоуверие-СНБ»',
    ogrn: '1262500006966',
    inn: '2511135442',
    program: 'Программа восстановления ЛНР и ДНР',
  },
  contacts: {
    phones: [
      { label: 'Приёмная', value: '+7 (4212) 51-59-30' },
      { label: 'Горячая линия', value: '+7 (499) 686-46-30' },
    ],
    emails: [
      'partner@bratouverie-snb.ru',
      'mikhliaev@bratouverie-snb.ru',
    ],
    addresses: [
      { label: 'Юридический адрес', value: '692510, Приморский край, г. Уссурийск, пер. Мирный, д.1' },
      { label: 'Офис', value: 'г. Хабаровск, ул. Карла Маркса, 66' },
    ],
    crm_login_url: 'https://bratouverie-snb.base44.app/agency-login',
  },
  program_conditions: {
    salary: '300 000–470 000 ₽/мес',
    one_time_payment: '2 500 000 ₽',
    shift_duration: 'от 3 месяцев (вахтовый метод)',
    locations: 'Мариуполь, Макеевка, Луганск, Алчевск',
    housing: 'Бесплатно (проживание и питание)',
    travel_compensation: 'Проезд компенсируется после трудоустройства (билеты сохранить)',
    contract_type: 'ТК РФ, официальное трудоустройство',
    legal_basis: 'Постановление Правительства РФ №2255',
  },
  workflow: [
    '1. Отклик кандидата — зафиксировать ФИО, телефон, город',
    '2. Телефонное интервью (10–15 мин)',
    '3. Создание карточки в CRM (в течение 1 часа после интервью)',
    '4. Отправка ссылки на анкету кандидату (WhatsApp/Telegram)',
    '5. Контроль заполнения анкеты (напомнить через 2 дня)',
    '6. После заполнения — передача на проверку СБ',
    '7. Медкомиссия (назначает координатор)',
    '8. Оформление и отправка на объект (база в г. Макевка, ДНР)',
  ],
  candidate_card_required: ['ФИО (полностью)', 'Дата рождения (важна для стоп-листа)', 'Телефон', 'Должность/специализация', 'Город проживания'],
  stop_list: 'При создании карточки CRM автоматически проверяет кандидата по ФИО + дата рождения. Дубли блокируются, вознаграждение не начисляется.',
  faq: [
    { q: 'Это легально?', a: 'Да. Постановление Правительства РФ №2255. Официальное трудоустройство по ТК РФ.' },
    { q: 'Когда придут 2,5 миллиона?', a: 'Первая часть — первая рабочая неделя, вторая — вторая рабочая неделя, на банковскую карту.' },
    { q: 'Нас не мобилизуют?', a: 'Официального освобождения нет, но на уровне командования действует запрет на мобилизацию сотрудников программы.' },
    { q: 'Можно с семьёй?', a: 'Нет. Проживание рассчитано на одного человека. Это вахта, не переезд на ПМЖ.' },
    { q: 'Какой график работы?', a: 'Вахтовый метод, контракт от 3 месяцев. График фиксируется в трудовом договоре.' },
    { q: 'Сколько человек в комнате?', a: 'Условия проживания — на vosstanovim-dnr.ru' },
    { q: 'Компенсация проезда?', a: 'Кандидат едет самостоятельно, билеты сохраняет — компенсация поступает после трудоустройства.' },
  ],
  categories: [
    { title: 'Строители', items: ['Разряд от 3-го', 'Специализация: общестрой / отделка / сантехника / электрика / кровля / монолит', 'Допуски: электробезопасность, высота, газ', 'Опыт на высоте свыше 1,8 м'] },
    { title: 'Разнорабочие', items: ['Опыт на стройке (мин. 3–6 мес.)', 'Готовность к физической нагрузке (до 25 кг)', 'Медкнижка (для пищевых)', 'Опыт вахты'] },
    { title: 'Водители', items: ['Категория: B / BC / CE / CD', 'Опыт вождения (лет)', 'Тип техники: легковой / грузовой / самосвал / фура / спецтехника', 'ДТП за 3 года, карта тахографа (C,D,CE)'] },
    { title: 'Автослесари', items: ['Профиль: легковые / грузовые / спецтехника', 'Диагностика электрики, гидравлика, АКПП', 'Свой инструмент'] },
    { title: 'Охранники', items: ['Удостоверение ЧОП (разряд)', 'Специфика: пост / досмотр / видео / СКУД', 'Ночные смены, режимные объекты'] },
    { title: 'Инженеры связи', items: ['Профиль: оптоволокно / радиосвязь / IT-сети', 'Группа допуска по электробезопасности', 'Cisco, Huawei, Mikrotik'] },
    { title: 'Операторы БПЛА', items: ['Лицензия пилота (обязательно)', 'Тип дронов, опыт применения', 'Работа в условиях ограниченной связи'] },
    { title: 'Взрывотехники', items: ['Допуск группы А (обязательно)', 'Профиль: промышленный / военный / горный', 'Опыт работы с ВВ (лет)'] },
    { title: 'Медработники', items: ['Специализация: фельдшер / медсестра / врач', 'Действующий сертификат (обязательно)', 'Опыт полевой работы'] },
  ],
  common_errors: [
    { error: 'Незнание условий программы', fix: 'Выучить Разделы 1–2 наизусть' },
    { error: 'Обещание того, чего нет', fix: 'Говорить только то, что есть в программе' },
    { error: 'Непроверка документов', fix: 'Использовать чеклист перед подачей' },
    { error: 'Пропуск дублей', fix: 'Всегда проверять через CRM перед подачей' },
    { error: 'Потеря контакта с кандидатом', fix: 'Фиксировать WhatsApp/Telegram, дублировать напоминания' },
    { error: 'Отправка без готовых документов', fix: 'Перезвонить за 1–2 дня, проверить наличие' },
    { error: 'Обсуждение политики', fix: '«Мы работаем с государственной программой» — и всё' },
  ],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Получаем актуальные данные CRM
    const [candidates, cities, tickets] = await Promise.all([
      base44.asServiceRole.entities.Candidate.list('-created_date', 500),
      base44.asServiceRole.entities.City.list('-created_date', 500),
      base44.asServiceRole.entities.AgentTicket.filter({ status: 'open' }, '-created_date', 50),
    ]);

    const active = candidates.filter(c => !c.is_archived && !c.deleted_at);
    const cityNames = new Set(cities.map(c => c.name.toLowerCase()));

    // Кандидаты без пункта сбора
    const withoutAssembly = active
      .filter(c => c.city && !c.assembly_point)
      .slice(0, 20)
      .map(c => ({ id: c.id, full_name: c.full_name, city: c.city, phone: c.phone, position: c.position }));

    // Города кандидатов, которых нет в справочнике City
    const candidateCities = {};
    active.forEach(c => {
      if (c.city) {
        const key = c.city.toLowerCase();
        if (!cityNames.has(key)) {
          candidateCities[key] = (candidateCities[key] || 0) + 1;
        }
      }
    });
    const newCities = Object.entries(candidateCities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([city, count]) => ({ city, candidates_count: count }));

    // Кандидаты без обязательных документов
    const completedForms = active.filter(c => c.form_status === 'completed').length;
    const pendingForms = active.filter(c => c.form_status === 'pending').length;

    // Статусы
    const stats = {
      total_candidates: candidates.length,
      active_candidates: active.length,
      archived: candidates.length - active.length,
      sb_approved: active.filter(c => c.sb_check === 'Согласован').length,
      sb_rejected: active.filter(c => c.sb_check === 'Не согласован').length,
      medical_passed: active.filter(c => c.medical_check === 'Прошёл').length,
      ready_for_payment: active.filter(c => c.payment_basis === 'Готовится к отправке').length,
      paid: active.filter(c => c.payment_made === 'Да').length,
      completed_forms: completedForms,
      pending_forms: pendingForms,
      cities_in_catalog: cities.length,
      open_tickets: tickets.length,
    };

    return Response.json({
      user: { name: user.full_name || user.email, role: user.role, email: user.email },
      knowledge_base: KNOWLEDGE_BASE,
      crm_stats: stats,
      candidates_without_assembly_point: withoutAssembly,
      candidate_cities_not_in_catalog: newCities,
      assembly_points: cities
        .filter(c => c.is_assembly_point === true)
        .map(c => ({ name: c.name, region: c.region || '' }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      open_tickets: tickets.slice(0, 10).map(t => ({
        id: t.id, question: t.question, asked_by: t.asked_by_name,
        category: t.category, priority: t.priority, created_date: t.created_date,
      })),
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});