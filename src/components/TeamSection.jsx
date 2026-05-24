import SectionReveal from './SectionReveal';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageSquare } from 'lucide-react';

const team = [
  {
    name: 'Яков Евгеньевич',
    lastName: 'Ануфриев',
    role: 'Генеральный директор',
    desc: 'Руководитель компании. Осуществляет общее руководство деятельностью ООО «Братоуверие-СНБ», обеспечивает реализацию государственных контрактов и развитие партнёрской сети.',
    phone: '+7 950 282-46-45',
    email: 'anufriev@bratouverie-snb.ru',
    tags: ['Стратегия', 'Партнёрства', 'Госконтракты'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/2cd95b20d_2.jpg',
    accentColor: '#C9A84C',
  },
  {
    name: 'Игорь Андреевич',
    lastName: 'Михляев',
    role: 'Заместитель директора',
    desc: 'Руководит процессами подбора и отбора специалистов. Отвечает за коммуникацию с HR-партнёрами, координацию потоков кандидатов и соответствие требованиям заказчиков.',
    phone: '+7 922 312-07-35',
    email: 'mikhliaev@bratouverie-snb.ru',
    tags: ['HR-подбор', 'Партнёры', 'Кандидаты'],
    image: 'https://media.base44.com/images/public/6a118622c856f058618fff8e/f49c3fb33_1.jpg',
    accentColor: '#7B3FBF',
  },
];

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

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, i) => (
            <SectionReveal key={member.name} delay={i * 0.15}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35 }}
                className="glass-card rounded-2xl overflow-hidden group hover:border-[rgba(123,63,191,0.45)] transition-all duration-300"
              >
                {/* Portrait */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-transparent" />
                  <div className="absolute inset-0"
                    style={{ background: `linear-gradient(to bottom right, ${member.accentColor}10, transparent)` }}
                  />
                  {/* Role badge */}
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

                {/* Info */}
                <div className="p-7">
                  <h3 className="text-xl font-black text-[#F8FAFC] tracking-tight mb-1">
                    {member.name}
                  </h3>
                  {member.lastName && (
                    <p className="text-base font-semibold text-[#F8FAFC]/50 mb-3">{member.lastName}</p>
                  )}
                  <p className="text-sm text-[#F8FAFC]/55 leading-relaxed mb-5">{member.desc}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {member.tags.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded border border-[rgba(255,255,255,0.08)] text-[#F8FAFC]/40">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <a
                      href={`tel:${member.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
                      style={{
                        background: `${member.accentColor}12`,
                        border: `1px solid ${member.accentColor}30`,
                        color: member.accentColor,
                      }}
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

        {/* Additional contacts */}
        <SectionReveal delay={0.3}>
          <div className="mt-12 grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
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