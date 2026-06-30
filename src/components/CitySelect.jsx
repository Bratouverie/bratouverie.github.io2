import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapPin, Loader2, ChevronDown, Check, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

/**
 * Строгий выбор населённого пункта из каталога.
 * — Выбор ТОЛЬКО из списка (клик по элементу)
 * — Свободный ввод текста НЕВОЗМОЖЕН
 * — Popover рендерится в портале → не обрезается модалками
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

  // Валидация существующего значения при загрузке списка
  useEffect(() => {
    if (loading || !allCities.length || !onCitySelect) return;
    if (!value || !value.trim()) { onCitySelect(null); return; }
    const match = allCities.find(c => c.name.toLowerCase() === value.trim().toLowerCase());
    onCitySelect(match || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, allCities]);

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
          className={inputClassName + ' flex items-center justify-between gap-2 text-left w-full cursor-pointer disabled:opacity-50'}
        >
          <span className="flex items-center gap-2 truncate min-w-0">
            <MapPin size={14} className="opacity-30 flex-shrink-0" />
            {loading
              ? <span className="opacity-50">Загрузка списка...</span>
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
        className="p-0 bg-[#0D1B3E] border-[rgba(123,63,191,0.3)]"
        align="start"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <Command shouldFilter={false} className="bg-[#0D1B3E]">
          <CommandInput
            placeholder="Поиск города..."
            value={search}
            onValueChange={setSearch}
            className="text-[#F8FAFC]"
          />
          <CommandList className="max-h-60">
            {filtered.length === 0 && !loading ? (
              <CommandEmpty className="text-[#F8FAFC]/40 py-6 text-center text-sm">
                Город не найден. Выберите ближайший из списка.
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((city) => (
                  <CommandItem
                    key={city.name + (city.region || '')}
                    value={city.name}
                    onSelect={() => handleSelect(city)}
                    className="text-[#F8FAFC] data-[selected=true]:bg-[rgba(123,63,191,0.15)] cursor-pointer"
                  >
                    <Check size={12} className={value === city.name ? 'opacity-100 text-[#7B3FBF]' : 'opacity-0'} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{city.name}</div>
                      {city.region && <div className="text-xs text-[#F8FAFC]/40 truncate">{city.region}</div>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}