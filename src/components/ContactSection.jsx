import { useState } from 'react';
import SectionReveal from './SectionReveal';
import { motion } from 'framer-motion';
import { Send, MapPin, Mail, Phone, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', company: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error('Заполните обязательные поля: имя и телефон');
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    toast.success('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
  };

  const inputClass = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg px-4 py-3.5 text-sm text-[#F8FAFC] placeholder:text-[#F8FAFC]/30 focus:outline-none focus:border-[#7B3FBF] focus:ring-1 focus:ring-[#7B3FBF]/30 transition-all duration-200";

  return (
    <section id="contacts" className="relative py-32 bg-[#05070A] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom center, rgba(123,63,191,0.08) 0%, transparent 60%)' }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.25)] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-20">
          <SectionReveal>
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="h-px flex-1 max-w-[60px] bg-[#C9A84C]/40" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">Партнёрство</span>
              <span className="h-px flex-1 max-w-[60px] bg-[#C9A84C]/40" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-[#F8FAFC] mb-4">
              Начните<br />
              <span className="text-[#C9A84C]">сотрудничество</span>
            </h2>
            <p className="text-[#F8FAFC]/55 max-w-xl mx-auto">
              Оставьте заявку — мы свяжемся с вами в течение рабочего дня и обсудим условия долгосрочного партнёрства.
            </p>
          </SectionReveal>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — form */}
          <SectionReveal delay={0.1}>
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-2xl p-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#7B3FBF]/15 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={32} className="text-[#7B3FBF]" />
                </div>
                <h3 className="text-2xl font-bold text-[#F8FAFC] mb-3">Заявка отправлена!</h3>
                <p className="text-[#F8FAFC]/55 mb-8">
                  Мы получили вашу заявку и свяжемся с вами в ближайшее время. Также вы можете позвонить нам напрямую.
                </p>
                <a
                  href="tel:+79191072244"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#7B3FBF] hover:bg-[#8B4FCF] text-white text-sm font-bold transition-all"
                >
                  <Phone size={16} />
                  +7 919 107-22-44
                </a>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#F8FAFC]/40 mb-2 tracking-wide">Имя *</label>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#F8FAFC]/40 mb-2 tracking-wide">Компания</label>
                    <input
                      type="text"
                      placeholder="Название агентства"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#F8FAFC]/40 mb-2 tracking-wide">Телефон *</label>
                  <input
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#F8FAFC]/40 mb-2 tracking-wide">Сообщение</label>
                  <textarea
                    rows={5}
                    placeholder="Опишите вашу компанию и интерес к сотрудничеству..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={inputClass + ' resize-none'}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-lg bg-[#7B3FBF] hover:bg-[#8B4FCF] text-white text-sm font-bold tracking-wide transition-all duration-300 shadow-[0_0_30px_rgba(123,63,191,0.3)] hover:shadow-[0_0_50px_rgba(123,63,191,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Отправляем...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Отправить заявку
                    </>
                  )}
                </motion.button>
                <p className="text-center text-xs text-[#F8FAFC]/25">
                  Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                </p>
              </form>
            )}
          </SectionReveal>

          {/* Right — contact info */}
          <SectionReveal delay={0.2}>
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-bold text-[#C9A84C] uppercase tracking-widest mb-5">Контактная информация</h3>
                <div className="space-y-5">
                  {[
                    {
                      icon: Phone,
                      items: [
                        { label: 'Яков Евгеньевич (директор)', value: '+7 919 107-22-44', href: 'tel:+79191072244' },
                        { label: 'Игорь Андреевич (подбор)', value: '+7 922 312-07-35', href: 'tel:+79223120735' },
                        { label: 'Администрация', value: '+7 (4212) 51-59-30', href: 'tel:+74212515930' },
                        { label: 'Горячая линия', value: '+7 (499) 686-13-17', href: 'tel:+74996861317' },
                      ]
                    },
                    {
                      icon: Mail,
                      items: [
                        { label: 'Email', value: 'partner@bratouverie.ru', href: 'mailto:partner@bratouverie.ru' },
                        { label: 'Email', value: 'support@bratouverie.ru', href: 'mailto:support@bratouverie.ru' },
                      ]
                    },
                    {
                      icon: MapPin,
                      items: [
                        { label: 'Юридический адрес', value: '692510, Приморский край, г. Уссурийск, пер. Мирный, д.1' },
                        { label: 'Офис', value: 'г. Хабаровск, ул. Карла Маркса, 66' },
                      ]
                    },
                  ].map(({ icon: Icon, items }) => (
                    <div key={items[0].label} className="flex gap-4">
                      <div className="w-8 h-8 rounded bg-[#7B3FBF]/12 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className="text-[#7B3FBF]" />
                      </div>
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <div key={item.value}>
                            <div className="text-xs text-[#F8FAFC]/35">{item.label}</div>
                            {item.href ? (
                              <a href={item.href} className="text-sm font-medium text-[#F8FAFC]/80 hover:text-[#C9A84C] transition-colors">{item.value}</a>
                            ) : (
                              <div className="text-sm text-[#F8FAFC]/70">{item.value}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rekvizity */}
              <div className="glass-card-gold rounded-xl p-6">
                <h3 className="text-sm font-bold text-[#C9A84C] uppercase tracking-widest mb-4">Реквизиты</h3>
                <div className="space-y-2">
                  {[
                    ['ОГРН', '1262500006966'],
                    ['ИНН', '2511135442'],
                    ['КПП', '251101001'],
                    ['Р/с', '40702810820110001074'],
                    ['Банк', 'АО «Альфа-Банк» Хабаровск'],
                    ['БИК', '040813770'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="text-xs text-[#F8FAFC]/35 w-12 flex-shrink-0 font-mono">{k}</span>
                      <span className="text-xs text-[#F8FAFC]/65 font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}