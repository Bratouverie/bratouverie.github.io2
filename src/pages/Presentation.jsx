import { useState } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { Lock, Download, Eye, FileText, Shield, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CORRECT_PASSWORD = 'SNB2026';

const SLIDES = [
  {
    title: 'Презентация для кадрового агентства',
    subtitle: 'Набор специалистов для восстановления инфраструктуры ЛНР и ДНР',
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: '1 987', label: 'Специалистов требуется' },
            { num: '9', label: 'Категорий' },
            { num: '4', label: 'Населённых пункта' },
            { num: '1–3', label: 'Года сотрудничества' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-5 text-center">
              <div className="text-3xl font-black text-[#C9A84C] mb-1">{s.num}</div>
              <div className="text-xs text-[#F8FAFC]/50">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-5">
            <div className="text-xs text-[#7B3FBF] font-bold uppercase tracking-widest mb-1">Генеральный подрядчик</div>
            <div className="font-bold text-[#F8FAFC]">ООО «Братоуверие-СНБ»</div>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="text-xs text-[#7B3FBF] font-bold uppercase tracking-widest mb-1">Проект</div>
            <div className="font-bold text-[#F8FAFC]">Восстановление ЛНР и ДНР</div>
          </div>
          <div className="glass-card rounded-xl p-5">
            <div className="text-xs text-[#7B3FBF] font-bold uppercase tracking-widest mb-1">Место оформления</div>
            <div className="font-bold text-[#F8FAFC]">г. Хабаровск, г. Тамбов</div>
          </div>
        </div>
        <div className="glass-card-gold rounded-xl p-6">
          <div className="text-xs text-[#C9A84C] font-bold uppercase tracking-widest mb-3">Правовая основа</div>
          <p className="text-[#F8FAFC]/70 text-sm">Постановление Правительства РФ от 22.12.2023 г. №2255 «О программе восстановления инфраструктуры Луганской и Донецкой народных республик»</p>
        </div>
      </div>
    ),
  },
  {
    title: 'О компании ООО «Братоуверие-СНБ»',
    subtitle: 'Генеральный подрядчик по проектам государственной важности',
    content: (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-[#7B3FBF] font-bold mb-3">О компании</h3>
            {['Генеральный подрядчик по проектам государственной важности', 'Специализированная компания для сотрудничества с органами государственного управления', 'Выполнение функций по подбору персонала, разработке стратегий реализации', 'Поддержание коммуникации между правительственными структурами и общественными организациями'].map(t => (
              <div key={t} className="flex gap-2 mb-2 text-sm text-[#F8FAFC]/70"><span className="text-[#C9A84C] flex-shrink-0">✓</span>{t}</div>
            ))}
          </div>
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-[#7B3FBF] font-bold mb-3">Ключевые показатели</h3>
            <div className="grid grid-cols-3 gap-3">
              {[['1 987', 'Специалистов'], ['9', 'Категорий'], ['30+', 'Нас. пунктов']].map(([n,l]) => (
                <div key={l} className="text-center"><div className="text-xl font-black text-[#C9A84C]">{n}</div><div className="text-xs text-[#F8FAFC]/40">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-[#7B3FBF] font-bold mb-3">Миссия и ценности</h3>
            <div className="bg-[#7B3FBF]/10 border border-[#7B3FBF]/20 rounded-lg p-4 text-sm text-[#F8FAFC]/70 mb-3">Воплощение концепции братства и единства граждан России. Принцип «Своих не бросаем (СНБ)» — работа в сложных ситуациях и вызовах.</div>
            {['Успешно решить поставленные государством задачи', 'Надёжность, профессионализм и ответственность в каждом проекте'].map(t => (
              <div key={t} className="flex gap-2 mb-2 text-sm text-[#F8FAFC]/70"><span className="text-[#C9A84C]">✓</span>{t}</div>
            ))}
          </div>
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-[#7B3FBF] font-bold mb-3">Компетенции</h3>
            {['Подбор персонала для решения важных гос. задач', 'Разработка стратегий реализации проектов', 'Управление проектами любой сложности', 'Коммуникация с госструктурами'].map(t => (
              <div key={t} className="flex gap-2 mb-2 text-sm text-[#F8FAFC]/70"><span className="text-[#C9A84C]">✓</span>{t}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Проект восстановления: цели и масштаб',
    subtitle: 'Программа восстановления ЛНР и ДНР',
    content: (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-[#7B3FBF] font-bold mb-3">Цели проекта</h3>
            <div className="bg-[#7B3FBF]/10 border border-[#7B3FBF]/20 rounded-lg p-4 text-sm text-[#F8FAFC]/70 mb-3">Основная цель: Восстановление инфраструктуры ЛНР и ДНР на основании Постановления Правительства РФ от 22.12.2023 г. №2255</div>
            {['Восстановление более 30 городов и населённых пунктов', 'Формирование команды из 1 987 специалистов по 9 категориям', 'Партнёрство с кадровыми агентствами на 1–3 года'].map(t => (
              <div key={t} className="flex gap-2 mb-2 text-sm text-[#F8FAFC]/70"><span className="text-[#C9A84C]">✓</span>{t}</div>
            ))}
          </div>
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-[#7B3FBF] font-bold mb-3">Ключевые сроки</h3>
            {[
              ['1 июня 2026', 'Старт программы набора'],
              ['8 июня – 6 июля', 'Активный период приёма заявок'],
              ['28 июня – 10 июля', 'Медобследование и оформление'],
              ['3–20 июля', 'Доставка работников на вахту'],
            ].map(([d,l]) => (
              <div key={d} className="flex justify-between mb-2 text-sm"><span className="text-[#C9A84C] font-medium">{d}</span><span className="text-[#F8FAFC]/60">{l}</span></div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-[#7B3FBF] font-bold mb-3">География проекта</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[['30+', 'Нас. пунктов'], ['2', 'Республики (ЛНР, ДНР)'], ['1 987', 'Специалистов']].map(([n,l]) => (
                <div key={l} className="text-center glass-card rounded-lg p-3"><div className="text-lg font-black text-[#C9A84C]">{n}</div><div className="text-xs text-[#F8FAFC]/40">{l}</div></div>
              ))}
            </div>
            <div className="text-sm text-[#F8FAFC]/60"><span className="font-bold text-[#F8FAFC]/80">Города:</span> Мариуполь, Макеевка, Луганск, Алчевск</div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-[#7B3FBF] font-bold mb-3">Распределение специалистов</h3>
            {[['Строители', '894', '45%'], ['Разнорабочие', '497', '25%'], ['Водители', '298', '15%'], ['Другие', '298', '15%']].map(([n,c,p]) => (
              <div key={n} className="flex items-center gap-3 mb-2">
                <span className="text-sm text-[#F8FAFC]/60 w-28">{n}</span>
                <div className="flex-1 bg-[rgba(255,255,255,0.05)] rounded-full h-2"><div className="bg-[#7B3FBF] h-2 rounded-full" style={{width: p}} /></div>
                <span className="text-xs text-[#C9A84C] w-10 text-right">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Распределение специалистов (1 987 чел.)',
    subtitle: 'Структура набора персонала по категориям',
    content: (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-[#7B3FBF] font-bold mb-4">Категории специалистов</h3>
          {[
            ['Строители', 894, '45%', '#3B82F6'],
            ['Разнорабочие', 497, '25%', '#10B981'],
            ['Водители', 298, '15%', '#F59E0B'],
            ['Автослесари', 139, '7%', '#EF4444'],
            ['Охранники', 99, '5%', '#8B5CF6'],
            ['Инженеры-связисты', 59, '3%', '#F97316'],
            ['Операторы БПЛА', 59, '3%', '#06B6D4'],
            ['Взрывотехники', 19, '1%', '#6B7280'],
            ['Медицинские работники', 19, '1%', '#6B7280'],
          ].map(([n,c,p,color]) => (
            <div key={n} className="flex items-center gap-3 mb-2.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background: color}} />
              <span className="text-sm text-[#F8FAFC]/70 flex-1">{n}</span>
              <span className="text-sm font-bold text-[#F8FAFC]">{c}</span>
              <span className="text-xs text-[#F8FAFC]/40 w-10 text-right">({p})</span>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="glass-card-gold rounded-xl p-6">
            <h3 className="text-[#C9A84C] font-bold mb-3">Условия для специалистов</h3>
            {[
              ['Единовременная выплата', '2,5 млн ₽'],
              ['Ежемесячный доход', '300–470 тыс. ₽'],
              ['Проживание', 'Бесплатное'],
              ['Питание', '3-разовое горячее'],
              ['Медицинская страховка', 'Полная'],
              ['Проезд', '100% компенсация'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between mb-2 text-sm"><span className="text-[#F8FAFC]/60">{k}</span><span className="text-[#C9A84C] font-bold">{v}</span></div>
            ))}
          </div>
          <div className="glass-card rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4">
              {[['1 987', 'Всего специалистов'], ['9', 'Категорий'], ['45%', 'Строители'], ['25%', 'Разнорабочие']].map(([n,l]) => (
                <div key={l} className="text-center"><div className="text-2xl font-black text-[#C9A84C]">{n}</div><div className="text-xs text-[#F8FAFC]/40">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Категории специалистов',
    subtitle: 'Строители, разнорабочие, водители, другие специалисты',
    content: (
      <div className="grid md:grid-cols-2 gap-5">
        {[
          { title: 'Строители', count: '894 чел. (45%)', color: '#3B82F6', items: ['Каменщики, бетонщики, арматурщики', 'Отделочники, кровельщики', 'Монтажники конструкций и оборудования'], salary: '280–310 тыс. ₽' },
          { title: 'Разнорабочие', count: '497 чел. (25%)', color: '#10B981', items: ['Подсобные рабочие, грузчики', 'Помощники строителей', 'Сборщики мебели'], salary: '260–290 тыс. ₽' },
          { title: 'Водители', count: '298 чел. (15%)', color: '#F59E0B', items: ['Кат. В: 100 чел. (легковой)', 'Кат. ВС: 80 чел. (грузовой)', 'Кат. СЕ/CD: 118 чел.'], salary: '300–340 тыс. ₽' },
          { title: 'Специалисты', count: '198 чел. (10%)', color: '#8B5CF6', items: ['Автослесари — 139 чел.', 'Охранники — 99 чел.', 'Инженеры, БПЛА, медики, взрывотехники'], salary: '310–470 тыс. ₽' },
        ].map(s => (
          <div key={s.title} className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#F8FAFC]">{s.title}</h3>
              <span className="text-xs px-2 py-1 rounded-full" style={{background: s.color + '20', color: s.color}}>{s.count}</span>
            </div>
            {s.items.map(i => <div key={i} className="flex gap-2 text-sm text-[#F8FAFC]/60 mb-1.5"><span style={{color: s.color}}>•</span>{i}</div>)}
            <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] flex justify-between text-xs">
              <span className="text-[#F8FAFC]/30">Вахта 1 год</span>
              <span className="font-bold" style={{color: s.color}}>{s.salary}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Процесс подбора: этапы и сроки',
    subtitle: 'Пошаговый алгоритм взаимодействия',
    content: (
      <div className="space-y-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-[#7B3FBF] font-bold mb-5">7 этапов сотрудничества</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['1', 'Анализ требований', '2 раб. дня'],
              ['2', 'Поиск кандидатов', 'до 10 раб. дней'],
              ['3', 'Скрининг', 'до 4 раб. дней'],
              ['4', 'Собеседования', 'до 5 раб. дней'],
              ['5', 'Направление', '2 раб. дня'],
              ['6', 'Финальные интервью', 'до 2 раб. дней'],
              ['7', 'Оформление', 'до 3 раб. дней'],
            ].map(([n,t,d]) => (
              <div key={n} className="glass-card rounded-lg p-3 text-center">
                <div className="w-8 h-8 rounded-full bg-[#7B3FBF] flex items-center justify-center text-white font-black text-sm mx-auto mb-2">{n}</div>
                <div className="text-xs font-bold text-[#F8FAFC]/80 mb-1">{t}</div>
                <div className="text-xs text-[#7B3FBF]">{d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['до 26 раб. дней', 'Общий срок'], ['1 987 чел.', 'Кандидаты'], ['мин. 70%', 'Успешность'], ['1 июня 2026', 'Старт']].map(([n,l]) => (
            <div key={l} className="glass-card-gold rounded-xl p-4 text-center"><div className="text-lg font-black text-[#C9A84C]">{n}</div><div className="text-xs text-[#F8FAFC]/40">{l}</div></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: 'Условия сотрудничества',
    subtitle: 'Финансовые условия и следующие шаги',
    content: (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-[#7B3FBF] font-bold mb-4">Условия сотрудничества</h3>
            {[
              ['Вознаграждение', '100 000 ₽ / кандидат'],
              ['Период', '1–3 года'],
              ['Объём', '1 987 чел.'],
              ['Срок оплаты', '5 банк. дней'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between mb-3 pb-3 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                <span className="text-[#F8FAFC]/60 text-sm">{k}</span>
                <span className="text-[#C9A84C] font-bold text-sm">{v}</span>
              </div>
            ))}
            {['Приоритетное размещение вакансий', 'Прямой контакт с генподрядчиком', 'Регулярная сверка и отчётность'].map(t => (
              <div key={t} className="flex gap-2 text-sm text-[#F8FAFC]/60 mb-1.5"><span className="text-[#C9A84C]">✓</span>{t}</div>
            ))}
          </div>
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-[#7B3FBF] font-bold mb-3">Следующие шаги</h3>
            {['Свяжитесь с нами для обсуждения деталей', 'Подготовьте пакет документов', 'Подпишите договор о сотрудничестве'].map((t, i) => (
              <div key={t} className="flex gap-3 mb-3 text-sm text-[#F8FAFC]/70">
                <span className="w-5 h-5 rounded-full bg-[#7B3FBF]/20 text-[#7B3FBF] flex items-center justify-center text-xs flex-shrink-0 font-bold">{i+1}</span>{t}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="glass-card-gold rounded-xl p-6">
            <h3 className="text-[#C9A84C] font-bold mb-4">Контактная информация</h3>
            {[
              ['Яков Евгеньевич (директор)', '+7 950 282-46-45'],
              ['Игорь Андреевич (зам.)', '+7 922 312-07-35'],
              ['Приёмная', '+7 (4212) 51-59-30'],
              ['Email', 'partner@bratouverie-snb.ru'],
              ['Адрес', 'г. Хабаровск, ул. Карла Маркса, 66'],
            ].map(([k,v]) => (
              <div key={k} className="mb-2"><div className="text-xs text-[#F8FAFC]/35">{k}</div><div className="text-sm font-medium text-[#F8FAFC]/80">{v}</div></div>
            ))}
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-2xl font-black text-[#C9A84C] mb-2">Готовы к сотрудничеству!</div>
            <p className="text-sm text-[#F8FAFC]/55 mb-4">Свяжитесь с нами сегодня для обсуждения всех деталей проекта</p>
            <a href="/#contacts" className="inline-block px-6 py-3 rounded-lg bg-[#7B3FBF] text-white text-sm font-bold hover:bg-[#8B4FCF] transition-colors">Начать сотрудничество</a>
          </div>
        </div>
      </div>
    ),
  },
];

export default function Presentation() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Неверный пароль. Попробуйте ещё раз.');
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] font-inter">
      <Nav />
      <div className="pt-24 pb-16 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="h-px flex-1 max-w-[60px] bg-[#7B3FBF]/50" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7B3FBF]">Партнёрам</span>
            <span className="h-px flex-1 max-w-[60px] bg-[#7B3FBF]/50" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#F8FAFC] mb-3">
            Коммерческое <span className="text-[#7B3FBF]">предложение</span>
          </h1>
          <p className="text-[#F8FAFC]/55 max-w-2xl">Для кадрового агентства о сотрудничестве в рамках Программы восстановления ДНР и ЛНР</p>
        </div>

        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.div key="lock" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass-card rounded-2xl p-10 max-w-md mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-[#7B3FBF]/15 flex items-center justify-center mx-auto mb-6">
                <Lock size={28} className="text-[#7B3FBF]" />
              </div>
              <h2 className="text-xl font-black text-[#F8FAFC] mb-2">Документ защищён</h2>
              <p className="text-[#F8FAFC]/50 text-sm mb-6">Введите пароль для просмотра и скачивания материала</p>
              <form onSubmit={handleUnlock} className="space-y-3">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(123,63,191,0.25)] rounded-lg px-4 py-3 text-[#F8FAFC] placeholder:text-[#F8FAFC]/30 focus:outline-none focus:border-[#7B3FBF] text-center tracking-widest" />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="w-full py-3 rounded-lg bg-[#7B3FBF] text-white font-bold hover:bg-[#8B4FCF] transition-colors">Войти</button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Download button */}
              <div className="flex justify-end mb-6">
                <a href="https://media.base44.com/files/public/6a118622c856f058618fff8e/79cb2428f_.pdf" download
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-sm font-bold hover:bg-[#C9A84C]/20 transition-colors">
                  <Download size={16} /> Скачать PDF
                </a>
              </div>

              {/* Slide indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-1.5">
                  {SLIDES.map((_, i) => (
                    <button key={i} onClick={() => setCurrentSlide(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-[#7B3FBF] w-6' : 'bg-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.3)]'}`} />
                  ))}
                </div>
                <span className="text-xs text-[#F8FAFC]/30">{currentSlide + 1} / {SLIDES.length}</span>
              </div>

              {/* Slide */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="bg-[#0D1B3E] px-8 py-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-[#F8FAFC]">{SLIDES[currentSlide].title}</h2>
                    <p className="text-sm text-[#F8FAFC]/40">{SLIDES[currentSlide].subtitle}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded bg-red-500/20 border border-red-500/30 text-red-400">КОНФИДЕНЦИАЛЬНО</span>
                </div>
                <div className="p-6 md:p-8">
                  <AnimatePresence mode="wait">
                    <motion.div key={currentSlide} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                      {SLIDES[currentSlide].content}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="px-8 py-4 border-t border-[rgba(255,255,255,0.05)] flex justify-between">
                  <button onClick={() => setCurrentSlide(i => Math.max(0, i - 1))} disabled={currentSlide === 0}
                    className="px-4 py-2 rounded-lg text-sm text-[#F8FAFC]/50 hover:text-[#F8FAFC] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">← Назад</button>
                  <span className="text-xs text-[#F8FAFC]/20 self-center">Дата: июнь 2026 г. · +7 (4212) 51-59-30</span>
                  <button onClick={() => setCurrentSlide(i => Math.min(SLIDES.length - 1, i + 1))} disabled={currentSlide === SLIDES.length - 1}
                    className="px-4 py-2 rounded-lg text-sm text-[#F8FAFC]/50 hover:text-[#F8FAFC] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">Вперёд →</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}