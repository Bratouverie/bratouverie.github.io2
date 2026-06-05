import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'О компании', href: '#about' },
  { label: 'Проекты', href: '#projects' },
  { label: 'Услуги', href: '#services' },
  { label: 'Документы', href: '#documents' },
  { label: 'Команда', href: '#team' },
  { label: 'Блог', href: '/blog' },
  { label: 'Контакты', href: '#contacts' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#05070A]/90 backdrop-blur-xl border-b border-[rgba(123,63,191,0.15)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <img
            src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png"
            alt="Bratouverie icon"
            className="w-9 h-9 object-contain"
          />
          <div>
            <img
              src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/aed774101_2_1.png"
              alt="Bratouverie"
              className="h-6 object-contain"
              style={{ filter: 'invert(1) brightness(2)' }}
            />
            <div className="text-[9px] text-[#C9A84C]/70 tracking-[0.12em] uppercase font-semibold leading-tight mt-0.5">Группа компаний</div>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#F8FAFC]/70 hover:text-[#F8FAFC] transition-colors duration-200 tracking-wide"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden lg:block">
          <a
            href="#contacts"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded border border-[#C9A84C]/40 text-[#C9A84C] hover:bg-[#C9A84C]/10 hover:border-[#C9A84C]/70 transition-all duration-300"
          >
            Стать партнёром
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-[#F8FAFC] p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#05070A]/95 backdrop-blur-xl border-t border-[rgba(123,63,191,0.15)] overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-[#F8FAFC]/80 hover:text-[#F8FAFC]"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#contacts"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex justify-center px-6 py-3 text-sm font-semibold rounded border border-[#C9A84C]/40 text-[#C9A84C]"
              >
                Стать партнёром
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}