import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export const blogPosts = [
  {
    slug: 'vakhtovaya-rabota-dnr-lnr-2026',
    title: 'Вахтовая работа в ДНР и ЛНР в 2026 году: условия, зарплаты, перспективы',
    excerpt: 'Подробный гид для специалистов, рассматривающих работу на вахте в Донецкой и Луганской Народных Республиках в 2026 году. Условия труда, размер заработной платы, социальные гарантии и порядок трудоустройства.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    imageAlt: 'Строительные работы восстановление ДНР ЛНР вахта 2026',
    date: '2026-06-05',
    readTime: '8 мин',
    category: 'Трудоустройство',
  },
  {
    slug: 'zarplata-stroitelya-v-dnr',
    title: 'Зарплата строителя в ДНР: от 300 000 рублей — реальность или миф?',
    excerpt: 'Разбираемся, какую зарплату реально получают строители, работающие на восстановлении инфраструктуры в новых регионах России. Официальные данные, структура выплат, надбавки и льготы.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    imageAlt: 'Зарплата строителя ДНР 300000 рублей строительство',
    date: '2026-06-04',
    readTime: '7 мин',
    category: 'Зарплаты',
  },
  {
    slug: 'vosstanovlenie-gorodov-dnr-lnr',
    title: 'Восстановление городов ДНР и ЛНР: масштаб работ и потребность в специалистах',
    excerpt: 'Государственная программа восстановления новых регионов России предусматривает колоссальный объём строительных и инженерных работ. Какие специалисты нужны, сколько их требуется и каковы условия участия.',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    imageAlt: 'Восстановление городов ДНР ЛНР строительство инфраструктура',
    date: '2026-06-03',
    readTime: '10 мин',
    category: 'Проекты',
  },
  {
    slug: 'kadrovoe-agentstvo-gosproekty',
    title: 'Как работает кадровое агентство на государственных проектах: опыт Братоуверие-СНБ',
    excerpt: 'Государственный рекрутинг — особая сфера кадровых услуг, требующая специфических компетенций. Рассказываем, как устроена работа генерального подрядчика по подбору персонала для федеральных программ.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    imageAlt: 'Кадровое агентство государственные проекты подбор персонала',
    date: '2026-06-02',
    readTime: '9 мин',
    category: 'О компании',
  },
  {
    slug: 'usloviya-vakhtovoy-raboty',
    title: 'Условия вахтовой работы в новых регионах: жильё, питание, транспорт',
    excerpt: 'Один из главных вопросов для специалистов, рассматривающих работу на вахте — бытовые условия. Рассказываем о размещении, питании, транспортном обеспечении и социальной инфраструктуре на объектах в ДНР и ЛНР.',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80',
    imageAlt: 'Условия вахтовой работы жильё питание транспорт ДНР',
    date: '2026-06-01',
    readTime: '6 мин',
    category: 'Условия труда',
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-[#05070A] font-inter">
      <Nav />

      <div className="pt-32 pb-20 px-6 lg:px-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="h-px flex-1 max-w-[60px] bg-[#C9A84C]/40" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A84C]">Полезные материалы</span>
            <span className="h-px flex-1 max-w-[60px] bg-[#C9A84C]/40" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-[#F8FAFC] mb-4">
            Блог <span className="text-[#7B3FBF]">Братоуверие-СНБ</span>
          </h1>
          <p className="text-[#F8FAFC]/55 max-w-2xl mx-auto text-lg">
            Экспертные статьи о вахтовой работе, государственных проектах и рынке труда в новых регионах России
          </p>
        </motion.div>

        {/* Featured post */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-12"
        >
          <Link to={`/blog/${blogPosts[0].slug}`} className="group block">
            <div className="glass-card rounded-2xl overflow-hidden hover:border-[rgba(123,63,191,0.45)] transition-all duration-300">
              <div className="md:grid md:grid-cols-2">
                <div className="relative h-64 md:h-auto overflow-hidden">
                  <img
                    src={blogPosts[0].image}
                    alt={blogPosts[0].imageAlt}
                    title={blogPosts[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#05070A]/60" />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="text-xs font-bold px-3 py-1 rounded bg-[#7B3FBF]/20 text-[#7B3FBF] w-fit mb-4">
                    {blogPosts[0].category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-[#F8FAFC] mb-4 group-hover:text-[#C9A84C] transition-colors leading-tight">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-[#F8FAFC]/55 mb-6 leading-relaxed">{blogPosts[0].excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-[#F8FAFC]/35">
                      <span className="flex items-center gap-1.5"><Calendar size={12} />{blogPosts[0].date}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} />{blogPosts[0].readTime}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[#C9A84C] text-sm font-bold group-hover:gap-2 transition-all">
                      Читать <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts.slice(1).map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`} className="group block h-full">
                <div className="glass-card rounded-xl overflow-hidden hover:border-[rgba(123,63,191,0.45)] transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden flex-shrink-0">
                    <img
                      src={post.image}
                      alt={post.imageAlt}
                      title={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#05070A]/80 backdrop-blur-sm text-[#7B3FBF]">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-lg font-black text-[#F8FAFC] mb-3 group-hover:text-[#C9A84C] transition-colors leading-snug flex-1">
                      {post.title}
                    </h2>
                    <p className="text-sm text-[#F8FAFC]/50 mb-4 leading-relaxed line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3 text-xs text-[#F8FAFC]/30">
                        <span className="flex items-center gap-1"><Calendar size={11} />{post.date}</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{post.readTime}</span>
                      </div>
                      <span className="flex items-center gap-1 text-[#7B3FBF] text-xs font-bold group-hover:gap-2 transition-all">
                        Читать <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}