import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AgencyModal({ agency, onSave, onClose }) {
  const [form, setForm] = useState({
    name: agency?.name || '',
    city: agency?.city || '',
    email: agency?.email || '',
    phone: agency?.phone || '',
    is_active: agency?.is_active !== false,
    access_code: agency?.access_code || '',
    contract_url: agency?.contract_url || '',
    contract_date: agency?.contract_date ?? '',
    special_conditions: agency?.special_conditions || '',
    comment: agency?.comment || '',
    planned_candidates: agency?.planned_candidates || '',
  });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const uploadContract = async (file) => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('contract_url', file_url);
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadContract(file);
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
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Код доступа агентства</label>
              <div className="flex gap-2">
                <input className={inp + ' flex-1 font-mono tracking-widest'} value={form.access_code} onChange={e => set('access_code', e.target.value)} placeholder="AG-2026-XYZ" />
                <button type="button" onClick={() => {
                  const code = 'AG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                  set('access_code', code);
                }} className="px-3 py-2 text-xs rounded-lg bg-[#7B3FBF]/15 border border-[rgba(123,63,191,0.3)] text-[#7B3FBF] hover:bg-[#7B3FBF]/25 transition-all whitespace-nowrap">
                  Сгенерировать
                </button>
              </div>
              <p className="text-xs text-[#F8FAFC]/25 mt-1">Код для входа представителя агентства</p>
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Кол-во плановых кандидатов</label>
              <input className={inp} type="number" value={form.planned_candidates} onChange={e => set('planned_candidates', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Дата подписания договора</label>
              <input className={inp} type="date" value={form.contract_date} onChange={e => set('contract_date', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Статус агентства</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 rounded accent-[#7B3FBF]" />
                <span className="text-sm text-[#F8FAFC]/70">{form.is_active ? 'Активно' : 'Отключено'}</span>
              </label>
            </div>
          </div>

          {/* Drag & drop договор */}
          <div>
            <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Договор (перетащите файл или нажмите)</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${dragOver ? 'border-[#7B3FBF] bg-[#7B3FBF]/10' : 'border-[rgba(123,63,191,0.25)] hover:border-[#7B3FBF]/50'}`}
            >
              <Upload size={18} className="mx-auto mb-1.5 text-[#F8FAFC]/30" />
              <p className="text-xs text-[#F8FAFC]/40 mb-2">Перетащите PDF, DOC или</p>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(123,63,191,0.12)] border border-[rgba(123,63,191,0.25)] rounded-lg text-xs text-[#7B3FBF] cursor-pointer hover:bg-[rgba(123,63,191,0.2)] transition-all">
                <Upload size={12} /> {uploading ? 'Загрузка...' : 'Выбрать файл'}
                <input type="file" className="hidden" onChange={e => uploadContract(e.target.files[0])} accept=".pdf,.doc,.docx" />
              </label>
              {form.contract_url && (
                <a href={form.contract_url} target="_blank" rel="noreferrer" className="block text-xs text-[#C9A84C] hover:underline mt-2">
                  ✓ Договор загружен — скачать
                </a>
              )}
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