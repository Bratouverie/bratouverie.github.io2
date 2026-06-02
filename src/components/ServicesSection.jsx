import SectionReveal from './SectionReveal';
import { Briefcase, Clock, BarChart2, Network, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    icon: Briefcase,
    code: '78.10',
    title: 'Подбор персонала для госпроектов',
    desc: 'Полный цикл подбора специалистов под конкретные задачи государственных проектов. Многоступенчатый отбор, проверка квалификации, документальное оформление.',
    features: ['Строители и монтажники', 'Инженерно-технический персонал', 'Операторы спецтехники', 'Медицинские работники', 'Операторы БПЛА'],
  },
  {
    icon: Clock,
    code: '78.20',
    title: 'Временное трудоустройство',
    desc: 'Деятельность агентств по временному трудоустройству. Вахтовый метод работы с чётким графиком ротации и гарантированной своевременной оплатой.',
    features: ['Официальное оформление', 'Социальный пакет', 'Вахтовый метод', 'Зарплата от 300 000 ₽', 'Долгосрочные контракты'],
  },
  {
    icon: BarChart2,
    code: '78.30',
    title: 'Стратегическое планирование кадров',
    desc: 'Разработка стратегий реализации кадровых проектов любой сложности. Анализ требований, планирование потоков, управление рисками.',
    features: ['Анализ требований заказчика', 'Прогнозирование потребностей', 'Кадровое планирование', 'Управление проектами', 'Постоянное сопровождение'],
  },
  {
    icon: Network,
    code: 'B2B',
    title: 'Партнёрство с HR-агентствами',
    desc: 'Приглашаем HR-агентства и частных HR-специалистов к долгосрочному сотрудничеству. Постоянный поток вакансий из государственных проектов.',
    features: ['Постоянный поток заявок', 'Своевременная оплата', 'Контракты 1–3 года', 'Приоритетный доступ', 'Индивидуальный подход'],
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-32 bg-[#05070A] overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(201,168,76,0.04) 0%, transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionReveal>
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px flex-1 max-w-[60px] bg-[#7B3FBF]/50" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7B3FBF]">Направления работы</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-[#F8FAFC] leading-[0.95]">
              Наши<br /><span className="text-[#7B3FBF]">услуги</span>
            </h2>
            <p className="text-[#F8FAFC]/55 self-end leading-relaxed">
              Полный спектр HR-услуг для реализации государственных проектов. От подбора отдельных специалистов
              до комплексного кадрового обеспечения федеральных программ.
            </p>
          </div>
        </SectionReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <SectionReveal key={s.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card rounded-xl p-8 h-full group hover:border-[rgba(123,63,191,0.45)] transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-lg bg-[#7B3FBF]/12 flex items-center justify-center group-hover:bg-[#7B3FBF]/22 transition-colors">
                      <Icon size={22} className="text-[#7B3FBF]" />
                    </div>
                    <span className="text-xs font-mono text-[#C9A84C]/60 border border-[rgba(201,168,76,0.2)] px-2 py-1 rounded">
                      ОКВЭД {s.code}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">{s.title}</h3>
                  <p className="text-sm text-[#F8FAFC]/55 leading-relaxed mb-6">{s.desc}</p>
                  <div className="space-y-2">
                    {s.features.map((f) => (
                      <div key={f} className="flex items-center gap-2.5">
                        <CheckCircle size={13} className="text-[#7B3FBF] flex-shrink-0" />
                        <span className="text-sm text-[#F8FAFC]/65">{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}