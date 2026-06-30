import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, MapPin, RefreshCw } from 'lucide-react';
import CitySelect from '@/components/CitySelect';

const INP = "px-3 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[#7B3FBF]";

export default function AssemblyPoints() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPoint, setEditPoint] = useState(null);

  const load = async () => {
    setLoading(true);
    setPoints(await base44.entities.AssemblyPoint.list('-created_date', 200));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (p) => {
    if (!confirm(`Удалить пункт сбора «${p.name}»?`)) return;
    await base44.entities.AssemblyPoint.delete(p.id);
    load();
  };

  const handleSave = async (data, id) => {
    if (id) await base44.entities.AssemblyPoint.update(id, data);
    else await base44.entities.AssemblyPoint.create(data);
    setModalOpen(false);
    setEditPoint(null);
    load();
  };

  const toggleActive = async (p) => {
    await base44.entities.AssemblyPoint.update(p.id, { is_active: !p.is_active });
    load();
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-[#F8FAFC]">
      <div className="border-b border-[rgba(123,63,191,0.15)] bg-[#05070A]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-[#F8FAFC]/50 hover:text-[#F8FAFC] transition-colors">
              <img src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png" className="w-7 h-7 object-contain" alt="logo" />
            </Link>
            <span className="text-[rgba(123,63,191,0.4)]">/</span>
            <Link to="/admin/agencies" className="text-sm text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-colors">База агентств</Link>
            <Link to="/admin/candidates" className="text-sm text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-colors">Кандидаты</Link>
            <h1 className="text-sm font-bold text-[#F8FAFC]">Пункты сбора</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} title="Обновить"
              className="p-2 rounded-lg border border-[rgba(123,63,191,0.2)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all">
              <RefreshCw size={14} />
            </button>
            <button onClick={() => { setEditPoint(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-xs rounded bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] transition-all">
              <Plus size={14} /> Добавить пункт
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="glass-card rounded-xl p-4 mb-6">
          <p className="text-sm text-[#F8FAFC]/60 leading-relaxed">
            Пункты сбора используются для автоматического расчёта расстояния от города проживания кандидата.
            Координаты определяются автоматически при выборе города из каталога.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#7B3FBF]/30 border-t-[#7B3FBF] rounded-full animate-spin" /></div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(123,63,191,0.15)]">
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">Название</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">Город</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">Адрес</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">Статус</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map(p => (
                    <tr key={p.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(123,63,191,0.06)] transition-colors">
                      <td className="px-4 py-3 font-bold text-[#F8FAFC]">{p.name}</td>
                      <td className="px-4 py-3 text-[#F8FAFC]/60">
                        <div className="flex items-center gap-1.5"><MapPin size={12} className="text-[#7B3FBF]/60" />{p.city || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/55">{p.address || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(p)}
                          className={`text-xs px-2 py-0.5 rounded font-medium border transition-all ${p.is_active !== false ? 'bg-green-500/15 text-green-400 border-green-500/25' : 'bg-red-500/10 text-red-400/70 border-red-500/20'}`}>
                          {p.is_active !== false ? '✓ Активен' : '✗ Откл.'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditPoint(p); setModalOpen(true); }}
                            className="p-1.5 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(p)}
                            className="p-1.5 rounded hover:bg-red-500/20 text-[#F8FAFC]/50 hover:text-red-400 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {points.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-[#F8FAFC]/30">Пункты сбора не добавлены</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <AssemblyPointModal point={editPoint} onSave={handleSave} onClose={() => { setModalOpen(false); setEditPoint(null); }} />
      )}
    </div>
  );
}

function AssemblyPointModal({ point, onSave, onClose }) {
  const [city, setCity] = useState(point?.city || '');
  const [address, setAddress] = useState(point?.address || '');
  const [coords, setCoords] = useState({ lat: point?.lat ?? null, lon: point?.lon ?? null });

  const handleCitySelect = (c) => {
    setCity(c.name);
    setCoords({ lat: c.lat, lon: c.lon });
  };

  const handleSave = () => {
    if (!city) { alert('Укажите город'); return; }
    onSave({ name: city, city, address, lat: coords.lat, lon: coords.lon, is_active: point?.is_active !== false }, point?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0D1B3E] border border-[rgba(123,63,191,0.25)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[rgba(123,63,191,0.15)]">
          <h2 className="text-lg font-black text-[#F8FAFC]">{point ? 'Редактировать пункт сбора' : 'Новый пункт сбора'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all text-[#F8FAFC]/60">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Город <span className="text-red-400">*</span></label>
            <CitySelect
              value={city}
              onChange={setCity}
              onCitySelect={handleCitySelect}
              inputClassName={INP + ' w-full'}
              placeholder="Выберите город..."
            />
          </div>
          <div>
            <label className="block text-xs text-[#F8FAFC]/40 mb-1.5">Адрес</label>
            <input className={INP + ' w-full'} value={address} onChange={e => setAddress(e.target.value)} placeholder="ул. Примерная, д. 1" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-6 py-2.5 text-sm rounded-lg border border-[rgba(255,255,255,0.1)] text-[#F8FAFC]/60 hover:text-[#F8FAFC] transition-all">Отмена</button>
            <button onClick={handleSave}
              className="px-6 py-2.5 text-sm rounded-lg bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] font-bold transition-all">
              {point ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}