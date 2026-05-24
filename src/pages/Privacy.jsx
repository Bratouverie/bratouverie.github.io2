import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#05070A] font-inter">
      <Nav />
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-24">
        <h1 className="text-3xl md:text-4xl font-black text-[#F8FAFC] tracking-tight mb-2">
          Согласие на обработку персональных данных
        </h1>
        <p className="text-[#C9A84C] text-sm font-semibold mb-10">ООО «Братоуверие-СНБ»</p>

        <div className="space-y-6 text-[#F8FAFC]/70 leading-relaxed text-sm">
          <p>
            Настоящим я, субъект персональных данных, в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
            «О персональных данных», свободно, своей волей и в своём интересе даю согласие обществу с ограниченной
            ответственностью <span className="text-[#F8FAFC]/90 font-semibold">«Братоуверие-СНБ»</span> (ОГРН 1262500006966, ИНН 2511135442, адрес: 692510,
            Приморский край, г. Уссурийск, пер. Мирный, д.1) на обработку следующих персональных данных:
          </p>

          <div className="glass-card rounded-xl p-6 space-y-2">
            <p className="text-[#F8FAFC]/90 font-semibold mb-3">Перечень обрабатываемых персональных данных:</p>
            {[
              'Фамилия, имя, отчество',
              'Контактный номер телефона',
              'Адрес электронной почты',
              'Наименование организации (для юридических лиц)',
              'Содержание обращения или заявки',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-[#C9A84C] mt-2 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-xl p-6 space-y-3">
            <p className="text-[#F8FAFC]/90 font-semibold mb-1">Цели обработки:</p>
            <p>Обработка осуществляется в целях рассмотрения заявок и обращений, установления обратной связи,
              заключения и исполнения договоров, а также информирования о деятельности компании.</p>
          </div>

          <div className="glass-card rounded-xl p-6 space-y-3">
            <p className="text-[#F8FAFC]/90 font-semibold mb-1">Способы обработки:</p>
            <p>Сбор, запись, систематизация, накопление, хранение, уточнение (обновление, изменение),
              извлечение, использование, передача (распространение, предоставление, доступ), обезличивание,
              блокирование, удаление, уничтожение персональных данных.</p>
          </div>

          <p>
            Обработка персональных данных осуществляется <span className="text-[#F8FAFC]/90">смешанным способом</span> — с
            использованием средств автоматизации и без таковых.
          </p>

          <p>
            Согласие действует с момента его предоставления и до достижения целей обработки персональных данных либо
            до момента его отзыва субъектом персональных данных. Отзыв согласия осуществляется путём направления
            письменного заявления по адресу Оператора или на электронную почту{' '}
            <a href="mailto:anufriev@bratouverie-snb.ru" className="text-[#C9A84C] hover:underline">anufriev@bratouverie-snb.ru</a>.
          </p>

          <p>
            Оператор обязуется не раскрывать третьим лицам и не распространять персональные данные без согласия
            субъекта персональных данных, если иное не предусмотрено федеральным законодательством.
          </p>

          <div className="border-t border-[rgba(123,63,191,0.2)] pt-6 text-xs text-[#F8FAFC]/40">
            <p>ООО «Братоуверие-СНБ» · ОГРН 1262500006966 · ИНН 2511135442</p>
            <p>692510, Приморский край, г. Уссурийск, пер. Мирный, д.1</p>
            <p className="mt-1">
              <a href="mailto:anufriev@bratouverie-snb.ru" className="hover:text-[#C9A84C] transition-colors">anufriev@bratouverie-snb.ru</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}