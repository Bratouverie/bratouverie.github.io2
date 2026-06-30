import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle, AlertCircle, AlertTriangle, Loader2, ExternalLink, ChevronDown, ChevronUp, Info, Upload, FileText, Trash2, Download } from 'lucide-react';
import { uploadWithRetry, validateFile } from '@/lib/uploadWithRetry';
import CitySelect from '@/components/CitySelect';
import { getMissingRequiredDocs } from '@/lib/docUtils';

const POSITIONS = ['Разнорабочий','Строитель','Водитель B','Водитель C','Водитель CE','Водитель D','Автослесарь','Инженер связи','Оператор БПЛА','Взрывотехник','Медицинский работник','Охранник'];
const EDUCATION_LEVELS = ['Среднее','Среднее специальное','Неполное высшее','Высшее','Несколько высших'];
const FAMILY_STATUSES = ['Холост/Не замужем','Женат/Замужем','Разведён/Разведена','Вдовец/Вдова'];
const MILITARY_RANKS = ['Рядовой','Ефрейтор','Младший сержант','Сержант','Старший сержант','Старшина','Прапорщик','Офицер','Не служил'];

const CITIZENSHIPS = ['РФ','РБ','Казахстан','Узбекистан','Таджикистан','Киргизия','Туркменистан','Азербайджан','Армения','Молдова','Украина'];

const SKILLS_BY_POSITION = {
  'Разнорабочий': ['Физическая выносливость','Работа с инструментом','Погрузо-разгрузочные работы','Уборка территории','Работа на высоте','Перенос тяжестей','Работа в команде'],
  'Строитель': ['Бетонные работы','Кирпичная кладка','Штукатурные работы','Работа с инструментом','Сварочные работы','Работа на высоте','Чтение чертежей','Арматурные работы','Опалубочные работы'],
  'Водитель B': ['Вождение легкового авто','Знание ПДД','Ориентирование на местности','Мелкий ремонт ТС','Работа с навигатором','Безаварийный стаж'],
  'Водитель C': ['Вождение грузовых авто','Знание ПДД','Такелажные работы','Оформление путевых листов','Мелкий ремонт ТС','Работа с тахографом'],
  'Водитель CE': ['Вождение авто с прицепом','Знание ПДД','Работа с тахографом','Управление полуприцепом','Мелкий ремонт ТС','Оформление путевых листов'],
  'Водитель D': ['Вождение автобуса','Знание ПДД','Работа с пассажирами','Оформление путевых листов','Работа с тахографом','Мелкий ремонт ТС'],
  'Автослесарь': ['Диагностика авто','Ремонт двигателя','Ремонт ходовой части','Сварочные работы','Работа с инструментом','Электрика авто','Шиномонтаж','Работа с документацией'],
  'Инженер связи': ['Монтаж кабельных линий','Настройка оборудования связи','Знание протоколов TCP/IP','Работа с волоконной оптикой','Пайка','Чтение технической документации','Работа с ПК','Диагностика неисправностей'],
  'Оператор БПЛА': ['Управление БПЛА','Обработка аэрофотосъёмки','Работа с ПК','Навигация','Техническое обслуживание БПЛА','Знание воздушного законодательства'],
  'Взрывотехник': ['Взрывные работы','Обращение со взрывчатыми веществами','Работа с документацией','Техника безопасности','Оценка рисков','Маркировка и учёт ВВ'],
  'Медицинский работник': ['Первая медицинская помощь','Введение инъекций','Перевязочные работы','Транспортировка пострадавших','Работа с медоборудованием','Ведение медицинской документации','Реанимационные мероприятия'],
  'Охранник': ['Охрана порядка','Физическая подготовка','Работа с оружием','Видеонаблюдение','Оформление документов','Работа в ЧС','Тактика охраны','Знание законодательства'],
};
const DEFAULT_SKILLS = ['Работа в команде','Физическая выносливость','Работа с документами','Знание ПК'];

const DOCS_READY = [
  'Паспорт РФ','Военный билет / приписное удостоверение',
  'СНИЛС','ИНН','Трудовая книжка','Медицинская книжка',
  'Водительское удостоверение','Диплом об образовании',
  'Свидетельства о допусках / сертификаты',
];

const EMPTY_FORM = {
  full_name: '', birth_date: '', birth_place: '', citizenship: 'РФ',
  registration_address: '', actual_address: '',
  passport_series: '', passport_number: '', passport_issued_by: '',
  passport_issued_date: '', passport_dept_code: '',
  phone: '', email: '', city: '', assembly_point: '', arrival_date: '',
  position: '',
  education_level: '', education_institution: '', education_specialty: '',
  graduation_year: '', additional_certs: '', skills: [],
  work_experience: '', shift_experience: '',
  health_notes: '', chronic_diseases: '', disabilities: '',
  family_status: '', children_count: '',
  emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
  military_rank: '', military_unit: '', military_specialty: '',
  has_criminal_record: '', criminal_record_details: '',
  salary_expectations: '', motivation: '',
  docs_ready: [], ready_to_start_date: '',
  consent_given: false,
};

function prefillFromCandidate(cand) {
  return {
    full_name: cand?.full_name || '',
    birth_date: cand?.birth_date || '',
    birth_place: cand?.birth_place || '',
    citizenship: cand?.citizenship || 'РФ',
    phone: cand?.phone || '',
    city: cand?.city || '',
    assembly_point: cand?.assembly_point || '',
    arrival_date: cand?.arrival_date || '',
    position: cand?.position || '',
  };
}

function prefillFromRecord(rec, cand) {
  return {
    full_name: rec.full_name || cand?.full_name || '',
    birth_date: rec.birth_date || cand?.birth_date || '',
    birth_place: rec.birth_place || cand?.birth_place || '',
    citizenship: rec.citizenship || cand?.citizenship || 'РФ',
    registration_address: rec.registration_address || '',
    actual_address: rec.actual_address || '',
    passport_series: rec.passport_series || '',
    passport_number: rec.passport_number || '',
    passport_issued_by: rec.passport_issued_by || '',
    passport_issued_date: rec.passport_issued_date || '',
    passport_dept_code: rec.passport_dept_code || '',
    phone: rec.phone || cand?.phone || '',
    email: rec.email || '',
    city: rec.city || cand?.city || '',
    assembly_point: rec.assembly_point || cand?.assembly_point || '',
    arrival_date: rec.arrival_date || cand?.arrival_date || '',
    position: rec.position || cand?.position || '',
    education_level: rec.education_level || '',
    education_institution: rec.education_institution || '',
    education_specialty: rec.education_specialty || '',
    graduation_year: rec.graduation_year || '',
    additional_certs: rec.additional_certs || '',
    skills: rec.skills || [],
    work_experience: rec.work_experience || '',
    shift_experience: rec.shift_experience || '',
    health_notes: rec.health_notes || cand?.health_details || '',
    chronic_diseases: rec.chronic_diseases || '',
    disabilities: rec.disabilities || '',
    family_status: rec.family_status || '',
    children_count: rec.children_count || '',
    emergency_contact_name: rec.emergency_contact_name || '',
    emergency_contact_phone: rec.emergency_contact_phone || '',
    emergency_contact_relation: rec.emergency_contact_relation || '',
    military_rank: rec.military_rank || '',
    military_unit: rec.military_unit || '',
    military_specialty: rec.military_specialty || '',
    has_criminal_record: rec.has_criminal_record || '',
    criminal_record_details: rec.criminal_record_details || '',
    salary_expectations: rec.salary_expectations || '',
    motivation: rec.motivation || '',
    docs_ready: rec.docs_ready || [],
    ready_to_start_date: rec.ready_to_start_date || '',
    consent_given: rec.consent_given || false,
  };
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left bg-[#181818] border-b border-[#2a2a2a]">
        <span className="text-sm font-bold text-[#ccc] uppercase tracking-widest">{title}</span>
        {open ? <ChevronUp size={15} className="text-[#666]" /> : <ChevronDown size={15} className="text-[#666]" />}
      </button>
      {open && <div className="px-5 pb-5 pt-4 space-y-4">{children}</div>}
    </div>
  );
}

// Строгий чекбокс «то же самое»
function SameAsCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer mt-1.5 w-fit">
      <div onClick={onChange}
        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-[#555] border-[#888]' : 'border-[#444] bg-transparent hover:border-[#666]'}`}>
        {checked && <CheckCircle size={10} className="text-white" />}
      </div>
      <span className="text-xs text-[#666] select-none">{label}</span>
    </label>
  );
}

export default function CandidateOnboarding() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get('edit') === '1';

  const [formRecord, setFormRecord] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [birthPlaceSameAsCity, setBirthPlaceSameAsCity] = useState(false);
  const [actualSameAsReg, setActualSameAsReg] = useState(false);
  const [showAssemblyTip, setShowAssemblyTip] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [uploadErrors, setUploadErrors] = useState({});

  useEffect(() => {
    const loadForm = async () => {
      let records = await base44.entities.CandidateForm.filter({ form_token: token });
      if (!records.length) {
        // Auto-recover: CandidateForm record missing but Candidate has the token
        const cands = await base44.entities.Candidate.filter({ form_token: token });
        if (cands.length) {
          const cand = cands[0];
          const recovered = await base44.entities.CandidateForm.create({
            candidate_id: cand.id, form_token: token, status: 'pending',
          });
          records = [recovered];
        } else {
          setNotFound(true); setLoading(false); return;
        }
      }
      const rec = records[0];
      setFormRecord(rec);
      const cands = rec.candidate_id
        ? await base44.entities.Candidate.filter({ id: rec.candidate_id })
        : await base44.entities.Candidate.filter({ form_token: token });
      const cand = cands[0] || null;
      setCandidate(cand);
      if (rec.status === 'completed') {
        const filled = prefillFromRecord(rec, cand);
        setForm({ ...EMPTY_FORM, ...filled });
        if (rec.uploaded_docs?.length) setUploadedDocs(rec.uploaded_docs);
        if (filled.actual_address === filled.registration_address && filled.registration_address) setActualSameAsReg(true);
        if (filled.birth_place === filled.city && filled.city) setBirthPlaceSameAsCity(true);
        setIsEditing(editMode);
        setSubmitted(!editMode);
      } else {
        const filled = prefillFromCandidate(cand);
        setForm({ ...EMPTY_FORM, ...filled });
        setIsEditing(true);
      }
      setLoading(false);
    };
    loadForm();
  }, [token, editMode]);

  const toggleArr = (key, val) => setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(s => s !== val) : [...f[key], val] }));
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleBirthPlaceSameToggle = () => {
    const next = !birthPlaceSameAsCity;
    setBirthPlaceSameAsCity(next);
    if (next) set('birth_place', form.city);
  };

  const handleActualSameToggle = () => {
    const next = !actualSameAsReg;
    setActualSameAsReg(next);
    if (next) set('actual_address', form.registration_address);
  };

  const currentSkills = SKILLS_BY_POSITION[form.position] || DEFAULT_SKILLS;

  // Требуемые типы документов
  const REQUIRED_DOC_TYPES = [
    { id: 'passport_main', label: 'Паспорт (разворот с фото)', required: true },
    { id: 'passport_reg', label: 'Паспорт (страница с пропиской)', required: true },
    { id: 'snils', label: 'СНИЛС', required: true },
    { id: 'inn', label: 'ИНН', required: false },
    { id: 'military', label: 'Военный билет / приписное', required: false },
    { id: 'work_book', label: 'Трудовая книжка (первая страница)', required: false },
    { id: 'driver_license', label: 'Водительское удостоверение', required: false },
    { id: 'diploma', label: 'Диплом об образовании', required: false },
    { id: 'medical', label: 'Медицинская книжка', required: false },
    { id: 'certs', label: 'Допуски / сертификаты', required: false },
  ];

  const handleDocUpload = async (docType, docLabel, file) => {
    if (!file) return;
    setUploadErrors(prev => ({ ...prev, [docType]: null }));
    const validationError = validateFile(file);
    if (validationError) { setUploadErrors(prev => ({ ...prev, [docType]: validationError })); return; }
    setUploadingDocType(docType);
    try {
      const file_url = await uploadWithRetry(file);
      const newDoc = { doc_type: docType, name: docLabel + ': ' + file.name, url: file_url, uploaded_at: new Date().toISOString() };
      setUploadedDocs(prev => {
        const filtered = prev.filter(d => d.doc_type !== docType);
        return [...filtered, newDoc];
      });
    } catch (e) {
      setUploadErrors(prev => ({ ...prev, [docType]: `Не удалось загрузить «${file.name}». Проверьте подключение.` }));
    }
    setUploadingDocType(null);
  };

  const removeDoc = (docType) => setUploadedDocs(prev => prev.filter(d => d.doc_type !== docType));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.consent_given) { alert('Необходимо дать согласие на обработку персональных данных'); return; }
    if (!form.full_name || !form.birth_date || !form.phone) {
      alert('Пожалуйста, заполните обязательные поля: ФИО, дату рождения, телефон'); return;
    }
    setSubmitting(true);
    const now = new Date().toISOString();
    const saveData = { ...form, uploaded_docs: uploadedDocs, consent_timestamp: now, submitted_at: now, status: 'completed' };
    await base44.entities.CandidateForm.update(formRecord.id, saveData);
    if (formRecord.candidate_id) {
      await base44.entities.Candidate.update(formRecord.candidate_id, {
        full_name: form.full_name,
        birth_date: form.birth_date,
        birth_place: form.birth_place,
        phone: form.phone,
        city: form.city,
        citizenship: form.citizenship,
        position: form.position,
        arrival_date: form.arrival_date,
        assembly_point: form.assembly_point,
        health_details: form.health_notes,
        form_status: 'completed',
        form_submitted_at: now,
        documents: uploadedDocs,
      });
    }
    try {
      const agencyName = candidate?.agency_name || 'Агентство';
      const subject = `Анкета заполнена: ${form.full_name}`;
      const body = `Кандидат ${form.full_name} заполнил анкету.\n\nАгентство: ${agencyName}\nДолжность: ${form.position || '—'}\nТелефон: ${form.phone}\nEmail: ${form.email || '—'}\n\nПросмотреть: ${window.location.origin}/form/${token}?edit=1`;
      const emailPromises = [];
      if (candidate?.agency_id) {
        const agencies = await base44.entities.Agency.filter({ id: candidate.agency_id });
        if (agencies[0]?.email) emailPromises.push(base44.integrations.Core.SendEmail({ to: agencies[0].email, subject, body, from_name: 'Bratouveriye SNB' }));
        if (agencies[0]?.manager_email) emailPromises.push(base44.integrations.Core.SendEmail({ to: agencies[0].manager_email, subject, body, from_name: 'Bratouveriye SNB' }));
      }
      const admins = await base44.entities.User.filter({ role: 'admin' });
      admins.forEach(admin => { if (admin.email) emailPromises.push(base44.integrations.Core.SendEmail({ to: admin.email, subject, body, from_name: 'Bratouveriye SNB' })); });
      await Promise.allSettled(emailPromises);
    } catch (_) {}
    setFormRecord(prev => ({ ...prev, submitted_at: now, status: 'completed' }));
    setSubmitted(true);
    setIsEditing(false);
    setSubmitting(false);
  };

  // Строгий рабочий стиль
  const inp = "w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2.5 text-sm text-[#e0e0e0] placeholder:text-[#444] focus:outline-none focus:border-[#666] transition-colors";
  const inpRO = "w-full bg-[#141414] border border-[#2a2a2a] rounded px-3 py-2.5 text-sm text-[#555] cursor-not-allowed";
  const lbl = "block text-xs font-semibold text-[#888] mb-1.5 uppercase tracking-wide";

  if (loading) return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[#666]" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
        <h1 className="text-lg font-bold text-white mb-2">Анкета не найдена</h1>
        <p className="text-[#666] text-sm">Ссылка недействительна или устарела.</p>
      </div>
    </div>
  );

  if (submitted && !isEditing) return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700/50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-white mb-3">Анкета отправлена</h1>
        <p className="text-[#888] text-sm leading-relaxed">
          Данные получены и переданы в кадровый отдел.<br />
          Согласие на обработку персональных данных подтверждено.
        </p>
        {formRecord?.submitted_at && (
          <p className="text-[#555] text-xs mt-4">Отправлено: {new Date(formRecord.submitted_at).toLocaleString('ru-RU')}</p>
        )}
        <button onClick={() => { setSubmitted(false); setIsEditing(true); }}
          className="mt-5 px-5 py-2.5 rounded border border-[#333] text-sm text-[#888] hover:text-[#ccc] hover:border-[#555] transition-colors">
          Редактировать анкету
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e0e0e0] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Шапка */}
        <div className="mb-8 pb-6 border-b border-[#222]">
          <div className="flex items-center gap-3 mb-3">
            <img src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png"
              className="w-9 h-9 object-contain" alt="logo" />
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Анкета кандидата</h1>
              <p className="text-[#555] text-xs">ООО «Братоуверие-СНБ» · Программа восстановления ЛНР и ДНР</p>
            </div>
          </div>
          {candidate?.agency_name && (
            <p className="text-[#666] text-sm">Агентство: <span className="text-[#aaa]">{candidate.agency_name}</span></p>
          )}
          {formRecord?.status === 'completed' && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded border border-green-800/60 bg-green-900/20 text-xs text-green-500">
              <CheckCircle size={11} /> Анкета заполнена — режим редактирования
            </div>
          )}
        </div>

        {(() => {
          const missing = getMissingRequiredDocs(uploadedDocs);
          if (missing.length === 0) return null;
          return (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-900/20 border border-red-800/40 text-xs text-red-400">
              <AlertTriangle size={14} className="flex-shrink-0" />
              <span>Не загружено обязательных документов: {missing.length} из 3 — {missing.map(d => d.label).join(', ')}</span>
            </div>
          );
        })()}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* РАЗДЕЛ 1 */}
          <Section title="Раздел 1. Персональные данные">
            <div>
              <label className={lbl}>ФИО <span className="text-red-500">*</span></label>
              <input className={inp} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Иванов Иван Иванович" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Дата рождения <span className="text-red-500">*</span></label>
                <input className={inp} type="date" value={form.birth_date} onChange={e => set('birth_date', e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>Гражданство</label>
                <select className={inp} value={form.citizenship} onChange={e => set('citizenship', e.target.value)}>
                  {CITIZENSHIPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Город проживания — первый, чтобы на него можно было сослаться */}
            <div>
              <label className={lbl}>Город проживания</label>
              <CitySelect
                value={form.city}
                onChange={val => { set('city', val); if (birthPlaceSameAsCity) set('birth_place', val); }}
                inputClassName={inp}
                placeholder="г. Хабаровск"
              />
            </div>

            <div>
              <label className={lbl}>Место рождения</label>
              <input className={inp} value={form.birth_place}
                onChange={e => { set('birth_place', e.target.value); setBirthPlaceSameAsCity(false); }}
                placeholder="г. Москва"
                disabled={birthPlaceSameAsCity} />
              <SameAsCheckbox label="Совпадает с городом проживания" checked={birthPlaceSameAsCity} onChange={handleBirthPlaceSameToggle} />
            </div>

            <div>
              <label className={lbl}>Адрес регистрации (прописка)</label>
              <input className={inp} value={form.registration_address}
                onChange={e => { set('registration_address', e.target.value); if (actualSameAsReg) set('actual_address', e.target.value); }}
                placeholder="г. Хабаровск, ул. Примерная, д. 1, кв. 1" />
            </div>
            <div>
              <label className={lbl}>Фактический адрес проживания</label>
              <input className={inp} value={form.actual_address}
                onChange={e => { set('actual_address', e.target.value); setActualSameAsReg(false); }}
                placeholder="Если отличается от прописки"
                disabled={actualSameAsReg} />
              <SameAsCheckbox label="Совпадает с адресом регистрации" checked={actualSameAsReg} onChange={handleActualSameToggle} />
            </div>

            {/* Пункт сбора + Дата прибытия — визуально связаны */}
            <div className="bg-[#161616] border border-[#2a2a2a] rounded-lg p-4 space-y-3">
              <p className="text-xs text-[#555] uppercase tracking-wide font-semibold">Место и дата прибытия</p>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <label className={lbl + ' mb-0'}>Пункт сбора</label>
                  <div className="relative">
                    <button type="button" onMouseEnter={() => setShowAssemblyTip(true)} onMouseLeave={() => setShowAssemblyTip(false)}
                      onTouchStart={() => setShowAssemblyTip(v => !v)} className="text-[#555] hover:text-[#888] transition-colors">
                      <Info size={13} />
                    </button>
                    {showAssemblyTip && (
                      <div className="absolute left-0 top-5 z-20 w-64 bg-[#1e1e1e] border border-[#333] rounded p-3 text-xs text-[#aaa] leading-relaxed shadow-xl">
                        Ближайший пункт сбора (место прохождения медкомиссии) будет определён после согласования кандидатуры.
                      </div>
                    )}
                  </div>
                </div>
                <input className={inpRO} value={form.assembly_point || 'Будет определён после согласования'} readOnly />
              </div>
              <div>
                <label className={lbl}>Запланированная дата прибытия <span className="text-[#555] font-normal normal-case tracking-normal">— укажите дату</span></label>
                <input className={inp} type="date" value={form.arrival_date} onChange={e => set('arrival_date', e.target.value)} />
              </div>
            </div>

            {/* Паспорт */}
            <div className="pt-3 border-t border-[#222]">
              <p className="text-xs font-semibold text-[#666] uppercase tracking-wide mb-3">Паспорт гражданина РФ</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Серия</label>
                  <input className={inp} value={form.passport_series} onChange={e => set('passport_series', e.target.value)} placeholder="1234" />
                </div>
                <div>
                  <label className={lbl}>Номер</label>
                  <input className={inp} value={form.passport_number} onChange={e => set('passport_number', e.target.value)} placeholder="567890" />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Кем выдан</label>
                  <input className={inp} value={form.passport_issued_by} onChange={e => set('passport_issued_by', e.target.value)} placeholder="МВД России по г. Москва" />
                </div>
                <div>
                  <label className={lbl}>Дата выдачи</label>
                  <input className={inp} type="date" value={form.passport_issued_date} onChange={e => set('passport_issued_date', e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Код подразделения</label>
                  <input className={inp} value={form.passport_dept_code} onChange={e => set('passport_dept_code', e.target.value)} placeholder="770-001" />
                </div>
              </div>
            </div>

            {/* Контакты */}
            <div className="pt-3 border-t border-[#222]">
              <p className="text-xs font-semibold text-[#666] uppercase tracking-wide mb-3">Контактные данные</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Телефон <span className="text-red-500">*</span></label>
                  <input className={inp} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+7 (___) ___-__-__" required />
                </div>
                <div>
                  <label className={lbl}>Email</label>
                  <input className={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="example@mail.ru" />
                </div>
              </div>
            </div>
          </Section>

          {/* РАЗДЕЛ 2 */}
          <Section title="Раздел 2. Специализация и квалификация">
            <div>
              <label className={lbl}>Желаемая должность</label>
              <select className={inp} value={form.position} onChange={e => { set('position', e.target.value); set('skills', []); }}>
                <option value="">Выберите должность...</option>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Уровень образования</label>
                <select className={inp} value={form.education_level} onChange={e => set('education_level', e.target.value)}>
                  <option value="">Выберите...</option>
                  {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Год окончания</label>
                <input className={inp} value={form.graduation_year} onChange={e => set('graduation_year', e.target.value)} placeholder="2010" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Учебное заведение</label>
                <input className={inp} value={form.education_institution} onChange={e => set('education_institution', e.target.value)} placeholder="ДВГТУ, г. Владивосток" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Специальность по диплому</label>
                <input className={inp} value={form.education_specialty} onChange={e => set('education_specialty', e.target.value)} placeholder="Строительство зданий и сооружений" />
              </div>
            </div>
            <div>
              <label className={lbl}>Дополнительные допуски и сертификаты</label>
              <textarea className={inp + ' resize-none'} rows={2} value={form.additional_certs} onChange={e => set('additional_certs', e.target.value)} placeholder="Удостоверение сварщика, права категории C, допуск к работе на высоте..." />
            </div>
            <div>
              <label className={lbl}>Профессиональные навыки{form.position ? ` — ${form.position}` : ''}</label>
              {!form.position && <p className="text-xs text-[#555] mb-2">Выберите должность для персонализированного списка</p>}
              <div className="flex flex-wrap gap-2 mt-1">
                {currentSkills.map(skill => (
                  <button key={skill} type="button" onClick={() => toggleArr('skills', skill)}
                    className={`px-3 py-1.5 rounded text-xs transition-colors border ${form.skills.includes(skill) ? 'bg-[#333] border-[#555] text-white' : 'bg-transparent border-[#2a2a2a] text-[#666] hover:border-[#444] hover:text-[#999]'}`}>
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* РАЗДЕЛ 3 */}
          <Section title="Раздел 3. Опыт работы вахтовым методом">
            <div>
              <label className={lbl}>Общий опыт работы</label>
              <textarea className={inp + ' resize-none'} rows={4} value={form.work_experience} onChange={e => set('work_experience', e.target.value)} placeholder="Укажите последние места работы: организация, должность, период, причина увольнения..." />
            </div>
            <div>
              <label className={lbl}>Опыт работы вахтовым методом</label>
              <textarea className={inp + ' resize-none'} rows={2} value={form.shift_experience} onChange={e => set('shift_experience', e.target.value)} placeholder="Регион, объект, продолжительность вахты, работодатель..." />
            </div>
          </Section>

          {/* РАЗДЕЛ 4 */}
          <Section title="Раздел 4. Состояние здоровья" defaultOpen={false}>
            <div>
              <label className={lbl}>Хронические заболевания</label>
              <input className={inp} value={form.chronic_diseases} onChange={e => set('chronic_diseases', e.target.value)} placeholder="Нет / перечислите при наличии" />
            </div>
            <div>
              <label className={lbl}>Инвалидность / ограничения по здоровью</label>
              <input className={inp} value={form.disabilities} onChange={e => set('disabilities', e.target.value)} placeholder="Нет / укажите при наличии" />
            </div>
            <div>
              <label className={lbl}>Дополнительные сведения</label>
              <textarea className={inp + ' resize-none'} rows={2} value={form.health_notes} onChange={e => set('health_notes', e.target.value)} placeholder="Аллергии, особые требования к условиям труда..." />
            </div>
          </Section>

          {/* РАЗДЕЛ 5 */}
          <Section title="Раздел 5. Семья и близкие" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Семейное положение</label>
                <select className={inp} value={form.family_status} onChange={e => set('family_status', e.target.value)}>
                  <option value="">Выберите...</option>
                  {FAMILY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Количество детей</label>
                <input className={inp} type="number" min="0" value={form.children_count} onChange={e => set('children_count', e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="pt-3 border-t border-[#222]">
              <p className="text-xs text-[#666] mb-3">Контактное лицо на случай экстренной связи</p>
              <div className="space-y-3">
                <div>
                  <label className={lbl}>ФИО</label>
                  <input className={inp} value={form.emergency_contact_name} onChange={e => set('emergency_contact_name', e.target.value)} placeholder="Иванова Мария Ивановна" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Телефон</label>
                    <input className={inp} type="tel" value={form.emergency_contact_phone} onChange={e => set('emergency_contact_phone', e.target.value)} placeholder="+7 ___" />
                  </div>
                  <div>
                    <label className={lbl}>Степень родства</label>
                    <input className={inp} value={form.emergency_contact_relation} onChange={e => set('emergency_contact_relation', e.target.value)} placeholder="Супруга, мать..." />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* РАЗДЕЛ 6 */}
          <Section title="Раздел 6. Воинский учёт (для мужчин)" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Воинское звание</label>
                <select className={inp} value={form.military_rank} onChange={e => set('military_rank', e.target.value)}>
                  <option value="">Выберите...</option>
                  {MILITARY_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Военная специальность</label>
                <input className={inp} value={form.military_specialty} onChange={e => set('military_specialty', e.target.value)} placeholder="ВУС 100" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Воинская часть / место службы</label>
                <input className={inp} value={form.military_unit} onChange={e => set('military_unit', e.target.value)} placeholder="В/ч 12345, г. Хабаровск" />
              </div>
            </div>
          </Section>

          {/* РАЗДЕЛ 7 */}
          <Section title="Раздел 7. Судимость" defaultOpen={false}>
            <div>
              <label className={lbl}>Наличие судимостей</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {['Нет','Да, погашена','Да, действующая'].map(opt => (
                  <button key={opt} type="button" onClick={() => set('has_criminal_record', opt)}
                    className={`flex-1 min-w-[90px] py-2.5 rounded text-sm border transition-colors ${form.has_criminal_record === opt ? 'bg-[#2a2a2a] border-[#555] text-white' : 'bg-transparent border-[#222] text-[#666] hover:border-[#444]'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            {form.has_criminal_record && form.has_criminal_record !== 'Нет' && (
              <div>
                <label className={lbl}>Подробности</label>
                <textarea className={inp + ' resize-none'} rows={2} value={form.criminal_record_details} onChange={e => set('criminal_record_details', e.target.value)} placeholder="Статья, год, срок..." />
              </div>
            )}
          </Section>

          {/* РАЗДЕЛ 8 */}
          <Section title="Раздел 8. Мотивация и ожидания" defaultOpen={false}>
            <div>
              <label className={lbl}>Ожидаемая заработная плата</label>
              <input className={inp} value={form.salary_expectations} onChange={e => set('salary_expectations', e.target.value)} placeholder="от 300 000 ₽ / мес." />
            </div>
            <div>
              <label className={lbl}>Мотивация / почему хотите участвовать в программе</label>
              <textarea className={inp + ' resize-none'} rows={3} value={form.motivation} onChange={e => set('motivation', e.target.value)} placeholder="Опишите вашу мотивацию..." />
            </div>
          </Section>

          {/* РАЗДЕЛ 9 */}
          <Section title="Раздел 9. Готовность документов" defaultOpen={false}>
            <div>
              <label className={lbl}>Имеющиеся документы (отметьте)</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DOCS_READY.map(doc => (
                  <button key={doc} type="button" onClick={() => toggleArr('docs_ready', doc)}
                    className={`px-3 py-1.5 rounded text-xs transition-colors border ${form.docs_ready.includes(doc) ? 'bg-[#2a2a2a] border-[#555] text-white' : 'bg-transparent border-[#222] text-[#666] hover:border-[#444] hover:text-[#999]'}`}>
                    {doc}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={lbl}>Готов приступить к работе с</label>
              <input className={inp} type="date" value={form.ready_to_start_date} onChange={e => set('ready_to_start_date', e.target.value)} />
            </div>
          </Section>

          {/* РАЗДЕЛ 10: Загрузка документов */}
          <Section title="Раздел 10. Загрузка документов" defaultOpen={false}>
            <p className="text-xs text-[#666] leading-relaxed">
              Загрузите сканы или фотографии документов. Форматы: JPG, PNG, PDF, HEIC (iPhone). Обязательные документы отмечены <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {REQUIRED_DOC_TYPES.map(dt => {
                const uploaded = uploadedDocs.find(d => d.doc_type === dt.id);
                return (
                  <div key={dt.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-[#161616] border border-[#2a2a2a] rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[#888] font-medium">
                        {dt.label}{dt.required && <span className="text-red-500 ml-1">*</span>}
                      </div>
                      {uploaded && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <FileText size={11} className="text-green-500 flex-shrink-0" />
                          <span className="text-xs text-green-500 truncate">{uploaded.name.split(': ')[1] || uploaded.name}</span>
                        </div>
                      )}
                      {uploadErrors[dt.id] && (
                        <div className="flex items-start gap-1.5 mt-1">
                          <AlertTriangle size={11} className="text-red-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-red-400">{uploadErrors[dt.id]}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-auto">
                      {uploadingDocType === dt.id ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#666]">
                          <Loader2 size={12} className="animate-spin" /> Загрузка...
                        </div>
                      ) : (
                        <>
                          {uploaded && (
                            <>
                              <a href={uploaded.url} target="_blank" rel="noreferrer"
                                className="p-1.5 rounded border border-[#333] text-[#666] hover:text-[#aaa] transition-colors">
                                <Download size={12} />
                              </a>
                              <button type="button" onClick={() => removeDoc(dt.id)}
                                className="p-1.5 rounded border border-[#333] text-[#666] hover:text-red-400 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                          <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs cursor-pointer transition-colors ${uploaded ? 'border-[#333] text-[#666] hover:border-[#555]' : 'border-[#444] text-[#aaa] hover:border-[#666]'}`}>
                            <Upload size={11} />
                            {uploaded ? 'Заменить' : 'Загрузить'}
                            <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf,.heic,.heif,.webp,.bmp,.gif,.tiff"
                              onChange={e => e.target.files?.[0] && handleDocUpload(dt.id, dt.label, e.target.files[0])} />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {uploadErrors && Object.values(uploadErrors).some(Boolean) && (
              <div className="space-y-1">
                {Object.entries(uploadErrors).filter(([, v]) => v).map(([docType, err]) => (
                  <div key={docType} className="flex items-start gap-2 px-3 py-2 bg-red-900/20 border border-red-800/40 rounded text-xs text-red-400">
                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* РАЗДЕЛ 11 */}
          <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-5">
            <h2 className="text-sm font-bold text-[#aaa] uppercase tracking-widest mb-3">Раздел 11. Подпись и согласие</h2>
            <p className="text-xs text-[#666] leading-relaxed mb-3">
              Подтверждаю достоверность указанных данных. Даю согласие на обработку персональных данных
              в соответствии с Федеральным законом №152-ФЗ «О персональных данных».
            </p>
            <a href="/consent" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#666] hover:text-[#aaa] underline mb-4 transition-colors">
              <ExternalLink size={11} /> Полный текст согласия на обработку ПДн
            </a>
            <label className="flex items-start gap-3 cursor-pointer mt-3" onClick={() => set('consent_given', !form.consent_given)}>
              <div className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${form.consent_given ? 'bg-[#555] border-[#888]' : 'border-[#444] hover:border-[#666]'}`}>
                {form.consent_given && <CheckCircle size={11} className="text-white" />}
              </div>
              <span className="text-sm text-[#888] leading-relaxed">
                <strong className="text-[#ccc]">Согласен(а)</strong> на обработку персональных данных.
                Все указанные сведения достоверны.
              </span>
            </label>
          </div>

          <button type="submit" disabled={submitting || !form.consent_given}
            className="w-full py-3.5 rounded bg-[#333] text-white font-bold text-sm hover:bg-[#444] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-[#444]">
            {submitting
              ? <><Loader2 size={16} className="animate-spin" /> Сохранение...</>
              : formRecord?.status === 'completed' ? 'Сохранить изменения' : 'Подписать и отправить анкету'}
          </button>
          <p className="text-center text-xs text-[#444] pb-4">* — обязательные для заполнения поля</p>
        </form>
      </div>
    </div>
  );
}