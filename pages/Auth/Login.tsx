
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Check } from 'lucide-react';
import { AuthService } from '../../modules/auth/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../firebase';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // Get global auth state

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/home');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await setPersistence(auth, keepLoggedIn ? browserLocalPersistence : browserSessionPersistence);
      await AuthService.login(email, password);
      navigate('/home');
    } catch (err) {
      const error = err as { code?: string; message?: string };
      console.error("Auth Error:", error.code);
      if (error.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Erro ao conectar com o Thoth. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] glass-panel rounded-[32px] p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="text-[40px] font-black text-[#006c55] tracking-tighter leading-none mb-2">thoth</div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">Plataforma Criativa</p>
        </div>

        <div className="space-y-1 mb-8 text-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bem-vindo de volta</h2>
          <p className="text-sm text-slate-500">Acesse sua conta para continuar.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <p className="text-red-600 text-[11px] font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006c55]" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-14 pl-12 pr-4 bg-white/50 border border-white/60 rounded-2xl text-[16px] focus:outline-none focus:border-[#006c55] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Senha</label>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006c55]" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 pl-12 pr-4 bg-white/50 border border-white/60 rounded-2xl text-[16px] focus:outline-none focus:border-[#006c55] transition-all"
              />
            </div>
          </div>

          <div
            className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${keepLoggedIn ? 'bg-[#006c55]/5 border-[#006c55] shadow-sm' : 'bg-white/30 border-white/60 hover:bg-white/50'}`}
            onClick={() => setKeepLoggedIn(!keepLoggedIn)}
          >
            <div className={`w-6 h-6 rounded-[8px] border-2 flex items-center justify-center transition-all duration-300 ${keepLoggedIn ? 'bg-[#006c55] border-[#006c55] scale-105' : 'bg-white border-slate-300'}`}>
              {keepLoggedIn && <Check size={14} className="text-white" strokeWidth={4} />}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold transition-colors ${keepLoggedIn ? 'text-[#006c55]' : 'text-slate-600'}`}>Manter conectado</span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">Não será necessário logar novamente</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#006c55] hover:bg-[#005a46] text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#006c55]/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <>Entrar no Thoth <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Ainda não tem conta?{' '}
            <Link to="/signup" className="font-black text-[#006c55] hover:underline uppercase tracking-tighter text-xs">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
