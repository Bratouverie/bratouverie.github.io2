import { useState } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { Lock, Download, FileText, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CORRECT_PASSWORD = 'SNB2026';

// PDF прикреплённый от пользователя
const PDF_URL = 'https://media.base44.com/files/public/6a118622c856f058618fff8e/c93ad0002_.pdf';

const contractSections = [
  {
    num: '1', title: 'Предмет договора',
    items: [
      'Подрядчик обязуется по заданиям Генподрядчика оказывать услуги по поиску, предварительному отбору, сопровождению и предоставлению кандидатов для участия в проектах по восстановлению городов ЛНР и ДНР, а Генподрядчик обязуется принимать надлежащим образом оказанные услуги и оплачивать их.',
      'Перечень требуемых специалистов, квалификационные требования, ориентировочная численность, условия работы и иные специальные условия определяются Приложением № 1 (Техническое задание).',
      'Услуги Подрядчика включают поиск кандидатов, проведение первичных интервью, проверку соответствия минимальным требованиям, организационное сопровождение, передачу материалов Генподрядчику и сопровождение кандидатов до подписания контракта.',
    ]
  },
  {
    num: '2', title: 'Сроки оказания услуг',
    items: [
      'Подрядчик обязуется в течение 30 (тридцати) календарных дней привлечь для Генподрядчика не менее [указать число] кандидатов, соответствующих требованиям ТЗ.',
      'При невозможности выполнения плана в установленный срок Подрядчик обязан не позднее чем за 5 рабочих дней уведомить Генподрядчика.',
      'Стороны вправе продлить сроки путем подписания дополнительного соглашения.',
    ]
  },
  {
    num: '3', title: 'Порядок и этапы подбора персонала',
    items: [
      'Этап 1. Анализ требований Генподрядчика и формирование профиля кандидата — до 2 рабочих дней.',
      'Этап 2. Поиск кандидатов через базы данных, сайты вакансий, профессиональные сообщества — до 10 рабочих дней.',
      'Этап 3. Первичный отбор резюме и скрининг кандидатов — до 4 рабочих дней.',
      'Этап 4. Проведение первичных собеседований (телефонных / онлайн) — до 5 рабочих дней.',
      'Этап 5. Направление Генподрядчику отобранных резюме и материалов — в течение 2 рабочих дней.',
      'Этап 6. Организация финальных собеседований — до 2 рабочих дней.',
      'Этап 7. Организационное сопровождение кандидатов до подписания контракта — до 3 рабочих дней.',
    ]
  },
  {
    num: '6', title: 'Вознаграждение и порядок расчётов',
    items: [
      'Размер вознаграждения составляет 100 000 (сто тысяч) рублей за каждого кандидата, подписавшего контракт на вахтовую работу сроком 1 год.',
      'Вознаграждение выплачивается только если кандидат успешно прошёл все этапы отбора, согласован Генподрядчиком и подписал трудовой договор.',
      'Оплата производится в течение 5 (пяти) банковских дней с даты подписания акта сдачи-приемки.',
    ]
  },
  {
    num: '9', title: 'Конфиденциальность',
    items: [
      'Вся информация, документы, сведения о кандидатах, коммерческие условия и иные данные являются конфиденциальной информацией.',
      'Стороны обязуются не разглашать конфиденциальную информацию третьим лицам без предварительного письменного согласия другой Стороны.',
      'Обязательства по конфиденциальности сохраняют силу в течение 3 (трёх) лет после прекращения действия договора.',
      'За нарушение режима конфиденциальности виновная Сторона уплачивает неустойку в размере 55-кратной величины МРОТ.',
    ]
  },
  {
    num: '10', title: 'Ответственность Сторон',
    items: [
      'За просрочку оказания услуг Подрядчик уплачивает пени в размере 0,1% от стоимости просроченных услуг за каждый день просрочки.',
      'За невыполнение плана Подрядчик уплачивает неустойку в размере 1% от общей стоимости услуг за каждый полный день просрочки, начиная с 31-го дня.',
      'За просрочку оплаты Генподрядчик уплачивает пени в размере 0,1% от суммы просроченного платежа за каждый день просрочки.',
    ]
  },
  {
    num: '12', title: 'Срок действия, изменение и расторжение договора',
    items: [
      'Настоящий договор вступает в силу с момента его подписания Сторонами и действует до полного исполнения обязательств.',
      'Все изменения и дополнения действительны только при условии их совершения в письменной форме и подписания уполномоченными представителями.',
      'Договор может быть расторгнут по взаимному письменному соглашению Сторон или в одностороннем порядке при существенном нарушении условий.',
    ]
  },
];

const appendices = [
  { num: '1', title: 'Техническое задание', desc: 'Перечень требуемых специалистов, требования к квалификации, количество и сроки. Всего 1 987 специалистов 9 категорий.' },
  { num: '2', title: 'Форма еженедельного отчёта', desc: 'Форма отчётности для предоставления Генподрядчику еженедельной информации о ходе подбора.' },
  { num: '3', title: 'Форма акта сдачи-приёмки', desc: 'Форма акта, подтверждающего факт надлежащего оказания услуг по конкретному кандидату.' },
  { num: '4', title: 'Форма реестра учёта кандидатов', desc: 'Единый реестр с ФИО кандидата, специальностью, датами прохождения этапов отбора и статусом трудоустройства.' },
];

export default function Contract() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSection, setOpenSection] = useState(null);

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
          <Link to="/#documents"
            className="inline-flex items-center gap-2 text-sm text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-colors">
            <ArrowLeft size={16} /> Вернуться к разделу Документы
          </Link>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="h-px flex-1 max-w-[60px] bg-[#7B3FBF]/50" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7B3FBF]">Юридические документы</span>
            <span className="h-px flex-1 max-w-[60px] bg-[#7B3FBF]/50" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#F8FAFC] mb-3">
            Договор с <span className="text-[#7B3FBF]">кадровым агентством</span>
          </h1>
          <p className="text-[#F8FAFC]/55 max-w-2xl">Договор на оказание услуг по подбору персонала с приложениями</p>
        </div>

        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.div key="lock" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass-card rounded-2xl p-10 max-w-md mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-[#7B3FBF]/12 flex items-center justify-center mx-auto mb-6">
                <Lock size={28} className="text-[#7B3FBF]" />
              </div>
              <h2 className="text-xl font-black text-[#F8FAFC] mb-2">Документ защищён</h2>
              <p className="text-[#F8FAFC]/50 text-sm mb-6">Введите пароль для просмотра и скачивания договора</p>
              <form onSubmit={handleUnlock} className="space-y-3">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(123,63,191,0.25)] rounded-lg px-4 py-3 text-[#F8FAFC] placeholder:text-[#F8FAFC]/30 focus:outline-none focus:border-[#7B3FBF] text-center tracking-widest" />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="w-full py-3 rounded-lg bg-[#7B3FBF] text-white font-bold hover:bg-[#8B4FCF] transition-colors">Войти</button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Download */}
              <div className="flex justify-end">
                <button onClick={handleOpenPdf}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#7B3FBF]/10 border border-[#7B3FBF]/30 text-[#7B3FBF] text-sm font-bold hover:bg-[#7B3FBF]/20 transition-colors">
                  <Download size={16} /> Скачать PDF
                </button>
              </div>

              {/* Header */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="bg-[#0D1B3E] px-8 py-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-[#F8FAFC] mb-1">ДОГОВОР № ______</h2>
                      <p className="text-[#7B3FBF] font-bold">НА ОКАЗАНИЕ УСЛУГ ПО ПОДБОРУ ПЕРСОНАЛА</p>
                      <p className="text-[#F8FAFC]/40 text-sm mt-1">г. [Город] · «___» __________ 202__ г.</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 flex-shrink-0 ml-4">КОНФИДЕНЦИАЛЬНО</span>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-[#F8FAFC]/70 text-sm leading-relaxed mb-6">
                    Общество с ограниченной ответственностью <strong className="text-[#F8FAFC]">«Братоуверие-СНБ»</strong>, именуемое в дальнейшем «Генподрядчик», в лице [должность, Ф.И.О.], действующего на основании [Устава / Доверенности], с одной стороны, и <strong className="text-[#F8FAFC]">[наименование кадрового агентства]</strong>, именуемое в дальнейшем «Подрядчик», с другой стороны, совместно именуемые «Стороны», заключили настоящий договор.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="glass-card rounded-xl p-5">
                      <div className="text-xs text-[#7B3FBF] font-bold uppercase tracking-wider mb-3">Генподрядчик</div>
                      <div className="space-y-1.5 text-sm">
                        <div><span className="text-[#F8FAFC]/40">Компания: </span><span className="text-[#F8FAFC]/80">ООО «Братоуверие-СНБ» (ООО «БРО-СНБ»)</span></div>
                        <div><span className="text-[#F8FAFC]/40">Адрес: </span><span className="text-[#F8FAFC]/80">Приморский край, г. Уссурийск, пер. Мирный, д. 1</span></div>
                        <div><span className="text-[#F8FAFC]/40">ИНН: </span><span className="text-[#F8FAFC]/80">2511135442</span></div>
                        <div><span className="text-[#F8FAFC]/40">КПП: </span><span className="text-[#F8FAFC]/80">251101001</span></div>
                        <div><span className="text-[#F8FAFC]/40">Р/с: </span><span className="text-[#F8FAFC]/80 font-mono text-xs">40702810820110001074</span></div>
                        <div><span className="text-[#F8FAFC]/40">Банк: </span><span className="text-[#F8FAFC]/80">АО «Альфа-Банк», Хабаровск</span></div>
                        <div><span className="text-[#F8FAFC]/40">БИК: </span><span className="text-[#F8FAFC]/80">040813770</span></div>
                        <div><span className="text-[#F8FAFC]/40">Телефон: </span><span className="text-[#F8FAFC]/80">+7 (4212) 51-59-30 (приёмная, доб. 701, 702)</span></div>
                      </div>
                    </div>
                    <div className="glass-card rounded-xl p-5">
                      <div className="text-xs text-[#7B3FBF] font-bold uppercase tracking-wider mb-3">Подрядчик</div>
                      <div className="space-y-1.5 text-sm">
                        {['Наименование кадрового агентства', 'Юридический адрес', 'ИНН / КПП', 'Расчётный счёт', 'Банк', 'Корр. счёт', 'БИК'].map(f => (
                          <div key={f}><span className="text-[#F8FAFC]/40">{f}: </span><span className="text-[#F8FAFC]/30 italic">[{f.toLowerCase()}]</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-3">
                <h3 className="text-lg font-black text-[#F8FAFC] mb-2">Основные положения договора</h3>
                {contractSections.map((sec) => (
                  <div key={sec.num} className="glass-card rounded-xl overflow-hidden">
                    <button onClick={() => setOpenSection(openSection === sec.num ? null : sec.num)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#7B3FBF]/20 text-[#7B3FBF] flex items-center justify-center text-xs font-black flex-shrink-0">{sec.num}</span>
                        <span className="font-bold text-[#F8FAFC]">{sec.title}</span>
                      </div>
                      <span className={`text-[#7B3FBF] transition-transform ${openSection === sec.num ? 'rotate-90' : ''}`}>›</span>
                    </button>
                    <AnimatePresence>
                      {openSection === sec.num && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-6 pb-5 border-t border-[rgba(255,255,255,0.05)]">
                            {sec.items.map((item, i) => (
                              <div key={i} className="flex gap-3 mt-3 text-sm text-[#F8FAFC]/65">
                                <span className="text-[#7B3FBF] flex-shrink-0 font-bold">{i + 1}.</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Appendices */}
              <div>
                <h3 className="text-lg font-black text-[#F8FAFC] mb-4">Приложения к договору</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {appendices.map((a) => (
                    <div key={a.num} className="glass-card-gold rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-[#C9A84C]" />
                        </div>
                        <div>
                          <div className="text-xs text-[#C9A84C] font-bold mb-1">Приложение № {a.num}</div>
                          <div className="font-bold text-[#F8FAFC] text-sm mb-1">{a.title}</div>
                          <div className="text-xs text-[#F8FAFC]/50">{a.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidentiality notice */}
              <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-5 text-sm text-[#F8FAFC]/60">
                <span className="font-bold text-red-400">КОНФИДЕНЦИАЛЬНО.</span> Документ содержит конфиденциальные сведения коммерческого и организационного характера. Использование, копирование, пересылка либо раскрытие условий допускаются исключительно в целях согласования, заключения и исполнения договора между Сторонами.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}