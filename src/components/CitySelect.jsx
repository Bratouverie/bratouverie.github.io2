import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Loader2, ChevronDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * Строгий выбор населённого пункта из каталога.
 * — Выбор ТОЛЬКО из списка (клик по элементу)
 * — Свободный ввод текста НЕВОЗМОЖЕН — поле внутри dropdown только фильтрует
 * — Popover рендерится в портале → не обрезается модалками
 * — Данные загружаются из entity City (работает без авторизации)
 *
 * @param {string} value — текущее значение (название города)
 * @param {function} onChange — вызывается с названием города при выборе
 * @param {function} onCitySelect — вызывается с объектом города { name, region, lat, lon } или null
 * @param {string} inputClassName — CSS-классы для триггера-кнопки
 * @param {string} placeholder
 * @param {boolean} readOnly
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
  const onCitySelectRef = useRef(onCitySelect);
  onCitySelectRef.current = onCitySelect;

  // Загрузка всех городов при монтировании.
  // Источник: entity City (работает без авторизации на публичных страницах).
  // Дополнительно вызываем searchCities('_all') для пополнения кэша.
  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      let cities = [];

      // 1. Пытаемся пополнить кэш через backend-функцию (может требовать авторизацию)
      try {
        const resp = await base44.functions.invoke('searchCities', { query: '_all' });
        cities = resp.data?.results || [];
      } catch (_) {
        // Функция недоступна (нет авторизации) — продолжаем с entity
      }

      // 2. Если функция не вернула данные — читаем напрямую из entity City
      if (cities.length === 0) {
        try {
          const cityList = await base44.entities.City.list('-created_date', 500);
          cities = cityList
            .filter(c => c.lat != null && c.lon != null)
            .map(c => ({ name: c.name, region: c.region || '', lat: c.lat, lon: c.lon }));
        } catch (_) {}
      }

      // 3. Дедупликация по имени
      const seen = new Set();
      cities = cities.filter(c => {
        const key = c.name.toLowerCase();
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

  // Валидация существующего значения при загрузке списка
  useEffect(() => {
    if (loading || !allCities.length) return;
    const cb = onCitySelectRef.current;
    if (!cb) return;
    if (!value || !value.trim()) { cb(null); return; }
    const match = allCities.find(c => c.name.toLowerCase() === value.trim().toLowerCase());
    cb(match || null);
  }, [loading, allCities, value]);

  const filtered = search.trim()
    ? allCities.filter(c => c.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 50)
    : allCities.slice(0, 50);

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
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={loading}
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
            : <ChevronDown size={14} className="opacity-30 flex-shrink-0" />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 bg-[#0D1B3E] border-[rgba(123,63,191,0.3)] z-[100]"
        align="start"
        style={{ width: 'var(--radix-popover-trigger-width)', minWidth: '280px' }}
      >
        {/* Поле поиска — только фильтрует список, НЕ сохраняет введённый текст как значение */}
        <div className="flex items-center border-b border-[rgba(123,63,191,0.15)] px-3">
          <svg className="mr-2 h-4 w-4 shrink-0 opacity-50" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск города..."
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm text-[#F8FAFC] outline-none placeholder:text-[#F8FAFC]/30"
            autoFocus
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
      </PopoverContent>
    </Popover>
  );
}