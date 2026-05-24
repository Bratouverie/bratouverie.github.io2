import SectionReveal from './SectionReveal';
import { ExternalLink } from 'lucide-react';

const projects = [
  {
    num: '01',
    title: 'Национальный проект «Кадры»',
    period: '2025–2030',
    desc: 'Проект, анонсированный в 2024 году, напрямую нацелен на решение задач массового привлечения и подготовки специалистов. Его инструменты включают сеть кадровых центров «Работа России», программы переобучения по 213 востребованным профессиям и индивидуальное сопровождение соискателей.',
  },
  {
    num: '02',
    title: 'Модернизация первичного звена здравоохранения',
    period: '2021–2030',
    desc: 'В рамках действующих национальных проектов за последние годы было построено и реконструировано более тысячи поликлиник, отремонтировано около 10 тысяч объектов здравоохранения. Такие масштабные работы создавали высокий спрос на врачей, медсестёр, инженеров и прорабов.',
  },
  {
    num: '03',
    title: 'Развитие сети образовательных учреждений',
    period: '2019–2024',
    desc: 'С 2019 года в рамках нацпроектов построено почти 1400 школ, введено в строй около 1700 детских садов, создано 246 тысяч мест в яслях. Реализация программ требовала массового привлечения педагогов, воспитателей и технического персонала.',
  },
  {
    num: '04',
    title: 'Масштабный набор специалистов по информационной безопасности',
    period: 'С 2022 года',
    desc: 'После подписания Указа Президента №250 «О дополнительных мерах по обеспечению информационной безопасности РФ» госорганы и предприятия КИИ значительно активизировали набор ИБ-специалистов. В первом полугодии 2024 года число вакансий в госсекторе выросло более чем в два раза.',
  },
  {
    num: '05',
    title: 'Национальные проекты «Инфраструктура для жизни» и «Эффективная и конкурентная экономика»',
    period: '2025–2030',
    desc: '«Инфраструктура для жизни» включает комплекс инициатив по модернизации ЖКХ, развитию транспорта и формированию комфортной городской среды. «Эффективная и конкурентная экономика» направлена на поддержку МСП и повышение производительности труда. Оба проекта требуют специалистов в строительстве, логистике и управлении проектами.',
  },
  {
    num: '06',
    title: 'Программы подготовки цифровых кадров',
    period: 'С 2021 года',
    desc: 'В рамках проектов по цифровой трансформации государства были запущены образовательные инициативы, такие как «Цифровые кафедры». Они не только готовили кадры, но и служили источником для последующего массового набора специалистов в госорганы и на госпредприятия.',
  },
  {
    num: '★',
    title: 'Арктический вызов',
    period: 'Текущий',
    desc: 'Масштабный проект по привлечению квалифицированных специалистов в регионы Крайнего Севера и Арктической зоны России. Направлен на обеспечение арктических регионов кадрами, развитие профессионального потенциала территорий, создание комфортных условий для переезда и реализацию крупных инфраструктурных проектов.',
    highlight: true,
  },
];

export default function NationalProjectsSection() {
  return (
    <section id="national-projects" className="relative py-32 bg-[#05070A] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(123,63,191,0.07) 0%, transparent 60%)' }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.2)] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionReveal>
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px flex-1 max-w-[60px] bg-[#7B3FBF]/50" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7B3FBF]">Государственные проекты</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-[#F8FAFC] mb-4">
            Проекты, в которых<br />
            <span className="text-[#C9A84C]">мы участвуем</span>
          </h2>
          <p className="text-[#F8FAFC]/55 max-w-2xl mb-16">
            ООО «Братоуверие-СНБ» обеспечивает кадровое сопровождение ключевых национальных проектов Российской Федерации.
          </p>
        </SectionReveal>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <SectionReveal key={p.num} delay={i * 0.08}>
              <div className={`rounded-xl p-6 h-full flex flex-col ${p.highlight ? 'glass-card-gold' : 'glass-card'} hover:border-[rgba(123,63,191,0.45)] transition-all duration-300`}>
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-2xl font-black ${p.highlight ? 'text-[#C9A84C]' : 'text-[#7B3FBF]/40'}`}>{p.num}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded ${p.highlight ? 'bg-[#C9A84C]/15 text-[#C9A84C]' : 'bg-[#7B3FBF]/10 text-[#7B3FBF]'}`}>{p.period}</span>
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC] mb-3 leading-snug">{p.title}</h3>
                <p className="text-sm text-[#F8FAFC]/55 leading-relaxed flex-1">{p.desc}</p>
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* DNR/LNR link */}
        <SectionReveal delay={0.3}>
          <div className="mt-12 glass-card-gold rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest mb-1">Ключевой проект</div>
              <div className="text-lg font-bold text-[#F8FAFC]">Восстановление ДНР и ЛНР</div>
              <div className="text-sm text-[#F8FAFC]/55 mt-1">Официальные сайты проекта</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="https://vosstanovim-dnr.ru" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors font-semibold">
                vosstanovim-dnr.ru <ExternalLink size={13} />
              </a>
              <a href="https://vosstanovim-dnr.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors font-semibold">
                vosstanovim-dnr.com <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}