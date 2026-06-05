import { useParams, Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { blogPosts } from './Blog';
import { blogArticles } from '../data/blogArticles';

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);
  const article = blogArticles[slug];

  if (!post || !article) {
    return (
      <div className="min-h-screen bg-[#05070A] font-inter flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#F8FAFC] mb-4">Статья не найдена</h1>
          <Link to="/blog" className="text-[#7B3FBF] hover:text-[#C9A84C]">← Вернуться в блог</Link>
        </div>
      </div>
    );
  }

  const currentIndex = blogPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#05070A] font-inter">
      <Nav />

      {/* Hero image */}
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img
          src={post.image}
          alt={post.imageAlt}
          title={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/40 via-transparent to-[#05070A]" />
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 pb-20 -mt-16 relative z-10">
        {/* Back */}
        <div className="mb-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-colors">
            <ArrowLeft size={14} /> Все статьи
          </Link>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded bg-[#7B3FBF]/20 text-[#7B3FBF]">{post.category}</span>
            <span className="flex items-center gap-1.5 text-xs text-[#F8FAFC]/35"><Calendar size={11} />{post.date}</span>
            <span className="flex items-center gap-1.5 text-xs text-[#F8FAFC]/35"><Clock size={11} />{post.readTime}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-[#F8FAFC] leading-tight mb-8">
            {post.title}
          </h1>

          {/* Content */}
          <div className="prose-content text-[#F8FAFC]/75 leading-relaxed space-y-6">
            {article.sections.map((section, i) => (
              <div key={i}>
                {section.h2 && (
                  <h2 className="text-xl md:text-2xl font-black text-[#F8FAFC] mt-10 mb-4 pb-2 border-b border-[rgba(123,63,191,0.2)]">
                    {section.h2}
                  </h2>
                )}
                {section.h3 && (
                  <h3 className="text-lg font-bold text-[#C9A84C] mt-6 mb-3">{section.h3}</h3>
                )}
                {section.p && <p className="text-base leading-relaxed text-[#F8FAFC]/70">{section.p}</p>}
                {section.list && (
                  <ul className="space-y-2 mt-3">
                    {section.list.map((item, j) => (
                      <li key={j} className="flex gap-3 text-[#F8FAFC]/70">
                        <span className="text-[#7B3FBF] flex-shrink-0 font-bold mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.table && (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr>
                          {section.table.headers.map((h, j) => (
                            <th key={j} className="text-left px-4 py-3 bg-[#0D1B3E] text-[#C9A84C] font-bold border border-[rgba(123,63,191,0.2)]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, j) => (
                          <tr key={j} className="odd:bg-[rgba(255,255,255,0.02)]">
                            {row.map((cell, k) => (
                              <td key={k} className="px-4 py-3 text-[#F8FAFC]/65 border border-[rgba(123,63,191,0.12)]">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {section.highlight && (
                  <div className="glass-card-gold rounded-xl p-5 mt-4">
                    <p className="text-[#F8FAFC]/80 italic">{section.highlight}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 glass-card rounded-2xl p-8 text-center">
            <h3 className="text-xl font-black text-[#F8FAFC] mb-3">Готовы рассмотреть вакансию?</h3>
            <p className="text-[#F8FAFC]/55 mb-6">Свяжитесь с нами — расскажем об условиях и поможем с оформлением документов.</p>
            <a href="/#contacts"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#7B3FBF] text-white font-bold hover:bg-[#8B4FCF] transition-colors">
              Связаться с нами
            </a>
          </div>

          {/* Nav between posts */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {prevPost ? (
              <Link to={`/blog/${prevPost.slug}`}
                className="glass-card rounded-xl p-4 hover:border-[rgba(201,168,76,0.4)] transition-all group">
                <div className="text-xs text-[#F8FAFC]/35 mb-1 flex items-center gap-1"><ArrowLeft size={11} /> Предыдущая</div>
                <div className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#C9A84C] transition-colors line-clamp-2">{prevPost.title}</div>
              </Link>
            ) : <div />}
            {nextPost && (
              <Link to={`/blog/${nextPost.slug}`}
                className="glass-card rounded-xl p-4 hover:border-[rgba(201,168,76,0.4)] transition-all group text-right">
                <div className="text-xs text-[#F8FAFC]/35 mb-1 flex items-center gap-1 justify-end">Следующая <ArrowRight size={11} /></div>
                <div className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#C9A84C] transition-colors line-clamp-2">{nextPost.title}</div>
              </Link>
            )}
          </div>
        </motion.article>
      </div>

      <Footer />
    </div>
  );
}