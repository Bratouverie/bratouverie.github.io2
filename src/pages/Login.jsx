import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Введите email и пароль'); return; }
    setLoading(true);
    setError('');
    try {
      await base44.auth.signInWithEmailPassword(email, password);
      window.location.href = '/';
    } catch (err) {
      setError('Неверный email или пароль');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(123,63,191,0.15) 0%, transparent 60%)' }} className="absolute inset-0" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(123,63,191,0.4)] to-transparent" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(123,63,191,1) 1px, transparent 1px), linear-gradient(90deg, rgba(123,63,191,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#7B3FBF] via-[#C9A84C] to-[#7B3FBF]" />

          <div className="p-8 md:p-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-10">
              <div className="flex items-center gap-3 mb-5">
                <img
                  src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png"
                  alt="Братоуверие-СНБ"
                  className="w-12 h-12 object-contain"
                />
                <img
                  src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/aed774101_2_1.png"
                  alt="Bratouverie"
                  className="h-8 object-contain"
                  style={{ filter: 'invert(1) brightness(2)' }}
                />
              </div>
              <h1 className="text-xl font-black text-[#F8FAFC] text-center">Вход в систему</h1>
              <p className="text-sm text-[#F8FAFC]/40 mt-1 text-center">Управление кадровыми агентствами</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#F8FAFC]/40 mb-2 tracking-wide">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F8FAFC]/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.25)] rounded-xl text-sm text-[#F8FAFC] placeholder:text-[#F8FAFC]/20 focus:outline-none focus:border-[#7B3FBF] focus:ring-1 focus:ring-[#7B3FBF]/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#F8FAFC]/40 mb-2 tracking-wide">Пароль</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F8FAFC]/30" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.25)] rounded-xl text-sm text-[#F8FAFC] placeholder:text-[#F8FAFC]/20 focus:outline-none focus:border-[#7B3FBF] focus:ring-1 focus:ring-[#7B3FBF]/30 transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#F8FAFC]/30 hover:text-[#F8FAFC]/60 transition-colors">
                    {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#7B3FBF] hover:bg-[#8B4FCF] text-white text-sm font-bold tracking-wide transition-all duration-300 shadow-[0_0_30px_rgba(123,63,191,0.3)] hover:shadow-[0_0_50px_rgba(123,63,191,0.5)] disabled:opacity-60 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><span>Войти</span><ArrowRight size={16}/></>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[rgba(123,63,191,0.12)] text-center">
              <p className="text-xs text-[#F8FAFC]/25">
                ООО «Братоуверие-СНБ» · bratouverie-snb.ru
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}