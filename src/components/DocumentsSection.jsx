import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionReveal from './SectionReveal';
import { Link } from 'react-router-dom';
import { FileText, X, ExternalLink, Shield, Building, BookOpen, Lock } from 'lucide-react';

const documents = [
  {
    icon: FileText,
    title: 'Карточка предприятия',
    subtitle: 'Актуальные реквизиты',
    date: '20.04.2026',
    description: 'Полная карточка предприятия с банковскими реквизитами. ОГРН 1262500006966, ИНН 2511135442, р/с 40702810820110001074, Альфа-Банк.',
    badge: 'Действующее',
    badgeColor: 'gold',
    details: [
      { label: 'Полное наименование', value: 'ООО «Братоуверие-СНБ»' },
      { label: 'Статус', value: 'Действующее юридическое лицо' },
      { label: 'Дата регистрации', value: '20.04.2026' },
      { label: 'ОГРН', value: '1262500006966' },
      { label: 'ИНН', value: '2511135442' },
      { label: 'КПП', value: '251101001' },
      { label: 'ОКПО', value: '80569777' },
      { label: 'Р/с', value: '40702810820110001074' },
      { label: 'Банк', value: 'Филиал «Хабаровский» АО «Альфа-Банк»' },
      { label: 'БИК', value: '040813770' },
      { label: 'К/с', value: '30101810800000000770' },
    ],
  },
  {
    icon: Shield,
    title: 'Выписка из ЕГРЮЛ',
    subtitle: 'ФНС России',
    date: '21.05.2026',
    description: 'Официальная выписка из Единого государственного реестра юридических лиц, сформированная 21.05.2026. Подписана УКЭП ФНС.',
    badge: 'Подписана УКЭП',
    badgeColor: 'purple',
    details: [
      { label: 'Номер выписки', value: 'ЮЭ9965-26-92573877' },
      { label: 'Дата формирования', value: '21.05.2026' },
      { label: 'Организационно-правовая форма', value: 'ООО' },
      { label: 'Основной ОКВЭД', value: '78.10 — Деятельность агентств по подбору персонала' },
      { label: 'Доп. ОКВЭД 1', value: '78.20 — Деятельность агентств по временному трудоустройству' },
      { label: 'Доп. ОКВЭД 2', value: '78.30 — Деятельность по подбору персонала прочая' },
      { label: 'Генеральный директор', value: 'Ануфриев Яков Евгеньевич' },
      { label: 'Уставный капитал', value: '10 000 ₽' },
      { label: 'Рег. орган', value: 'МИФНС № 15 по Приморскому краю' },
    ],
  },
  {
    icon: BookOpen,
    title: 'Устав общества',
    subtitle: 'Учредительный документ',
    date: '14.04.2026',
    description: 'Устав ООО «Братоуверие-СНБ», утверждённый решением единственного учредителя №1. Определяет порядок деятельности общества.',
    badge: 'Действующий',
    badgeColor: 'gold',
    details: [
      { label: 'Тип документа', value: 'Устав ООО' },
      { label: 'Дата утверждения', value: '14.04.2026' },
      { label: 'Учредитель', value: 'Ануфриев Яков Евгеньевич (100%)' },
      { label: 'Срок деятельности', value: 'Без ограничения' },
      { label: 'Исполнительный орган', value: 'Генеральный директор, срок полномочий 5 лет' },
      { label: 'Место регистрации', value: 'г. Уссурийск, Приморский край' },
      { label: 'Основная цель', value: 'Извлечение прибыли' },
      { label: 'Подписан', value: 'УКЭП (Карзанова Надежда Валерьевна)' },
    ],
  },
  {
    icon: Building,
    title: 'Лист записи ЕГРЮЛ',
    subtitle: 'Форма № Р50007',
    date: '20.04.2026',
    description: 'Официальный лист записи о создании юридического лица. Выдан МИФНС № 15 по Приморскому краю 20 апреля 2026 года.',
    badge: 'Официальный',
    badgeColor: 'purple',
    details: [
      { label: 'Форма', value: '№ Р50007' },
      { label: 'Дата записи', value: '20.04.2026' },
      { label: 'ГРН', value: '1262500006966' },
      { label: 'Причина записи', value: 'Создание юридического лица' },
      { label: 'Количество учредителей', value: '1 (физическое лицо)' },
      { label: 'Количество ОКВЭД', value: '3 вида деятельности' },
      { label: 'Выдан', value: 'МИФНС № 15 по Приморскому краю' },
      { label: 'Начальник отдела', value: 'Карзанова Надежда Валерьевна' },
    ],
  },
];

function DocumentModal({ doc, onClose }) {
  const Icon = doc.icon;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#05070A]/80 backdrop-blur-md" />
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#0A0D16] border border-[rgba(123,63,191,0.3)] rounded-2xl shadow-[0_0_80px_rgba(123,63,191,0.2)]"
      >
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#7B3FBF]/15 flex items-center justify-center">
                <Icon size={22} className="text-[#7B3FBF]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F8FAFC]">{doc.title}</h3>
                <p className="text-sm text-[#F8FAFC]/40">{doc.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] flex items-center justify-center transition-colors text-[#F8FAFC]/60 hover:text-[#F8FAFC]"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-sm text-[#F8FAFC]/60 leading-relaxed mb-6">{doc.description}</p>
          <div className="space-y-3">
            {doc.details.map((d) => (
              <div key={d.label} className="flex items-start gap-3 py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                <span className="text-xs text-[#F8FAFC]/40 flex-shrink-0 w-40 pt-0.5">{d.label}</span>
                <span className="text-sm text-[#F8FAFC]/85 font-medium">{d.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-[rgba(123,63,191,0.2)]">
            <span className="text-xs text-[#F8FAFC]/30">
              Для получения оригинала документа свяжитесь с нами: +7 919 107-22-44
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DocumentsSection() {
  const [activeDoc, setActiveDoc] = useState(null);

  return (
    <section id="documents" className="relative py-32 bg-[#05070A] overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at top left, rgba(201,168,76,0.05) 0%, transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <SectionReveal>
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px flex-1 max-w-[60px] bg-[#C9A84C]/40" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">Прозрачность</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-[#F8FAFC] leading-[0.95]">
              Документы<br />и<span className="text-[#C9A84C]"> соответствие</span>
            </h2>
            <p className="text-[#F8FAFC]/55 self-end leading-relaxed">
              Полный пакет регистрационных документов. Официально действующее юридическое лицо,
              зарегистрированное в ЕГРЮЛ. Нажмите на карточку для просмотра деталей.
            </p>
          </div>
        </SectionReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {documents.map((doc, i) => {
            const Icon = doc.icon;
            const isGold = doc.badgeColor === 'gold';
            return (
              <SectionReveal key={doc.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setActiveDoc(doc)}
                  className="glass-card-gold rounded-xl p-6 cursor-pointer group hover:border-[rgba(201,168,76,0.5)] transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center mb-4 group-hover:bg-[#C9A84C]/18 transition-colors">
                    <Icon size={18} className="text-[#C9A84C]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#F8FAFC] mb-1">{doc.title}</h3>
                  <p className="text-xs text-[#F8FAFC]/40 mb-4">{doc.subtitle}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#F8FAFC]/30">{doc.date}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      isGold ? 'bg-[#C9A84C]/15 text-[#C9A84C]' : 'bg-[#7B3FBF]/15 text-[#7B3FBF]'
                    }`}>
                      {doc.badge}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-[#F8FAFC]/30 group-hover:text-[#C9A84C]/60 transition-colors">
                    <ExternalLink size={11} />
                    <span>Просмотреть</span>
                  </div>
                </motion.div>
              </SectionReveal>
            );
          })}
        </div>

        {/* Partner documents */}
        <SectionReveal delay={0.3}>
          <div className="mt-14">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px flex-1 max-w-[40px] bg-[#7B3FBF]/40" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#7B3FBF]">Для партнёров</span>
              <span className="h-px flex-1 bg-[#7B3FBF]/15" />
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { title: 'Коммерческое предложение', desc: 'Презентация для кадрового агентства о сотрудничестве в рамках Программы восстановления ДНР и ЛНР', href: '/presentation', color: '#7B3FBF' },
                { title: 'Заявка на подбор сотрудников', desc: 'Программа массового подбора специалистов для участия в восстановлении инфраструктуры ЛНР и ДНР', href: '/application', color: '#C9A84C' },
                { title: 'Договор с кадровым агентством', desc: 'Договор на оказание услуг по подбору персонала с приложениями (Техническое задание, акты, реестры)', href: '/contract', color: '#7B3FBF' },
              ].map(doc => (
                <Link key={doc.title} to={doc.href}
                  className="glass-card rounded-xl p-6 group hover:border-[rgba(123,63,191,0.45)] transition-all duration-300 block">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors"
                    style={{ background: doc.color + '18' }}>
                    <FileText size={18} style={{ color: doc.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-[#F8FAFC] mb-2">{doc.title}</h3>
                  <p className="text-xs text-[#F8FAFC]/45 leading-relaxed mb-4">{doc.desc}</p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    style={{ color: doc.color + '99' }}>
                    <Lock size={11} />
                    <span>Просмотреть / Скачать</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>

      <AnimatePresence>
        {activeDoc && <DocumentModal doc={activeDoc} onClose={() => setActiveDoc(null)} />}
      </AnimatePresence>
    </section>
  );
}