import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Calendar, 
  Clock, 
  FileText, 
  BookOpen, 
  Target, 
  GraduationCap, 
  Upload, 
  CheckCircle2,
  AlertCircle,
  Paperclip,
  ChevronRight,
  Sparkles,
  HelpCircle,
  UserPlus,
  Layers
} from 'lucide-react';
import { DisciplineService } from '../../../modules/discipline/discipline.service';
import { StorageService } from '../../../modules/storage/storage.service';

interface RoadmapManagerProps {
  disciplineId: string;
  onClose: () => void;
  onSuccess: () => void;
  initialTab?: TabType;
}

export type TabType = 'lesson' | 'assignment' | 'evaluation' | 'material' | 'faq' | 'member';

const RoadmapManager: React.FC<RoadmapManagerProps> = ({ disciplineId, onClose, onSuccess, initialTab }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'lesson');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [points, setPoints] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [userIdToInvite, setUserIdToInvite] = useState('');
  const [files, setFiles] = useState<{ name: string; url: string; type: 'mandatory' | 'complementary' | 'normal' }[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'mandatory' | 'complementary' | 'normal') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const path = `disciplines/${disciplineId}/materials/${Date.now()}_${file.name}`;
      const url = await StorageService.uploadFile(path, file);
      setFiles(prev => [...prev, { name: file.name, url, type: fileType }]);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Erro ao fazer upload do arquivo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (activeTab !== 'member' && !title && activeTab !== 'material') {
      alert("Por favor, preencha o título/pergunta.");
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'lesson') {
        await DisciplineService.addLesson(disciplineId, {
          title,
          date: date.split('-').reverse().join('/'),
          watched: false,
          order: Date.now()
        });
        for (const file of files) {
          await DisciplineService.addMaterial(disciplineId, {
            name: `${file.name} (${file.type === 'mandatory' ? 'Obrigatório' : 'Complementar'})`,
            type: 'PDF',
            date: new Date().toLocaleDateString('pt-BR'),
            url: file.url
          });
        }
      } else if (activeTab === 'assignment') {
        await DisciplineService.addAssignment(disciplineId, {
          title,
          description,
          dueDate: date,
          dueTime: time,
          points: Number(points) || 0,
          status: 'Aberto',
          attachments: files.map(f => ({ name: f.name, url: f.url }))
        });
      } else if (activeTab === 'evaluation') {
        await DisciplineService.addEvaluation(disciplineId, {
          title,
          date: date.split('-').reverse().join('/'),
          status: 'Agendada'
        });
      } else if (activeTab === 'material') {
        for (const file of files) {
          await DisciplineService.addMaterial(disciplineId, {
            name: file.name,
            type: 'PDF',
            date: new Date().toLocaleDateString('pt-BR'),
            url: file.url
          });
        }
      } else if (activeTab === 'faq') {
        await DisciplineService.addFAQ(disciplineId, {
          question: title,
          answer: faqAnswer
        });
      } else if (activeTab === 'member') {
        await DisciplineService.addMember(disciplineId, userIdToInvite);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving roadmap item:", error);
      alert("Erro ao salvar. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'lesson', label: 'Nova Aula', icon: BookOpen, desc: 'Conteúdo e materiais' },
    { id: 'assignment', label: 'Trabalho', icon: Target, desc: 'Instruções e prazos' },
    { id: 'evaluation', label: 'Avaliação', icon: GraduationCap, desc: 'Provas e testes' },
    { id: 'material', label: 'Material', icon: Layers, desc: 'Upload de arquivos' },
    { id: 'faq', label: 'Dúvida', icon: HelpCircle, desc: 'Pergunta e resposta' },
    { id: 'member', label: 'Matricular', icon: UserPlus, desc: 'Convidar aluno' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 h-[700px]">
        
        {/* Sidebar: Navigation */}
        <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-800/50 p-8 flex flex-col border-r border-slate-100 dark:border-slate-800 overflow-y-auto no-scrollbar">
          <div className="mb-10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Gerenciador</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-[#006c55] mt-1">Disciplina Thoth</p>
          </div>

          <nav className="space-y-2 flex-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex flex-col p-4 rounded-2xl transition-all text-left group ${
                  activeTab === tab.id 
                  ? 'bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-[#006c55]' : 'text-slate-400 group-hover:text-slate-600'} />
                  <span className={`text-sm font-black ${activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                    {tab.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium pl-7">{tab.desc}</span>
              </button>
            ))}
          </nav>

          <button 
            onClick={onClose}
            className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronRight size={14} className="rotate-180" />
            Cancelar e Sair
          </button>
        </div>

        {/* Main Content: Form */}
        <div className="flex-1 p-8 flex flex-col overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-slate-500 font-medium">Preencha os detalhes para atualizar o portal dos alunos.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#006c55]/10 flex items-center justify-center text-[#006c55]">
              {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Sparkles, { size: 24 })}
            </div>
          </div>

          <div className="space-y-6 flex-1">
            {/* Conditional Content based on activeTab */}
            {activeTab === 'member' ? (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">UID do Aluno</label>
                  <div className="relative group">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006c55] transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={userIdToInvite}
                      onChange={e => setUserIdToInvite(e.target.value)}
                      placeholder="Cole o ID do usuário (ex: aBc123...)"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all"
                    />
                  </div>
                </div>
                <div className="p-6 bg-[#006c55]/5 border border-[#006c55]/10 rounded-2xl flex gap-4">
                  <AlertCircle size={24} className="text-[#006c55] shrink-0" />
                  <p className="text-xs text-[#006c55] font-medium leading-relaxed">
                    Ao matricular um aluno, ele terá acesso total ao chat, materiais e roteiro da disciplina. Certifique-se de que o ID está correto.
                  </p>
                </div>
              </div>
            ) : activeTab === 'material' ? (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Upload de Arquivos</label>
                    <div 
                      className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl hover:border-[#006c55]/30 hover:bg-emerald-50/10 transition-all cursor-pointer group"
                      onClick={() => document.getElementById('standalone-material')?.click()}
                    >
                      <input 
                        type="file" 
                        id="standalone-material" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'normal')}
                        disabled={uploading}
                      />
                      <Upload size={48} className="text-slate-200 group-hover:text-[#006c55] mb-4 transition-colors" />
                      <span className="text-sm font-black text-slate-900 dark:text-white mb-1">Selecionar Arquivos</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PDF, PPT, DOCX</span>
                    </div>
                 </div>
              </div>
            ) : activeTab === 'faq' ? (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Pergunta (Dúvida Comum)</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Onde encontro o bibliografia básica?"
                    className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Resposta do Professor</label>
                  <textarea 
                    value={faqAnswer}
                    onChange={e => setFaqAnswer(e.target.value)}
                    placeholder="Escreva a resposta aqui..."
                    className="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all resize-none"
                  />
                </div>
              </div>
            ) : (
              // Original Forms: Lesson, Assignment, Evaluation
              <>
                 <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    {activeTab === 'assignment' ? 'Título do Trabalho' : 'Título / Tema'}
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006c55] transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder={activeTab === 'lesson' ? "Ex: Introdução à Antropologia" : "Ex: Projeto Final Semestre"}
                      className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Data</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006c55] transition-colors" size={18} />
                      <input 
                        type="date" 
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Horário</label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#006c55] transition-colors" size={18} />
                      <input 
                        type="time" 
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {activeTab === 'assignment' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Pontuação Máxima</label>
                    <input 
                      type="number" 
                      value={points}
                      onChange={e => setPoints(e.target.value)}
                      placeholder="Ex: 10.0"
                      className="w-full h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Descrição / Instruções</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Detalhe o conteúdo programático ou orientações..."
                    className="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all resize-none"
                  />
                </div>
              </>
            )}

            {/* File Upload Section for original types */}
            {(activeTab === 'lesson' || activeTab === 'assignment') && (
              <div className="space-y-4 pt-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Materiais e Anexos</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="file" id="mandatory-file" className="hidden" onChange={(e) => handleFileUpload(e, 'mandatory')} disabled={uploading} />
                  <label htmlFor="mandatory-file" className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl hover:border-[#006c55]/30 hover:bg-emerald-50/10 transition-all cursor-pointer group">
                    <Upload size={20} className="text-slate-300 group-hover:text-[#006c55] mb-2" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Obrigatório</span>
                  </label>
                  <input type="file" id="comp-file" className="hidden" onChange={(e) => handleFileUpload(e, 'complementary')} disabled={uploading} />
                  <label htmlFor="comp-file" className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl hover:border-[#006c55]/30 hover:bg-emerald-50/10 transition-all cursor-pointer group">
                    <Plus size={20} className="text-slate-300 group-hover:text-[#006c55] mb-2" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Complementar</span>
                  </label>
                </div>
              </div>
            )}

            {/* Files List Display */}
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <Paperclip size={14} className="text-[#006c55]" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{file.name}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${file.type === 'mandatory' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {file.type}
                    </span>
                  </div>
                  <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                </div>
              ))}
              {uploading && (
                <div className="flex items-center gap-2 text-[10px] font-black text-[#006c55] animate-pulse">
                  <Sparkles size={12} className="animate-spin" /> SUBINDO ARQUIVO...
                </div>
              )}
            </div>
          </div>

          <div className="pt-8 mt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2 text-slate-400">
                <AlertCircle size={14} />
                <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Visibilidade: Alunos Matriculados</span>
             </div>
             <button 
              onClick={handleSave}
              disabled={loading || uploading}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#006c55] to-[#018e6f] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#006c55]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
             >
               {loading ? 'Salvando...' : (
                 <>
                   <span>{activeTab === 'member' ? 'Confirmar Matrícula' : 'Publicar no Roteiro'}</span>
                   <CheckCircle2 size={18} />
                 </>
               )}
             </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default RoadmapManager;
