import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUSES = ['Рассматриваем', 'Переговоры', 'Согласен', 'Заключили договор'];
const CALL_TYPES = ['Zoom', 'Телефон', 'Яндекс Мост'];

export default function AgencyModal({ agency, onSave, onClose }) {
  const [form, setForm] = useState({
    name: agency?.name || '',
    city: agency?.city || '',
    email: agency?.email || '',
    phone: agency?.phone || '',
    status: agency?.status || 'Рассматриваем',
    contract_url: agency?.contract_url || '',
    contract_date: agency?.contract_date || '',
    special_conditions: agency?.special_conditions || '',
    comment: agency?.comment || '',
    call_datetime: agency?.call_datetime || '',
    call_type: agency?.call_type || 'Телефон',
    planned_candidates: agency?.planned_candidates || '',
    manager_email: agency?.manager_email || '',
  });
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleContractUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('contract_url', file_url);
    setUploading(false);
  };

  const inp = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#F8FAFC]/25 focus:outline-none focus:border-[#7B3FBF] transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0D1B3E] border border-[rgba(123,63,191,0.25)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[rgba(123,63,191,0.15)] sticky top-0 bg-[#0D1B3E] z-10">
          <h2 className="text-lg font-black text-[#F8FAFC]">{agency ? 'Редактировать агентство' : 'Новое агентство'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all text-[#F8FAFC]/60"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Наименование *</label>
              <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Название агентства" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Город</label>
              <input className={inp} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Москва" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Email</label>
              <input className={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="agency@example.ru" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Телефон</label>
              <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+7 (___) ___-__-__" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Email менеджера</label>
              <input className={inp} type="email" value={form.manager_email} onChange={e => set('manager_email', e.target.value)} placeholder="manager@example.ru" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Статус взаимодействия</label>
              <select className={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Дата подписания договора</label>
              <input className={inp} type="date" value={form.contract_date} onChange={e => set('contract_date', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Кол-во плановых кандидатов</label>
              <input className={inp} type="number" value={form.planned_candidates} onChange={e => set('planned_candidates', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Дата и время звонка</label>
              <input className={inp} type="datetime-local" value={form.call_datetime} onChange={e => set('call_datetime', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Вид звонка</label>
              <select className={inp} value={form.call_type} onChange={e => set('call_type', e.target.value)}>
                {CALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Contract upload */}
          <div>
            <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Договор (загрузить файл)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(123,63,191,0.1)] border border-[rgba(123,63,191,0.25)] rounded-lg text-sm text-[#7B3FBF] cursor-pointer hover:bg-[rgba(123,63,191,0.2)] transition-all">
                <Upload size={14} />
                {uploading ? 'Загрузка...' : 'Выбрать файл'}
                <input type="file" className="hidden" onChange={handleContractUpload} accept=".pdf,.doc,.docx" />
              </label>
              {form.contract_url && <a href={form.contract_url} target="_blank" rel="noreferrer" className="text-xs text-[#C9A84C] hover:underline">Скачать загруженный</a>}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Особые условия договора</label>
            <textarea className={inp + ' resize-none'} rows={2} value={form.special_conditions} onChange={e => set('special_conditions', e.target.value)} placeholder="Особые условия..." />
          </div>
          <div>
            <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Комментарий</label>
            <textarea className={inp + ' resize-none'} rows={2} value={form.comment} onChange={e => set('comment', e.target.value)} placeholder="Комментарий..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-6 py-2.5 text-sm rounded-lg border border-[rgba(255,255,255,0.1)] text-[#F8FAFC]/60 hover:text-[#F8FAFC] transition-all">Отмена</button>
            <button onClick={() => onSave(form, agency?.id)}
              className="px-6 py-2.5 text-sm rounded-lg bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] font-bold transition-all">
              {agency ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}