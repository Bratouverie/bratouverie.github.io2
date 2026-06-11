import { useState } from 'react';
import { X, Upload, Trash2, Download, FileText, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const POSITIONS = ['Разнорабочий','Строитель','Водитель B','Водитель C','Водитель CE','Водитель D','Автослесарь','Инженер связи','Оператор БПЛА','Взрывотехник','Медицинский работник','Охранник'];

export default function CandidateModal({ candidate, agencies, lockedAgencyId, onSave, onClose }) {
  const isAgencyMode = !!lockedAgencyId; // режим агентства — без выбора агентства и статусов

  const [form, setForm] = useState({
    full_name: candidate?.full_name || '',
    position: candidate?.position || '',
    agency_id: candidate?.agency_id || lockedAgencyId || '',
    agency_name: candidate?.agency_name || (agencies?.find(a => a.id === lockedAgencyId)?.name || ''),
    birth_date: candidate?.birth_date || '',
    citizenship: candidate?.citizenship || '',
    birth_place: candidate?.birth_place || '',
    health_status: candidate?.health_status || 'Без замечаний',
    health_details: candidate?.health_details || '',
    city: candidate?.city || '',
    assembly_point: candidate?.assembly_point || '',
    arrival_date: candidate?.arrival_date || '',
    sb_check: candidate?.sb_check || 'Не проверялся',
    medical_check: candidate?.medical_check || 'Не проверялся',
    comment: candidate?.comment || '',
    payment_basis: candidate?.payment_basis || '',
    payment_made: candidate?.payment_made || 'Нет',
    documents: candidate?.documents || [],
  });

  const [uploading, setUploading]   = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const [stopList, setStopList]     = useState(null); // {full_name, agency_name}
  const [checking, setChecking]     = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAgencyChange = (agencyId) => {
    const agency = agencies.find(a => a.id === agencyId);
    set('agency_id', agencyId);
    set('agency_name', agency?.name || '');
  };

  // Проверка стоп-листа при изменении ФИО или даты рождения
  const checkStopList = async (full_name, birth_date) => {
    if (!full_name || !birth_date) { setStopList(null); return; }
    setChecking(true);
    const found = await base44.entities.Candidate.filter({ full_name, birth_date });
    // Исключаем текущего редактируемого кандидата
    const others = found.filter(c => c.id !== candidate?.id);
    if (others.length > 0) {
      setStopList({ full_name: others[0].full_name, agency_name: others[0].agency_name });
    } else {
      setStopList(null);
    }
    setChecking(false);
  };

  const handleNameChange = (v) => {
    set('full_name', v);
    checkStopList(v, form.birth_date);
  };

  const handleBirthDateChange = (v) => {
    set('birth_date', v);
    checkStopList(form.full_name, v);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    const newDocs = [];
    for (const file of files) {
      if (file.name.endsWith('.exe')) continue;
      if (file.size > 20 * 1024 * 1024) continue;
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newDocs.push({ name: file.name, url: file_url, type: file.type, uploaded_at: new Date().toISOString().split('T')[0] });
    }
    set('documents', [...(form.documents || []), ...newDocs]);
    setUploading(false);
  };

  const handleFileInput = (e) => { if (e.target.files) uploadFiles(Array.from(e.target.files)); };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(Array.from(e.dataTransfer.files));
  };

  const removeDoc = (i) => {
    const docs = [...(form.documents || [])];
    docs.splice(i, 1);
    set('documents', docs);
  };

  const handleSaveClick = () => {
    if (stopList) return; // блокируем сохранение
    onSave(form, candidate?.id);
  };

  const inp = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#F8FAFC]/25 focus:outline-none focus:border-[#7B3FBF] transition-all";
  const paymentAmount = form.payment_basis === 'Готовится к отправке' ? '100 000 ₽' : form.payment_basis === 'Отказался от отправки' ? 'Не предусмотрена' : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0D1B3E] border border-[rgba(123,63,191,0.25)] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[rgba(123,63,191,0.15)] sticky top-0 bg-[#0D1B3E] z-10">
          <h2 className="text-lg font-black text-[#F8FAFC]">{candidate ? 'Редактировать кандидата' : 'Новый кандидат'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all text-[#F8FAFC]/60"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Стоп-лист предупреждение */}
          {stopList && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-red-400">СТОП-ЛИСТ: Кандидат уже в базе</div>
                <div className="text-xs text-red-300/80 mt-1">
                  «{stopList.full_name}» с такой датой рождения уже зарегистрирован
                  {stopList.agency_name ? ` (агентство: ${stopList.agency_name})` : ''}.
                  Сохранение заблокировано.
                </div>
              </div>
            </div>
          )}

          {/* Base info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">ФИО *</label>
              <input className={inp} value={form.full_name} onChange={e => handleNameChange(e.target.value)} placeholder="Иванов Иван Иванович" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Должность</label>
              <select className={inp} value={form.position} onChange={e => set('position', e.target.value)}>
                <option value="">Выберите...</option>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {/* Агентство показываем только в режиме администратора */}
            {!isAgencyMode && (
              <div>
                <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Кадровое агентство</label>
                <select className={inp} value={form.agency_id} onChange={e => handleAgencyChange(e.target.value)}>
                  <option value="">Выберите...</option>
                  {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Дата рождения</label>
              <input className={inp} type="date" value={form.birth_date} onChange={e => handleBirthDateChange(e.target.value)} />
              {checking && <p className="text-xs text-[#F8FAFC]/30 mt-1">Проверка стоп-листа...</p>}
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Гражданство</label>
              <input className={inp} value={form.citizenship} onChange={e => set('citizenship', e.target.value)} placeholder="РФ" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Место рождения</label>
              <input className={inp} value={form.birth_place} onChange={e => set('birth_place', e.target.value)} placeholder="г. Москва" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Город проживания</label>
              <input className={inp} value={form.city} onChange={e => set('city', e.target.value)} placeholder="г. Хабаровск" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Пункт сбора</label>
              <input className={inp} value={form.assembly_point} onChange={e => set('assembly_point', e.target.value)} placeholder="г. Хабаровск" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Дата прибытия</label>
              <input className={inp} type="date" value={form.arrival_date} onChange={e => set('arrival_date', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Состояние здоровья</label>
              <select className={inp} value={form.health_status} onChange={e => set('health_status', e.target.value)}>
                <option value="Без замечаний">Без замечаний</option>
                <option value="Ограничения/жалобы">Ограничения/жалобы</option>
              </select>
            </div>
            {form.health_status === 'Ограничения/жалобы' && (
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Описание ограничений</label>
                <input className={inp} value={form.health_details} onChange={e => set('health_details', e.target.value)} placeholder="Укажите ограничения..." />
              </div>
            )}
          </div>

          {/* Admin statuses — только для администратора */}
          {!isAgencyMode && (
            <div className="border-t border-[rgba(123,63,191,0.15)] pt-4">
              <div className="text-xs text-[#7B3FBF] font-bold uppercase tracking-widest mb-3">Статусы (только администратор)</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Проверка СБ</label>
                  <select className={inp} value={form.sb_check} onChange={e => set('sb_check', e.target.value)}>
                    <option>Не проверялся</option>
                    <option>Согласован</option>
                    <option>Не согласован</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Медкомиссия</label>
                  <select className={inp} value={form.medical_check} onChange={e => set('medical_check', e.target.value)}>
                    <option>Не проверялся</option>
                    <option>Прошёл</option>
                    <option>Не прошёл</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Основание для выплаты</label>
                  <select className={inp} value={form.payment_basis} onChange={e => set('payment_basis', e.target.value)}>
                    <option value="">Не указано</option>
                    <option>Готовится к отправке</option>
                    <option>Отказался от отправки</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">
                    Выплачено <span className="text-[#C9A84C]">({paymentAmount})</span>
                  </label>
                  <select className={inp} value={form.payment_made} onChange={e => set('payment_made', e.target.value)}>
                    <option value="Нет">Нет</option>
                    <option value="Да">Да</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Комментарий</label>
            <textarea className={inp + ' resize-none'} rows={2} value={form.comment} onChange={e => set('comment', e.target.value)} placeholder="Комментарий..." />
          </div>

          {/* Documents */}
          <div className="border-t border-[rgba(123,63,191,0.15)] pt-4">
            <div className="text-xs text-[#7B3FBF] font-bold uppercase tracking-widest mb-3">Документы</div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${dragOver ? 'border-[#7B3FBF] bg-[#7B3FBF]/10' : 'border-[rgba(123,63,191,0.25)] hover:border-[#7B3FBF]/50'}`}
            >
              <Upload size={20} className="mx-auto mb-2 text-[#F8FAFC]/30" />
              <p className="text-sm text-[#F8FAFC]/50 mb-2">Перетащите файлы или</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(123,63,191,0.15)] border border-[rgba(123,63,191,0.3)] rounded-lg text-sm text-[#7B3FBF] cursor-pointer hover:bg-[rgba(123,63,191,0.25)] transition-all">
                <Upload size={14} /> {uploading ? 'Загрузка...' : 'Выбрать файлы'}
                <input type="file" className="hidden" multiple onChange={handleFileInput} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              </label>
              <p className="text-xs text-[#F8FAFC]/25 mt-2">PDF, DOC, JPG, PNG — до 20 МБ каждый</p>
            </div>

            {form.documents && form.documents.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(123,63,191,0.12)] rounded-lg">
                    <FileText size={14} className="text-[#7B3FBF] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[#F8FAFC]/80 truncate">{doc.name}</div>
                      <div className="text-xs text-[#F8FAFC]/30">{doc.uploaded_at}</div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer"
                      className="p-1.5 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                      <Download size={13} />
                    </a>
                    <button onClick={() => removeDoc(i)}
                      className="p-1.5 rounded hover:bg-red-500/20 text-[#F8FAFC]/50 hover:text-red-400 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-6 py-2.5 text-sm rounded-lg border border-[rgba(255,255,255,0.1)] text-[#F8FAFC]/60 hover:text-[#F8FAFC] transition-all">Отмена</button>
            <button
              onClick={handleSaveClick}
              disabled={!!stopList}
              className="px-6 py-2.5 text-sm rounded-lg bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {candidate ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}