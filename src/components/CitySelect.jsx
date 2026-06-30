import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';

/**
 * Строгий выбор населённого пункта из каталога.
 * - Загружает полный список городов один раз при монтировании (через searchCities '_all')
 * - Фильтрует локально (мгновенно, без сетевых запросов)
 * - Выбор ТОЛЬКО из списка — кликом по элементу
 * - Если введённого текста нет в базе — показывает подсказку
 *
 * @param {string} value — текущее значение (название города)
 * @param {function} onChange — вызывается с названием города при вводе/выборе
 * @param {function} onCitySelect — вызывается с объектом города { name, region, lat, lon } или null
 * @param {string} inputClassName — CSS-классы для input
 * @param {string} placeholder
 * @param {boolean} readOnly
 */
export default function CitySelect({
  value,
  onChange,
  onCitySelect,
  inputClassName = '',
  placeholder = 'Начните вводить город...',
  readOnly = false,
}) {
  const [allCities, setAllCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);

  // Загрузка всех городов один раз при монтировании
  useEffect(() => {
    const loadAll = async () => {
      try {
        const resp = await base44.functions.invoke('searchCities', { query: '_all' });
        setAllCities(resp.data?.results || []);
      } catch (e) {
        setAllCities([]);
      }
      setLoading(false);
    };
    loadAll();
  }, []);

  // Синхронизация внешнего значения
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Проверка валидности и уведомление родителя
  const validateAndNotify = (text) => {
    if (!onCitySelect) return;
    if (!text || !text.trim() || !allCities.length) {
      onCitySelect(null);
      return;
    }
    const match = allCities.find(c => c.name.toLowerCase() === text.trim().toLowerCase());
    onCitySelect(match || null);
  };

  // Валидация при загрузке списка
  useEffect(() => {
    if (loading || !allCities.length) return;
    validateAndNotify(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, allCities]);

  // Закрытие dropdown при клике вне компонента
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Локальная фильтрация — мгновенно
  const filtered = query.trim().length >= 1
    ? allCities.filter(c => c.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 30)
    : allCities.slice(0, 30);

  const handleChange = (val) => {
    setQuery(val);
    onChange(val);
    validateAndNotify(val);
  };

  const selectCity = (city) => {
    setQuery(city.name);
    onChange(city.name);
    if (onCitySelect) onCitySelect(city);
    setShowDropdown(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, -1));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      selectCity(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  if (readOnly) {
    return <input className={inputClassName} value={query} readOnly placeholder={placeholder} />;
  }

  const isValidated = query.trim() && allCities.some(c => c.name.toLowerCase() === query.trim().toLowerCase());
  const showHint = query.trim().length >= 2 && !isValidated && !loading;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-current opacity-30 pointer-events-none" />
        <input
          className={inputClassName + ' pl-9'}
          value={query}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder={loading ? 'Загрузка списка...' : placeholder}
          autoComplete="off"
        />
        {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B3FBF] animate-spin" />}
      </div>

      {showHint && (
        <div className="mt-1.5 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400 flex items-start gap-1.5">
          <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
          <span>Населённого пункта нет в базе. Выберите ближайший населённый пункт из списка.</span>
        </div>
      )}

      {showDropdown && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#0D1B3E] border border-[rgba(123,63,191,0.3)] rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filtered.map((city, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectCity(city)}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors border-b border-[rgba(255,255,255,0.04)] last:border-0 ${
                i === highlighted ? 'bg-[rgba(123,63,191,0.15)]' : 'hover:bg-[rgba(123,63,191,0.08)]'
              }`}
            >
              <div className="text-[#F8FAFC] font-medium">{city.name}</div>
              {city.region && <div className="text-xs text-[#F8FAFC]/40">{city.region}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}