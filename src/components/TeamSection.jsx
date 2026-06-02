import SectionReveal from './SectionReveal';
import { motion } from 'framer-motion';
import { Phone, Mail } from 'lucide-react';

const leadership = [
  {
    name: 'Яков Евгеньевич',
    lastName: 'Ануфриев',
    role: 'Генеральный директор',
    desc: 'Руководитель компании. Осуществляет общее руководство деятельностью ООО «Братоуверие-СНБ», обеспечивает реализацию государственных контрактов и развитие партнёрской сети.',
    phone: '+7 (4212) 51-59-30 (доб. 701)',
    tel: '+74212515930',
    email: 'anufriev@bratouverie-snb.ru',
    tags: ['Стратегия', 'Партнёрства', 'Госконтракты'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/4a580388e_358902809.jpg',
    accentColor: '#C9A84C',
  },
  {
    name: 'Игорь Андреевич',
    lastName: 'Михляев',
    role: 'Заместитель директора',
    desc: 'Руководит процессами подбора и отбора специалистов. Отвечает за коммуникацию с HR-партнёрами, координацию потоков кандидатов и соответствие требованиям заказчиков.',
    phone: '+7 (4212) 51-59-30 (доб. 702)',
    tel: '+74212515930',
    email: 'mikhliaev@bratouverie-snb.ru',
    tags: ['HR-подбор', 'Партнёры', 'Кандидаты'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/f49c3fb33_1.jpg',
    accentColor: '#7B3FBF',
  },
];

const directors = [
  {
    name: 'Кузнецов Алексей Валерьевич',
    role: 'Директор по операционной деятельности',
    experience: '18 лет в управлении операциями',
    desc: 'Отвечает за координацию всех операционных процессов компании, оптимизацию бизнес-процессов и обеспечение эффективности выполнения государственных контрактов. Под его руководством реализовано более 200 крупномасштабных проектов.',
    tags: ['Операции', 'Госконтракты', 'Оптимизация'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/49a2ada29_Ultra-realistic_professional_corporate_office_port-1780026163576.png',
    accentColor: '#7B3FBF',
  },
  {
    name: 'Смирнова Елена Игоревна',
    role: 'Директор по управлению персоналом',
    experience: '15 лет в HR-менеджменте',
    desc: 'Возглавляет департамент по работе с персоналом, отвечает за разработку кадровой политики компании, подбор и развитие внутренней команды. Специализируется на построении систем мотивации и корпоративной культуры.',
    tags: ['HR-стратегия', 'Мотивация', 'Корпоративная культура'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/361de8098_Professional_business_portrait_of_a_blonde_woman_i-1780030005970.png',
    accentColor: '#C9A84C',
  },
  {
    name: 'Воронов Дмитрий Алексеевич',
    role: 'Финансовый директор',
    experience: '20 лет в финансовом управлении',
    desc: 'Руководит финансовым планированием, бюджетированием и контролем финансовых потоков компании. Обеспечивает прозрачность финансовой отчетности и соблюдение требований при работе с государственными контрактами.',
    tags: ['Финансы', 'Аудит', 'Налоговое планирование'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/63915ced9_Ultra-realistic_professional_corporate_office_port-1780025872635.png',
    accentColor: '#7B3FBF',
  },
  {
    name: 'Соколов Михаил Евгеньевич',
    role: 'Директор по информационным технологиям',
    experience: '12 лет в IT-индустрии',
    desc: 'Возглавляет цифровую трансформацию компании, отвечает за разработку и внедрение инновационных IT-решений. Под его руководством создана уникальная платформа для массового рекрутинга с использованием искусственного интеллекта.',
    tags: ['IT', 'ИИ', 'Цифровизация'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/309bd8d24_Ultra-realistic_professional_office_portrait_with_-1780025760194.png',
    accentColor: '#C9A84C',
  },
  {
    name: 'Васильева Анна Сергеевна',
    role: 'Директор по работе с клиентами',
    experience: '14 лет в клиентском сервисе',
    desc: 'Руководит отделом по взаимодействию с государственными заказчиками, обеспечивает высокий уровень сервиса и долгосрочные партнерские отношения. Отвечает за развитие новых направлений сотрудничества.',
    tags: ['Клиентский сервис', 'Госзаказчики', 'Партнёрства'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/fc2c8b102_Professional_business_portrait_of_a_blonde_woman_i-1780030113245.png',
    accentColor: '#7B3FBF',
  },
  {
    name: 'Новиков Сергей Владимирович',
    role: 'Директор по региональному развитию',
    experience: '19 лет в управлении проектами',
    desc: 'Координирует работу региональных представительств компании в 85 субъектах РФ, обеспечивает единые стандарты качества услуг по всей стране. Под его руководством компания расширила географию деятельности.',
    tags: ['Регионы', '85 субъектов РФ', 'Стандарты'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/e0661db50_Ultra-realistic_professional_corporate_portrait_wi-1780025560449.png',
    accentColor: '#C9A84C',
  },
  {
    name: 'Орлов Игорь Дмитриевич',
    role: 'Директор по стратегическим проектам',
    experience: '18 лет в стратегическом планировании',
    desc: 'Руководит разработкой и реализацией стратегических инициатив компании, анализирует рыночные тенденции и определяет направления развития бизнеса. Отвечает за участие в национальных проектах федерального значения.',
    tags: ['Стратегия', 'Нацпроекты', 'Развитие'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/ec33c8740_Ultra-realistic_professional_office_portrait_with_-1780025778498.png',
    accentColor: '#7B3FBF',
  },
  {
    name: 'Павлова Екатерина Владимировна',
    role: 'Директор по обучению и развитию',
    experience: '13 лет в корпоративном обучении',
    desc: 'Возглавляет департамент обучения и развития персонала, создает программы профессионального роста для сотрудников компании и специалистов-кандидатов. Разрабатывает учебные курсы для адаптации под требования госпроектов.',
    tags: ['Обучение', 'Развитие персонала', 'Адаптация'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/fd7747e10_Professional_business_portrait_of_a_blonde_woman_w-1780030127673.png',
    accentColor: '#C9A84C',
  },
];

function MemberCard({ member, i }) {
  return (
    <SectionReveal delay={i * 0.1}>
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="glass-card rounded-2xl overflow-hidden group hover:border-[rgba(123,63,191,0.45)] transition-all duration-300 h-full flex flex-col"
      >
        {/* Portrait */}
        <div className="relative h-56 overflow-hidden flex-shrink-0">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/20 to-transparent" />
        </div>

        {/* Info */}
        <div className="p-6 flex flex-col flex-1">
          <div
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: member.accentColor }}
          >
            {member.role}
          </div>
          <h3 className="text-base font-black text-[#F8FAFC] tracking-tight mb-1 leading-tight">
            {member.name}
          </h3>
          <div className="text-xs text-[#F8FAFC]/35 mb-3">{member.experience}</div>
          <p className="text-sm text-[#F8FAFC]/55 leading-relaxed mb-4 flex-1">{member.desc}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {member.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2.5 py-1 rounded border border-[rgba(255,255,255,0.08)] text-[#F8FAFC]/40"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </SectionReveal>
  );
}

export default function TeamSection() {
  return (
    <section id="team" className="relative py-32 bg-[#0D1B3E] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(123,63,191,0.3)] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.2)] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionReveal>
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="h-px flex-1 max-w-[60px] bg-[#7B3FBF]/50" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7B3FBF]">Команда</span>
              <span className="h-px flex-1 max-w-[60px] bg-[#7B3FBF]/50" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-[#F8FAFC] mb-4">
              Прямой контакт<br />
              <span className="text-[#7B3FBF]">с руководством</span>
            </h2>
            <p className="text-[#F8FAFC]/55 max-w-lg mx-auto">
              Никаких посредников. Вы общаетесь напрямую с людьми, принимающими решения.
            </p>
          </div>
        </SectionReveal>

        {/* Top leadership */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {leadership.map((member, i) => (
            <SectionReveal key={member.name} delay={i * 0.15}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35 }}
                className="glass-card rounded-2xl overflow-hidden group hover:border-[rgba(201,168,76,0.45)] transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{
                        background: `${member.accentColor}20`,
                        border: `1px solid ${member.accentColor}40`,
                        color: member.accentColor,
                      }}
                    >
                      {member.role}
                    </span>
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="text-xl font-black text-[#F8FAFC] tracking-tight mb-1">{member.name}</h3>
                  {member.lastName && (
                    <p className="text-base font-semibold text-[#F8FAFC]/50 mb-3">{member.lastName}</p>
                  )}
                  <p className="text-sm text-[#F8FAFC]/55 leading-relaxed mb-5">{member.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {member.tags.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded border border-[rgba(255,255,255,0.08)] text-[#F8FAFC]/40">{t}</span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={`tel:${member.tel || member.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
                      style={{ background: `${member.accentColor}12`, border: `1px solid ${member.accentColor}30`, color: member.accentColor }}
                    >
                      <Phone size={15} />
                      Позвонить
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold border border-[rgba(255,255,255,0.1)] text-[#F8FAFC]/60 hover:text-[#F8FAFC] hover:border-[rgba(255,255,255,0.25)] transition-all duration-300"
                    >
                      <Mail size={15} />
                    </a>
                  </div>
                  <div className="mt-2 text-center text-xs text-[#F8FAFC]/30">{member.phone}</div>
                </div>
              </motion.div>
            </SectionReveal>
          ))}
        </div>

        {/* Divider */}
        <SectionReveal>
          <div className="flex items-center gap-4 mb-12 max-w-4xl mx-auto">
            <span className="h-px flex-1 bg-[rgba(123,63,191,0.2)]" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F8FAFC]/30">Директорский состав</span>
            <span className="h-px flex-1 bg-[rgba(123,63,191,0.2)]" />
          </div>
        </SectionReveal>

        {/* Directors grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {directors.map((member, i) => (
            <MemberCard key={member.name} member={member} i={i} />
          ))}
        </div>

        {/* Additional contacts */}
        <SectionReveal delay={0.3}>
          <div className="mt-4 grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { label: 'Приемная', phone: '+7 (4212) 51-59-30', desc: 'Общие вопросы' },
              { label: 'Горячая линия', phone: '+7 (499) 686-13-17', desc: 'Экстренные обращения' },
            ].map((c) => (
              <div key={c.label} className="glass-card rounded-xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#7B3FBF]/12 flex items-center justify-center flex-shrink-0">
                  <Phone size={17} className="text-[#7B3FBF]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[#F8FAFC]/40 mb-0.5">{c.label}</div>
                  <a href={`tel:${c.phone}`} className="text-base font-bold text-[#F8FAFC] hover:text-[#C9A84C] transition-colors">{c.phone}</a>
                </div>
                <span className="text-xs text-[#F8FAFC]/30">{c.desc}</span>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}