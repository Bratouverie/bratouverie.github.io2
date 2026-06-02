import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect } from 'react';

function AnimatedNumber({ value, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 2000, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString('ru-RU') + suffix);

  useEffect(() => {
    if (isInView) motionVal.set(value);
  }, [isInView, motionVal, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

const stats = [
  { value: 10187, suffix: '', label: 'СПЕЦИАЛИСТОВ ПРИВЛЕЧЕНО', sub: 'подтверждено документально' },
  { value: 30, suffix: '+', label: 'НАСЕЛЁННЫХ ПУНКТОВ', sub: 'охвачено в ДНР и ЛНР' },
  { value: 10, suffix: '+', label: 'КРУПНЫХ ПРОЕКТОВ', sub: 'успешно реализовано' },
  { value: 20, suffix: '+', label: 'КАТЕГОРИЙ СПЕЦИАЛИСТОВ', sub: 'строители, водители, инженеры...' },
];

export default function StatsCounter() {
  return (
    <section id="projects" className="relative py-32 bg-[#0D1B3E] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(123,63,191,0.06) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.3)] to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(123,63,191,0.3)] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="h-px flex-1 max-w-[60px] bg-[#C9A84C]/40" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">Подтверждённый масштаб</span>
              <span className="h-px flex-1 max-w-[60px] bg-[#C9A84C]/40" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-[#F8FAFC]">
              Цифры говорят
              <span className="text-[#C9A84C]"> сами за себя</span>
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              whileHover={{ scale: 1.03 }}
              className="relative glass-card-gold rounded-xl p-5 md:p-8 text-center group cursor-default overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, rgba(123,63,191,0.12) 0%, transparent 70%)' }}
              />
              <div className="relative z-10">
                <div className="text-4xl md:text-6xl font-black text-[#C9A84C] tracking-[-0.04em] mb-2 md:mb-3"
                  style={{ textShadow: '0 0 30px rgba(201,168,76,0.3)' }}>
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-[10px] md:text-xs font-bold tracking-[0.1em] text-[#7B3FBF] mb-1 md:mb-2 leading-tight">{s.label}</div>
                <div className="text-[10px] md:text-xs text-[#F8FAFC]/40 leading-tight">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project details */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card rounded-xl p-8"
          >
            <div className="text-xs font-bold tracking-[0.15em] uppercase text-[#7B3FBF] mb-4">Ключевой проект</div>
            <h3 className="text-2xl font-bold text-[#F8FAFC] mb-4">Восстановление ДНР и ЛНР</h3>
            <p className="text-[#F8FAFC]/60 leading-relaxed mb-6">
              ООО «Братоуверие-СНБ» — генеральный подрядчик по подбору и размещению специалистов
              для восстановления более 30 населённых пунктов Луганской и Донецкой Народных Республик
              в соответствии с Постановлением Правительства РФ.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Старт набора: 01.06.2026', 'Период: июнь–июль', 'Отправка: июль 2026'].map((t) => (
                <span key={t} className="text-xs px-3 py-1.5 rounded border border-[rgba(201,168,76,0.3)] text-[#C9A84C]/80">{t}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <a href="https://vosstanovim-dnr.ru" target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded border border-[rgba(123,63,191,0.4)] text-[#7B3FBF] hover:bg-[#7B3FBF]/10 transition-colors">
                vosstanovim-dnr.ru ↗
              </a>
              <a href="https://vosstanovim-dnr.com" target="_blank" rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded border border-[rgba(123,63,191,0.4)] text-[#7B3FBF] hover:bg-[#7B3FBF]/10 transition-colors">
                vosstanovim-dnr.com ↗
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="glass-card rounded-xl p-8"
          >
            <div className="text-xs font-bold tracking-[0.15em] uppercase text-[#C9A84C] mb-4">Специалисты по направлениям</div>
            <div className="space-y-4">
              {[
                { name: 'Строители', pct: 45 },
                { name: 'Разнорабочие', pct: 25 },
                { name: 'Водители', pct: 15 },
                { name: 'Специализированные', pct: 15 },
              ].map((b) => (
                <div key={b.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#F8FAFC]/80">{b.name}</span>
                    <span className="text-[#C9A84C] font-bold">{b.pct}%</span>
                  </div>
                  <div className="h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${b.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #7B3FBF, #C9A84C)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}