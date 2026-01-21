
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Lock, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

const PrinterLogin: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [stationId, setStationId] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login de gráfica
    navigate('/printers/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#006c55]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[440px] bg-white/5 backdrop-blur-2xl rounded-[40px] p-10 border border-white/10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#006c55] rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-[#006c55]/20 mb-6">
            <Printer size={32} strokeWidth={2.5} />
          </div>
          <div className="text-[32px] font-black text-white tracking-tighter leading-none mb-2">thoth <span className="text-[#006c55]">print</span></div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-500">Terminal de Gestão Gráfica</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">ID da Estação</label>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#006c55] transition-colors" size={18} />
              <input 
                type="text" 
                required
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                placeholder="Ex: GR-RIODEJANEIRO-01"
                className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-[16px] font-medium text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Código de Segurança</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[#006c55] transition-colors" size={18} />
              <input 
                type="password" 
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-[16px] font-medium text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">
              Acesso restrito a parceiros certificados. IP registrado para auditoria de segurança.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full h-16 bg-[#006c55] hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#006c55]/20 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Acessar Terminal <ArrowRight size={18} />
          </button>
        </form>

        <button 
          onClick={() => navigate('/')}
          className="mt-8 w-full text-center text-slate-500 hover:text-white transition-colors text-[11px] font-black uppercase tracking-widest"
        >
          Voltar ao Portal do Aluno
        </button>
      </div>
    </div>
  );
};

export default PrinterLogin;
