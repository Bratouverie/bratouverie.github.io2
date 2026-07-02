import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CitySelect from '@/components/CitySelect';

const POSITIONS = ['Разнорабочий','Строитель','Водитель B','Водитель C','Водитель CE','Водитель D','Автослесарь','Инженер связи','Оператор БПЛА','Взрывотехник','Медицинский работник','Охранник'];

export default function CandidateModal({ candidate, agencies, lockedAgencyId, onSave, onClose }) {
  const isAgencyMode = !!lockedAgencyId;

  const [form, setForm] = useState({
    full_name: candidate?.full_name || '',
    position: candidate?.position || '',
    agency_id: candidate?.agency_id || lockedAgencyId || '',
    agency_name: candidate?.agency_name || (agencies?.find(a => a.id === lockedAgencyId)?.name || ''),
    birth_date: candidate?.birth_date ?? '',
    citizenship: candidate?.citizenship ?? '',
    birth_place: candidate?.birth_place ?? '',
    health_status: candidate?.health_status ?? '',
    health_details: candidate?.health_details ?? '',
    city: candidate?.city ?? '',
    assembly_point: candidate?.assembly_point ?? '',
    arrival_date: candidate?.arrival_date ?? '',
    sb_check: candidate?.sb_check ?? '',
    medical_check: candidate?.medical_check ?? '',
    comment: candidate?.comment ?? '',
    phone: candidate?.phone ?? '',
    email: candidate?.email ?? '',
    payment_basis: candidate?.payment_basis ?? '',
    payment_made: candidate?.payment_made ?? '',
  });

  const [stopList, setStopList] = useState(null);
  const [checking, setChecking] = useState(false);
  const [cityObject, setCityObject] = useState(null);
  const [assemblyPoints, setAssemblyPoints] = useState([]);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.City.filter({ is_assembly_point: true }, '-created_date', 200)
      .then(setAssemblyPoints)
      .catch(() => {});
  }, []);

  // Дебаунс-проверка дублей (стоп-лист)
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!form.full_name?.trim() || !form.birth_date) {
        setStopList(null);
        return;
      }
      setChecking(true);
      try {
        const found = await base44.entities.Candidate.filter({
          full_name: form.full_name.trim(),
          birth_date: form.birth_date
        });
        const others = found.filter(c => c.id !== candidate?.id && !c.deleted_at);
        if (others.length > 0) {
          setStopList({
            full_name: others[0].full_name,
            agency_name: others[0].agency_name,
            birth_date: others[0].birth_date
          });
        } else {
          setStopList(null);
        }
      } finally {
        setChecking(false);
      }
    };
    const timer = setTimeout(checkDuplicate, 500);
    return () => clearTimeout(timer);
  }, [form.full_name, form.birth_date, candidate?.id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAgencyChange = (agencyId) => {
    const agency = agencies.find(a => a.id === agencyId);
    set('agency_id', agencyId);
    set('agency_name', agency?.name || '');
  };

  const handleSaveClick = async () => {
    if (!form.full_name?.trim()) {
      alert('ФИО не может быть пусто');
      return;
    }
    if (form.city && !cityObject) {
      alert('Выберите город из списка');
      return;
    }
    if (stopList) {
      alert(`Кандидат «${stopList.full_name}» (${stopList.birth_date}) уже в базе. Отредактируйте существующую запись.`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        position: form.position || '',
        agency_id: form.agency_id || '',
        agency_name: form.agency_name || '',
        birth_date: form.birth_date || '',
        citizenship: form.citizenship || '',
        birth_place: form.birth_place || '',
        health_status: form.health_status || '',
        health_details: form.health_details || '',
        city: form.city || '',
        assembly_point: form.assembly_point || '',
        arrival_date: form.arrival_date || '',
        sb_check: form.sb_check || '',
        medical_check: form.medical_check || '',
        comment: form.comment || '',
        phone: form.phone || '',
        email: form.email || '',
        payment_basis: form.payment_basis || '',
        payment_made: form.payment_made || '',
      };

      console.log('📤 Отправляем:', payload);
      await onSave(payload, candidate?.id);
      console.log('✅ Успешно сохранено');
    } catch (error) {
      console.error('❌ handleSaveClick error:', error);
    } finally {
      setSaving(false);
    }
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
                  «{stopList.full_name}» с датой рождения {stopList.birth_date} уже зарегистрирован
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
              <input className={inp} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Иванов Иван Иванович" />
              {checking && <p className="text-xs text-[#F8FAFC]/30 mt-1">Проверка стоп-листа...</p>}
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Телефон</label>
              <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+7 (___) ___-__-__" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Email</label>
              <input className={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="example@mail.ru" />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Должность</label>
              <select className={inp} value={form.position} onChange={e => set('position', e.target.value)}>
                <option value="">Выберите...</option>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
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
              <input className={inp} type="date" value={form.birth_date} onChange={e => set('birth_date', e.target.value)} />
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
              <CitySelect
                value={form.city}
                onChange={val => set('city', val)}
                onCitySelect={setCityObject}
                inputClassName={inp}
                placeholder="г. Хабаровск"
              />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Пункт сбора</label>
              <select className={inp} value={form.assembly_point} onChange={e => set('assembly_point', e.target.value)}>
                <option value="">Выберите...</option>
                {assemblyPoints.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Дата прибытия</label>
              <input className={inp + (form.arrival_date ? '' : ' text-[#F8FAFC]/30')} type="date" value={form.arrival_date} onChange={e => set('arrival_date', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Состояние здоровья</label>
              <select className={inp} value={form.health_status} onChange={e => set('health_status', e.target.value)}>
                <option value="">Не указано</option>
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

          {/* Admin statuses */}
          {!isAgencyMode && (
            <div className="border-t border-[rgba(123,63,191,0.15)] pt-4">
              <div className="text-xs text-[#7B3FBF] font-bold uppercase tracking-widest mb-3">Статусы (только администратор)</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Проверка СБ</label>
                  <select className={inp} value={form.sb_check} onChange={e => set('sb_check', e.target.value)}>
                    <option value="">Не указано</option>
                    <option value="Не проверялся">Не проверялся</option>
                    <option value="На проверке">На проверке</option>
                    <option value="Согласован">Согласован</option>
                    <option value="Не согласован">Не согласован</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Медкомиссия</label>
                  <select className={inp} value={form.medical_check} onChange={e => set('medical_check', e.target.value)}>
                    <option value="">Не указано</option>
                    <option value="Не проверялся">Не проверялся</option>
                    <option value="Прошёл">Прошёл</option>
                    <option value="Не прошёл">Не прошёл</option>
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
                    <option value="">Не указано</option>
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
            <textarea
              className={inp + ' resize-y min-h-[100px]'}
              rows={4}
              value={form.comment}
              onChange={e => set('comment', e.target.value)}
              placeholder="Комментарий..."
              disabled={candidate && !user} />
            {candidate && user && <p className="text-xs text-[#F8FAFC]/30 mt-1">От: {user.role === 'admin' ? 'Администратор' : user.role === 'moderator' ? 'Модератор' : 'Система'}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-6 py-2.5 text-sm rounded-lg border border-[rgba(255,255,255,0.1)] text-[#F8FAFC]/60 hover:text-[#F8FAFC] transition-all">Отмена</button>
            <button
              onClick={handleSaveClick}
              disabled={!!stopList || saving}
              className="px-6 py-2.5 text-sm rounded-lg bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Сохранение...' : candidate ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}