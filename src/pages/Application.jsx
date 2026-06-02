import { useState } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { Lock, Download, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CORRECT_PASSWORD = 'SNB2026';

// PDF заявки открывается в новом окне
const PDF_URL = 'https://media.base44.com/files/public/6a118622c856f058618fff8e/7907b3ebd_.pdf';

const specialists = [
  { category: 'Строители', count: '894', percent: '45%', detail: 'Каменщики, бетонщики, арматурщики, отделочники, кровельщики, монтажники' },
  { category: 'Разнорабочие', count: '497', percent: '25%', detail: 'Подсобные рабочие, грузчики, помощники строителей, сборщики мебели' },
  { category: 'Водители (В, ВС, СЕ, CD)', count: '298', percent: '15%', detail: 'Кат. В — 100 чел., ВС — 80 чел., СЕ — 60 чел., CD — 58 чел.' },
  { category: 'Автослесари', count: '139', percent: '7%', detail: 'Текущий и капитальный ремонт автопарка, техническое обслуживание' },
  { category: 'Охранники', count: '99', percent: '5%', detail: 'Патрулирование, контроль доступа, охрана объектов' },
  { category: 'Инженеры-связисты', count: '59', percent: '3%', detail: 'Восстановление телекоммуникаций, монтаж оборудования, настройка сетей' },
  { category: 'Операторы БПЛА', count: '59', percent: '3%', detail: 'Дистанционный мониторинг объектов, аэрофотосъёмка, инспекция территорий' },
  { category: 'Взрывотехники', count: '19', percent: '1%', detail: 'Разминирование территорий, специальные допуски обязательны' },
  { category: 'Медицинские работники', count: '19', percent: '1%', detail: 'Первая помощь, обслуживание персонала, профилактика, медобразование' },
];

const timeline = [
  { date: '1 июня 2026', event: 'Старт программы набора, публикация вакансий' },
  { date: '8 июня – 6 июля', event: 'Активный период приёма заявок (1 месяц)' },
  { date: '28 июня – 10 июля', event: 'Медобследование и оформление допуска на объект (Хабаровск, Тамбов, Владивосток)' },
  { date: '30 июня – 15 июля', event: 'Подготовка к отправке на объект (группы от 10 чел.)' },
  { date: '3–20 июля', event: 'Доставка работников к месту работы на вахту' },
  { date: '3 июля – 31 декабря', event: 'Первая волна работ (6 месяцев)' },
];

export default function Application() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Неверный пароль. Попробуйте ещё раз.');
    }
  };

  const handleOpenPdf = () => {
    window.open(PDF_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#05070A] font-inter">
      <Nav />
      <div className="pt-24 pb-16 px-6 lg:px-10 max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <a href="/#documents"
            className="inline-flex items-center gap-2 text-sm text-[#F8FAFC]/50 hover:text-[#C9A84C] transition-colors">
            <ArrowLeft size={16} /> Вернуться к разделу Документы
          </a>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="h-px flex-1 max-w-[60px] bg-[#C9A84C]/40" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">Документы</span>
            <span className="h-px flex-1 max-w-[60px] bg-[#C9A84C]/40" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#F8FAFC] mb-3">
            Заявка на <span className="text-[#C9A84C]">подбор сотрудников</span>
          </h1>
          <p className="text-[#F8FAFC]/55 max-w-2xl">Программа массового подбора специалистов для участия в восстановлении инфраструктуры ЛНР и ДНР</p>
        </div>

        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.div key="lock" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass-card rounded-2xl p-10 max-w-md mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-[#C9A84C]/12 flex items-center justify-center mx-auto mb-6">
                <Lock size={28} className="text-[#C9A84C]" />
              </div>
              <h2 className="text-xl font-black text-[#F8FAFC] mb-2">Документ защищён</h2>
              <p className="text-[#F8FAFC]/50 text-sm mb-6">Введите пароль для просмотра и скачивания материала</p>
              <form onSubmit={handleUnlock} className="space-y-3">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(201,168,76,0.25)] rounded-lg px-4 py-3 text-[#F8FAFC] placeholder:text-[#F8FAFC]/30 focus:outline-none focus:border-[#C9A84C] text-center tracking-widest" />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="w-full py-3 rounded-lg bg-[#C9A84C] text-[#05070A] font-bold hover:opacity-90 transition-opacity">Войти</button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Download */}
              <div className="flex justify-end">
                <button onClick={handleOpenPdf}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-sm font-bold hover:bg-[#C9A84C]/20 transition-colors">
                  <Download size={16} /> Скачать PDF
                </button>
              </div>

              {/* Header card */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="bg-[#0D1B3E] px-8 py-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-[#F8FAFC] mb-1">ПРОГРАММА МАССОВОГО ПОДБОРА СПЕЦИАЛИСТОВ</h2>
                      <p className="text-[#F8FAFC]/50 text-sm">для участия в восстановлении инфраструктуры ЛНР и ДНР</p>
                      <p className="text-[#F8FAFC]/30 text-xs mt-1">Постановление Правительства РФ от 22.12.2023 г. №2255</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 flex-shrink-0 ml-4">КОНФИДЕНЦИАЛЬНО</span>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {[['1 987', 'Специалистов'], ['100 000 ₽', 'Вознаграждение / кандидат'], ['1 июня 2026', 'Старт программы'], ['2,5 млн ₽', 'Единовременная выплата'], ['300–470 тыс. ₽', 'Ежемесячный доход']].map(([n,l]) => (
                      <div key={l} className="glass-card rounded-xl p-4 text-center">
                        <div className="text-lg font-black text-[#C9A84C] leading-tight">{n}</div>
                        <div className="text-xs text-[#F8FAFC]/40 mt-1">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[['Заказчик', 'Правительство Российской Федерации'], ['Генеральный подрядчик', 'ООО «Братоуверие-СНБ»'], ['Цель', 'Оперативное формирование высокопрофессиональной команды']].map(([k,v]) => (
                      <div key={k} className="glass-card-gold rounded-xl p-4"><div className="text-xs text-[#C9A84C] font-bold uppercase tracking-wider mb-1">{k}</div><div className="text-sm text-[#F8FAFC]/80">{v}</div></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Why interesting */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-black text-[#F8FAFC] mb-5">Почему проект интересен кандидатам</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    ['💰', 'Высокий доход', 'Единовременная выплата 2,5 млн ₽ при подписании трудового договора и ежемесячная ЗП 300–470 тыс. ₽'],
                    ['🏠', 'Полное обеспечение', 'Бесплатное проживание в благоустроенных условиях и трёхразовое горячее питание за счёт работодателя'],
                    ['🛡️', 'Защита', 'Полная медицинская страховка и защита специальными подразделениями ВС РФ'],
                    ['🚌', 'Логистика', '100% компенсация расходов на проезд к месту работы и обратно'],
                  ].map(([icon, title, desc]) => (
                    <div key={title} className="glass-card rounded-xl p-4">
                      <div className="text-2xl mb-2">{icon}</div>
                      <div className="font-bold text-[#F8FAFC] text-sm mb-1">{title}</div>
                      <div className="text-xs text-[#F8FAFC]/50">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialists table */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-black text-[#F8FAFC] mb-2">Кого необходимо подобрать</h3>
                <p className="text-sm text-[#F8FAFC]/50 mb-5">Общая плановая численность: <span className="text-[#C9A84C] font-bold">1 987 человек</span>. Обязательный резерв ~5% (99 чел.)</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.08)]">
                        <th className="text-left text-xs text-[#C9A84C] font-bold uppercase tracking-wider pb-3 pr-4">Категория</th>
                        <th className="text-center text-xs text-[#C9A84C] font-bold uppercase tracking-wider pb-3 px-2">Кол-во</th>
                        <th className="text-center text-xs text-[#C9A84C] font-bold uppercase tracking-wider pb-3 px-2">Доля</th>
                        <th className="text-left text-xs text-[#C9A84C] font-bold uppercase tracking-wider pb-3 pl-4">Детализация</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specialists.map((s, i) => (
                        <tr key={s.category} className={`border-b border-[rgba(255,255,255,0.04)] ${i % 2 === 0 ? '' : 'bg-[rgba(255,255,255,0.02)]'}`}>
                          <td className="py-3 pr-4 font-medium text-[#F8FAFC]/80">{s.category}</td>
                          <td className="py-3 px-2 text-center font-black text-[#C9A84C]">{s.count}</td>
                          <td className="py-3 px-2 text-center text-[#F8FAFC]/40">{s.percent}</td>
                          <td className="py-3 pl-4 text-[#F8FAFC]/50">{s.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Requirements */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-black text-[#F8FAFC] mb-4">Базовые требования к кандидатам</h3>
                  {['Гражданство РФ, возраст 18–60(+4) лет', 'Базовое образование по специальности и опыт от 1 года', 'Готовность к вахте (1 год) и командировкам', 'Наличие полного пакета документов и допусков', 'Готовность к прохождению медицинской комиссии'].map(t => (
                    <div key={t} className="flex gap-3 mb-3 text-sm text-[#F8FAFC]/70"><CheckCircle size={14} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />{t}</div>
                  ))}
                </div>
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-black text-[#F8FAFC] mb-4">Алгоритм работы агентства</h3>
                  {[
                    'Первичный отбор кандидатов через ваше агентство',
                    'Проверка и согласование кандидатов с генподрядчиком',
                    'Направление на медкомиссию (г. Хабаровск / Тамбов)',
                    'Оформление документов и отправка специалиста на вахту',
                    'Подписание трудового договора и выплата вознаграждения',
                  ].map((t, i) => (
                    <div key={t} className="flex gap-3 mb-3">
                      <span className="w-5 h-5 rounded-full bg-[#7B3FBF]/20 text-[#7B3FBF] flex items-center justify-center text-xs flex-shrink-0 font-bold mt-0.5">{i+1}</span>
                      <span className="text-sm text-[#F8FAFC]/70">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-black text-[#F8FAFC] mb-5">Сроки реализации программы</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {timeline.map((t) => (
                    <div key={t.date} className="glass-card rounded-xl p-4">
                      <div className="text-[#C9A84C] font-bold text-sm mb-1">{t.date}</div>
                      <div className="text-[#F8FAFC]/60 text-xs">{t.event}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geography */}
              <div className="glass-card-gold rounded-2xl p-6">
                <h3 className="text-lg font-black text-[#F8FAFC] mb-3">География работ</h3>
                <div className="flex flex-wrap gap-3">
                  {['Мариуполь', 'Макеевка', 'Луганск', 'Алчевск'].map(city => (
                    <span key={city} className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[#C9A84C] font-bold text-sm">{city}</span>
                  ))}
                </div>
                <p className="text-xs text-[#F8FAFC]/30 mt-3">Объекты расположены на освобождённых территориях ЛНР и ДНР под защитой специальных подразделений ВС РФ</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}