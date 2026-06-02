export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#05070A] border-t border-[rgba(123,63,191,0.15)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png"
                alt="B"
                className="w-8 h-8 object-contain"
              />
              <img
                src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/aed774101_2_1.png"
                alt="Bratouverie"
                className="h-6 object-contain"
                style={{ filter: 'invert(1) brightness(2)' }}
              />
            </div>
            <p className="text-sm text-[#F8FAFC]/40 leading-relaxed max-w-xs">
              ООО «Братоуверие-СНБ» — генеральный подрядчик государственного рекрутинга.
              Принцип: «Своих не бросаем».
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[#F8FAFC]/30 uppercase tracking-widest mb-4">Разделы</div>
              <div className="space-y-2">
                {[
                  { label: 'О компании', href: '#about' },
                  { label: 'Проекты', href: '#projects' },
                  { label: 'Услуги', href: '#services' },
                  { label: 'Документы', href: '#documents' },
                  { label: 'Команда', href: '#team' },
                  { label: 'Контакты', href: '#contacts' },
                  { label: 'Согласие на обработку ПД', href: '/privacy' },
                ].map((l) => (
                  <a key={l.href} href={l.href} className="block text-sm text-[#F8FAFC]/55 hover:text-[#F8FAFC] transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#F8FAFC]/30 uppercase tracking-widest mb-4">Контакты</div>
              <div className="space-y-2">
                <a href="tel:+74212515930" className="block text-sm text-[#F8FAFC]/55 hover:text-[#C9A84C] transition-colors">+7 (4212) 51-59-30 (приёмная, доб. 701, 702)</a>
                <a href="tel:+74996861317" className="block text-sm text-[#F8FAFC]/55 hover:text-[#C9A84C] transition-colors">+7 (499) 686-13-17 (горячая линия)</a>
                <a href="mailto:anufriev@bratouverie-snb.ru" className="block text-sm text-[#F8FAFC]/55 hover:text-[#C9A84C] transition-colors">anufriev@bratouverie-snb.ru</a>
                <a href="mailto:mikhliaev@bratouverie-snb.ru" className="block text-sm text-[#F8FAFC]/55 hover:text-[#C9A84C] transition-colors">mikhliaev@bratouverie-snb.ru</a>
              </div>
            </div>
          </div>

          {/* Rekvizity */}
          <div>
            <div className="text-xs text-[#F8FAFC]/30 uppercase tracking-widest mb-4">Реквизиты</div>
            <div className="space-y-1.5">
              {[
                'ОГРН 1262500006966',
                'ИНН 2511135442',
                'КПП 251101001',
                '692510, Приморский край,',
                'г. Уссурийск, пер. Мирный, д.1',
              ].map((r) => (
                <div key={r} className="text-xs text-[#F8FAFC]/35 font-mono">{r}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(123,63,191,0.12)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#F8FAFC]/25">
            © {year} ООО «Братоуверие-СНБ». Все права защищены.
          </p>
          <p className="text-xs text-[#F8FAFC]/20">
            ОКВЭД 78.10 · 78.20 · 78.30
          </p>
        </div>
      </div>
    </footer>
  );
}