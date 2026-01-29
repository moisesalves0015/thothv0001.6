
import React, { useState } from 'react';
import {
   Play,
   BookOpen,
   Clock,
   FileText,
   Link as LinkIcon,
   X,
   PenTool,
   GraduationCap,
   Sparkles,
   ArrowRight
} from 'lucide-react';

const Estudos: React.FC = () => {
   const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

   const mockMaterials = [
      { type: 'pdf', name: 'Resumo_História_Brasil.pdf', icon: FileText },
      { type: 'slides', name: 'Slides_Aula_05.pptx', icon: PresentationIcon },
      { type: 'link', name: 'Link: Artigo sobre TICS', icon: LinkIcon }
   ];

   return (
      <div className="flex flex-col gap-[30px] mt-0 animate-in fade-in duration-500 min-h-[600px]">
         <div className="thoth-page-header hidden lg:block">
            <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
               Página de Estudos
            </h1>
            <p className="text-slate-500 text-sm">Organize sua jornada e mergulhe no conhecimento.</p>
         </div>

         <div className="flex flex-col lg:flex-row gap-8">
            {/* Banner de Boas-vindas ao Estudo */}
            <div className="flex-1 glass-panel rounded-3xl p-8 flex flex-col justify-between border border-white/60 relative overflow-hidden bg-white/40">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#006c55]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

               <div className="relative z-10">
                  <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight">Mergulhe fundo nos seus objetivos.</h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md">
                     O modo estudo da Thoth foi desenhado para eliminar distrações e maximizar sua retenção de conteúdo.
                  </p>
               </div>

               <div className="mt-12 flex flex-col md:flex-row items-center gap-4 relative z-10">
                  <button
                     onClick={() => setIsFocusModeOpen(true)}
                     className="w-full md:w-auto flex items-center justify-center gap-3 bg-[#006c55] hover:bg-[#005a46] text-white px-8 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-2xl shadow-[#006c55]/30 transition-all active:scale-95 group"
                  >
                     <Play size={18} fill="currentColor" />
                     Iniciar sessão de estudo
                  </button>
                  <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/80 border border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-widest shadow-sm">
                     <Clock size={16} />
                     Sessão recomendada: 50 min
                  </div>
               </div>
            </div>

            {/* Info Cards Laterais */}
            <div className="w-full lg:w-[315px] space-y-6">
               <div className="glass-panel rounded-2xl p-6 border border-white/60 bg-white/40">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-[#006c55]/10 flex items-center justify-center text-[#006c55]">
                        <GraduationCap size={20} />
                     </div>
                     <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Nível de Foco</h3>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-[#006c55] w-[75%]" />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Excelente desempenho hoje!</p>
               </div>
            </div>
         </div>

         {/* Focus Mode Modal */}
         {isFocusModeOpen && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
               {/* Overlay */}
               <div
                  className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                  onClick={() => setIsFocusModeOpen(false)}
               />

               {/* Modal Container */}
               <div className="relative w-full max-w-[900px] max-h-[90vh] glass-panel bg-white/95 border border-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">

                  {/* Modal Header */}
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#006c55] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#006c55]/20">
                           <Sparkles size={24} />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Sessão de Estudos</h3>
                           <p className="text-[10px] font-bold text-[#006c55] uppercase tracking-[0.2em] mt-1.5 opacity-70">Foco Total Ativado • Bom Trabalho!</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setIsFocusModeOpen(false)}
                        className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 active:scale-90"
                     >
                        <X size={24} />
                     </button>
                  </div>

                  {/* Modal Body - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Coluna Esquerda */}
                        <div className="lg:col-span-8 space-y-8">

                           {/* 1. O que estudar hoje */}
                           <div className="space-y-3">
                              <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                                 <PenTool size={14} className="text-[#006c55]" /> O que você vai estudar hoje?
                              </label>
                              <input
                                 type="text"
                                 placeholder="Ex: Revolução Industrial - Tópicos Principais..."
                                 className="w-full h-16 px-6 bg-slate-50 border border-slate-100 rounded-3xl text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all"
                              />
                           </div>

                           {/* 2. Anotações Rápidas */}
                           <div className="space-y-3">
                              <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                                 <FileText size={14} className="text-[#006c55]" /> Anotações Rápidas
                              </label>
                              <textarea
                                 placeholder="Comece a rascunhar aqui..."
                                 className="w-full h-64 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-[15px] font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#006c55]/30 transition-all resize-none custom-scrollbar"
                              />
                           </div>
                        </div>

                        {/* Coluna Direita (Widgets) */}
                        <div className="lg:col-span-4 space-y-8">

                           {/* 3. Temporizador de Estudo (Mockup) */}
                           <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex flex-col items-center text-center">
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Temporizador</h4>
                              <div className="text-5xl font-black text-[#006c55] tracking-tighter mb-6 font-mono">
                                 50:00
                              </div>
                              <div className="flex gap-2 w-full">
                                 <button className="flex-1 h-12 bg-[#006c55] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#006c55]/20 active:scale-95">
                                    Começar
                                 </button>
                                 <button className="flex-1 h-12 bg-white text-slate-400 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95">
                                    Reset
                                 </button>
                              </div>
                           </div>

                           {/* 4. Materiais de Estudo (Mockup) */}
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Materiais de Estudo</h4>
                              <div className="space-y-3">
                                 {mockMaterials.map((mat, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl group cursor-pointer hover:border-[#006c55]/20 transition-all shadow-sm">
                                       <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#006c55] group-hover:text-white transition-all">
                                          <mat.icon size={18} />
                                       </div>
                                       <span className="text-[11px] font-bold text-slate-600 truncate flex-1">{mat.name}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>

                        </div>
                     </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gravando progresso automaticamente...</span>
                     </div>
                     <button
                        onClick={() => setIsFocusModeOpen(false)}
                        className="flex items-center gap-2 bg-[#006c55] text-white px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#006c55]/20 hover:scale-105 transition-all active:scale-95"
                     >
                        Finalizar Sessão <ArrowRight size={14} />
                     </button>
                  </div>
               </div>
            </div>
         )}

         <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 108, 85, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 108, 85, 0.2); }
      `}</style>
      </div>
   );
};

// Internal Mock Icon for Presentation
const PresentationIcon = ({ size }: { size: number }) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h20" /><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" /><path d="m7 21 5-5 5 5" />
   </svg>
);

export default Estudos;
