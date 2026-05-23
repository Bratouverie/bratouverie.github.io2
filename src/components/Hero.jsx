import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const iconScale = useTransform(scrollYProgress, [0, 1], [1, 2.5]);
  const iconOpacity = useTransform(scrollYProgress, [0, 0.5], [0.07, 0]);

  return (
    <section id="hero" ref={ref} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <motion.div
        style={{ scale: bgScale, opacity: bgOpacity }}
        className="absolute inset-0 z-0"
      >
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1800&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/60 via-[#0D1B3E]/70 to-[#05070A]" />
      </motion.div>

      {/* Background B icon — parallax */}
      <motion.div
        style={{ scale: iconScale, opacity: iconOpacity }}
        className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none"
      >
        <img
          src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png"
          alt=""
          className="w-96 h-96 object-contain"
        />
      </motion.div>

      {/* Grid lines decorative */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(123,63,191,1) 1px, transparent 1px), linear-gradient(90deg, rgba(123,63,191,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-10 text-center pt-24 pb-8 md:pt-0 md:pb-0">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5 max-w-[90vw]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse flex-shrink-0" />
          <span className="text-[#C9A84C] text-[10px] sm:text-xs font-semibold tracking-[0.1em] uppercase leading-tight">
            Генеральный подрядчик государственного рекрутинга
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] text-[#F8FAFC] leading-[0.95] mb-5"
        >
          Ваш надёжный
          <br />
          <span className="text-[#7B3FBF]">партнёр</span> в сфере
          <br />
          <span className="text-[#C9A84C]">рекрутинга</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-base md:text-xl text-[#F8FAFC]/60 max-w-2xl mx-auto mb-8 leading-relaxed px-2"
        >
          ООО «Братоуверие-СНБ» — официальный партнёр Правительства РФ.
          Прямой доступ к государственным проектам. Постоянный поток вакансий.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="#contacts"
            className="w-full sm:w-auto px-8 py-3.5 rounded text-sm font-bold tracking-wide bg-[#7B3FBF] hover:bg-[#8B4FCF] text-white transition-all duration-300 shadow-[0_0_40px_rgba(123,63,191,0.4)] hover:shadow-[0_0_60px_rgba(123,63,191,0.6)] text-center"
          >
            Начать сотрудничество
          </a>
          <a
            href="#projects"
            className="w-full sm:w-auto px-8 py-3.5 rounded text-sm font-semibold tracking-wide border border-[#F8FAFC]/20 text-[#F8FAFC]/80 hover:text-[#F8FAFC] hover:border-[#F8FAFC]/40 transition-all duration-300 text-center"
          >
            Наши проекты
          </a>
        </motion.div>

        {/* Stats preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-12 grid grid-cols-3 gap-4 md:gap-16"
        >
          {[
            { num: '10 187', label: 'специалистов' },
            { num: '30+', label: 'городов' },
            { num: '50+', label: 'проектов' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-4xl font-black text-[#C9A84C] tracking-[-0.03em]">{s.num}</div>
              <div className="text-[10px] md:text-xs text-[#F8FAFC]/40 uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[#F8FAFC]/30"
      >
        <span className="text-xs tracking-widest uppercase">Прокрутить</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}