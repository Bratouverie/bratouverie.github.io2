import { useState, useEffect, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Loader2, ChevronDown, Check, Search } from 'lucide-react';

/**
 * Строгий выбор населённого пункта из каталога.
 * — Выбор ТОЛЬКО из списка (клик по элементу)
 * — Локальный absolute-дропдаун (без Portal/Popover) — не конфликтует с модалками
 * — Данные загружаются из entity City (работает без авторизации)
 */
export default function CitySelect({
  value,
  onChange,
  onCitySelect,
  inputClassName = '',
  placeholder = 'Выберите город...',
  readOnly = false,
}) {
  const [allCities, setAllCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const onCitySelectRef = useRef(onCitySelect);
  onCitySelectRef.current = onCitySelect;

  // Загрузка городов
  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      let cities = [];
      try {
        const resp = await base44.functions.invoke('searchCities', { query: '_all' });
        cities = resp.data?.results || [];
      } catch (_) {}
      if (cities.length === 0) {
        try {
          const cityList = await base44.entities.City.list('-created_date', 500);
          cities = cityList
            .filter(c => c.lat != null && c.lon != null)
            .map(c => ({ name: c.name, region: c.region || '', lat: c.lat, lon: c.lon }));
        } catch (_) {}
      }
      const seen = new Set();
      cities = cities.filter(c => {
        const key = (c.name + (c.region || '')).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (cancelled) return;
      setAllCities(cities);
      setLoading(false);
    };
    loadAll();
    return () => { cancelled = true; };
  }, []);

  // Валидация существующего значения
  useEffect(() => {
    if (loading || !allCities.length) return;
    const cb = onCitySelectRef.current;
    if (!cb) return;
    if (!value || !value.trim()) { cb(null); return; }
    const match = allCities.find(c => c.name.toLowerCase() === value.trim().toLowerCase());
    cb(match || null);
  }, [loading, allCities, value]);

  // Click-outside handler
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? allCities.filter(c => c.name.toLowerCase().includes(q))
      : allCities;
    return list.slice(0, 50);
  }, [allCities, search]);

  const handleSelect = (city) => {
    onChange(city.name);
    if (onCitySelect) onCitySelect(city);
    setOpen(false);
    setSearch('');
  };

  if (readOnly) {
    return (
      <div className={inputClassName + ' flex items-center gap-2'}>
        <MapPin size={14} className="opacity-30 flex-shrink-0" />
        <span className={value ? '' : 'opacity-30'}>{value || placeholder}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen(v => !v)}
        className={inputClassName + ' flex items-center justify-between gap-2 text-left w-full cursor-pointer disabled:opacity-50 disabled:cursor-wait'}
      >
        <span className="flex items-center gap-2 truncate min-w-0">
          <MapPin size={14} className="opacity-30 flex-shrink-0" />
          {loading
            ? <span className="opacity-50">Загрузка списка городов...</span>
            : value
              ? <span className="truncate">{value}</span>
              : <span className="opacity-30">{placeholder}</span>}
        </span>
        {loading
          ? <Loader2 size={14} className="animate-spin opacity-50 flex-shrink-0" />
          : <ChevronDown size={14} className={`opacity-30 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-[#0D1B3E] border border-[rgba(123,63,191,0.3)] rounded-lg shadow-2xl z-[100] overflow-hidden">
          <div className="flex items-center border-b border-[rgba(123,63,191,0.15)] px-3">
            <Search size={14} className="mr-2 shrink-0 opacity-50" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск города..."
              className="flex h-10 w-full bg-transparent py-3 text-sm text-[#F8FAFC] outline-none placeholder:text-[#F8FAFC]/30"
            />
          </div>
          <div className="max-h-60 overflow-y-auto overflow-x-hidden p-1">
            {filtered.length === 0
              ? <div className="py-6 text-center text-sm text-[#F8FAFC]/40">
                  {loading ? 'Загрузка...' : 'Город не найден. Выберите ближайший из списка.'}
                </div>
              : filtered.map((city) => (
                  <button
                    key={city.name + (city.region || '')}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-[#F8FAFC] outline-none hover:bg-[rgba(123,63,191,0.15)] transition-colors"
                  >
                    <Check size={12} className={value === city.name ? 'opacity-100 text-[#7B3FBF]' : 'opacity-0'} />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-medium truncate">{city.name}</div>
                      {city.region && <div className="text-xs text-[#F8FAFC]/40 truncate">{city.region}</div>}
                    </div>
                  </button>
                ))
            }
          </div>
        </div>
      )}
    </div>
  );
}