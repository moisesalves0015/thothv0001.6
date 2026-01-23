
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Bell, 
  ArrowRight,
  CheckCircle2,
  Globe,
  Mail,
  Sparkles,
  Zap,
  Cpu,
  ShieldCheck,
  Smartphone,
  MousePointer2,
  Layers,
  Play,
  Mic,
  Image as ImageIcon,
  Network,
  Rocket,
  ArrowUpRight,
  Database,
  BarChart3
} from 'lucide-react';

const Landing: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const benefits = [
    {
      title: 'Organize Suas Disciplinas',
      text: 'Gerencie sua grade acadêmica, roteiro de aulas e progresso de forma centralizada e intuitiva.',
      icon: BookOpen,
      color: 'text-blue-500'
    },
    {
      title: 'Conecte-se com Colegas',
      text: 'Interaja com outros estudantes, participe do chat da disciplina e fortaleça sua rede acadêmica.',
      icon: Users,
      color: 'text-emerald-500'
    },
    {
      title: 'Acesso Rápido aos Materiais',
      text: 'Encontre slides, PDFs e documentos compartilhados pelos professores em poucos cliques.',
      icon: FileText,
      color: 'text-amber-500'
    },
    {
      title: 'Notificações Inteligentes',
      text: 'Receba alertas automáticos sobre prazos, avaliações e avisos importantes da sua instituição.',
      icon: Bell,
      color: 'text-purple-500'
    }
  ];

  const labs = [
    {
      name: 'VisionLab',
      desc: 'Criação de imagens ultra-realistas para projetos acadêmicos e apresentações impactantes.',
      icon: ImageIcon,
      tech: 'Gemini 2.5 Image',
      color: 'bg-blue-600'
    },
    {
      name: 'MotionLab',
      desc: 'Síntese de vídeo de alta fidelidade (1080p) para storytelling e trabalhos multimídia.',
      icon: Play,
      tech: 'Veo 3.1 Fast',
      color: 'bg-purple-600'
    },
    {
      name: 'VoiceLab',
      desc: 'Conversação em tempo real com IA nativa para tutoria e suporte imediato.',
      icon: Mic,
      tech: 'Gemini 2.5 Native Audio',
      color: 'bg-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-inter selection:bg-[#006c55]/10 selection:text-[#006c55] overflow-x-hidden scroll-smooth">
      
      {/* 1. HEADER / NAVBAR - REESTRUTURADO COM "BLOCÕES" */}
      <nav className="fixed top-0 left-0 right-0 h-24 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-[100] px-6 lg:px-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="text-3xl font-black text-[#006c55] tracking-tighter flex items-center gap-2">
            <div className="w-10 h-10 bg-[#006c55] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#006c55]/20">
              <Zap size={22} fill="currentColor" />
            </div>
            thoth
          </div>
          <div className="hidden xl:flex items-center gap-8">
            <Link to="/" className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900 border-b-2 border-[#006c55] pb-1 transition-all">Home</Link>
            <a href="#" className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all">Shop</a>
            <a href="#" className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all">About</a>
            <a href="#" className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all">Contact</a>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to="/login" 
            className="px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
          >
            Login
          </Link>
          <Link 
            to="/signup" 
            className="bg-[#006c55] text-white px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-2xl shadow-[#006c55]/30 hover:bg-[#005a46] hover:translate-y-[-2px] transition-all active:scale-95 flex items-center gap-2"
          >
            Cadastro <ArrowUpRight size={16} />
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION ENHANCED */}
      <main className="flex-1 hidden">
        <section className="relative pt-48 lg:pt-64 pb-24 lg:pb-40 px-6 lg:px-20 max-w-7xl mx-auto w-full flex flex-col-reverse lg:flex-row items-center gap-16 overflow-visible">
          
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#d9f1a2]/15 rounded-full blur-[140px] -z-10 animate-pulse"></div>
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#006c55]/5 rounded-full blur-[120px] -z-10"></div>

          {/* Coluna Esquerda: Ilustração */}
          <div className="w-full lg:w-1/2 animate-in slide-in-from-left duration-1000">
            <div className="relative w-full aspect-square max-w-lg mx-auto flex items-center justify-center">
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none" 
                   style={{ 
                     backgroundImage: 'radial-gradient(#006c55 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                   }}>
              </div>
              
              <img 
                src="https://img.freepik.com/free-vector/digital-learning-abstract-concept-vector-illustration-interactive-online-education-distance-learning-program-platform-digital-class-home-schooling-e-learning-software-abstract-metaphor_335657-2930.jpg" 
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(0,108,85,0.2)]" 
                alt="Thoth Platform" 
              />

              {/* FLOATING TECH ELEMENTS */}
              <div className="absolute -top-10 -right-4 p-5 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-3xl z-20 animate-float-slow border border-white">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                       <ShieldCheck size={22} />
                    </div>
                    <div>
                       <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 leading-none">Protocolo TICS</p>
                       <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Criptografia Ponta-a-Ponta</p>
                    </div>
                 </div>
              </div>

              <div className="absolute bottom-10 -left-10 p-5 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-3xl z-20 animate-float-delayed border border-white hidden lg:block">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
                       <Network size={22} />
                    </div>
                    <div>
                       <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 leading-none">Rede Neural</p>
                       <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Gemini 3 Flash Engine</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Conteúdo */}
          <div className="w-full lg:w-1/2 text-center lg:text-left space-y-8 animate-in slide-in-from-right duration-1000">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <span className="px-5 py-2 bg-[#d9f1a2] text-[#006c55] text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-sm border border-[#006c55]/10">
                  TICS EVOLUTION
                </span>
                <span className="px-5 py-2 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full flex items-center gap-2">
                  <Cpu size={14} className="text-[#d9f1a2]" /> THOTH ENGINE V2.0
                </span>
              </div>
              
              <h1 className="text-6xl lg:text-[100px] font-black text-slate-900 leading-[0.9] tracking-tighter">
                O Próximo <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006c55] to-[#00b894] drop-shadow-sm">Nível da TICS</span>
              </h1>
              
              <p className="text-lg lg:text-2xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Thoth é a <strong>Tecnologia de Informação e Comunicação</strong> definitiva. Um ecossistema inteligente que redefine como você aprende, organiza e cria no mundo acadêmico.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
              <Link 
                to="/signup" 
                className="w-full sm:w-auto px-14 py-6 bg-[#006c55] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-3xl shadow-[#006c55]/40 hover:bg-[#005a46] hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95 group"
              >
                Ativar Minha Conta <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-14 py-6 bg-white text-slate-900 border-2 border-slate-200 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-50 transition-all flex items-center justify-center active:scale-95 shadow-sm"
              >
                Acessar Portal
              </Link>
            </div>
          </div>
        </section>

        {/* 3. SECTION: HUB DE INOVAÇÃO (STATS) */}
        <section className="py-20 bg-white border-y border-slate-100">
           <div className="max-w-7xl mx-auto px-6 lg:px-20 grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { val: '15.4k', lab: 'Mentes Conectadas', icon: Users },
                { val: '240+', lab: 'Assets Digitais', icon: Layers },
                { val: '99.9%', lab: 'Uptime Sistema', icon: ShieldCheck },
                { val: 'Fast', lab: 'Real-time Sync', icon: Zap }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start space-y-2">
                   <div className="flex items-center gap-3 text-slate-900">
                      <stat.icon size={24} className="text-[#006c55]" />
                      <span className="text-4xl font-black tracking-tighter">{stat.val}</span>
                   </div>
                   <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">{stat.lab}</span>
                </div>
              ))}
           </div>
        </section>

        {/* 4. SECTION: ECOSSISTEMA TICS (LABS SHOWCASE) */}
        <section className="py-32 lg:py-48 bg-slate-50 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#006c55]/5 rounded-full blur-[150px] -z-0"></div>
           
           <div className="max-w-7xl mx-auto px-6 lg:px-20 relative z-10">
              <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
                <span className="text-[12px] font-black uppercase text-[#006c55] tracking-[0.5em] block">Laboratórios Criativos</span>
                <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Tecnologia que gera <span className="text-[#006c55]">Resultados</span></h2>
                <p className="text-lg text-slate-500 font-medium">A Thoth Creative Suite coloca o poder da Inteligência Artificial em suas mãos através de nossos labs especializados.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                 {labs.map((lab, i) => (
                   <div key={i} className="group glass-panel bg-white p-12 rounded-[3.5rem] border border-slate-200/50 hover:border-[#006c55]/30 hover:bg-white transition-all duration-500 hover:shadow-3xl hover:translate-y-[-12px]">
                      <div className={`w-20 h-20 rounded-[2rem] ${lab.color} text-white flex items-center justify-center mb-10 shadow-xl shadow-slate-200 transition-all group-hover:rotate-12 group-hover:scale-110`}>
                        <lab.icon size={32} />
                      </div>
                      <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#006c55]">{lab.tech}</span>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{lab.name}</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{lab.desc}</p>
                      </div>
                      <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ativo na Rede</span>
                         <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#006c55] group-hover:text-white transition-colors cursor-pointer">
                            <ArrowRight size={20} />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 5. SECTION: LUMINA AI (TECH CORE) */}
        <section className="py-32 bg-[#030712] relative overflow-hidden">
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                style={{ 
                  backgroundImage: 'linear-gradient(#006c55 1px, transparent 1px), linear-gradient(90deg, #006c55 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}>
           </div>
           
           <div className="max-w-7xl mx-auto px-6 lg:px-20 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-24">
                 <div className="w-full lg:w-1/2 space-y-10">
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#006c55]/20 border border-[#006c55]/30 rounded-2xl">
                       <Sparkles size={18} className="text-[#d9f1a2]" />
                       <span className="text-[11px] font-black uppercase text-[#d9f1a2] tracking-[0.4em]">Tutoria Avançada</span>
                    </div>
                    <h2 className="text-5xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                       A Alma do <br />
                       <span className="text-[#d9f1a2]">Sistema Thoth.</span>
                    </h2>
                    <p className="text-slate-400 text-lg lg:text-2xl font-medium leading-relaxed max-w-xl">
                       Lumina é o núcleo de TICS da plataforma. Ela processa dados em tempo real para te ajudar a vencer o bloqueio criativo e organizar montanhas de informação.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <BarChart3 size={24} className="text-[#d9f1a2]" />
                          <h4 className="text-white font-black text-sm uppercase">Data Driven</h4>
                          <p className="text-slate-500 text-xs">Análise profunda de progresso acadêmico.</p>
                       </div>
                       <div className="space-y-2">
                          <Database size={24} className="text-[#d9f1a2]" />
                          <h4 className="text-white font-black text-sm uppercase">Hub de Conhecimento</h4>
                          <p className="text-slate-500 text-xs">Sincronia com os materiais da disciplina.</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="w-full lg:w-1/2 relative group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-[#006c55] to-[#d9f1a2] rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 shadow-3xl overflow-hidden">
                       <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
                          <div className="w-14 h-14 bg-[#006c55] rounded-2xl flex items-center justify-center text-white shadow-2xl">
                             <Sparkles size={28} />
                          </div>
                          <div>
                             <h4 className="text-white font-black text-lg uppercase tracking-widest">Lumina Assistant</h4>
                             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-1">Status: Conectada ao Gemini 3</p>
                          </div>
                       </div>
                       
                       <div className="space-y-6">
                          <div className="bg-white/5 p-5 rounded-3xl rounded-tl-none border border-white/5 animate-in slide-in-from-left duration-500">
                             <p className="text-sm text-white/80 leading-relaxed font-medium">Lumina, crie um cronograma de estudos para minha prova de Antropologia amanhã.</p>
                          </div>
                          <div className="bg-[#006c55]/30 p-6 rounded-3xl rounded-tr-none ml-auto max-w-[90%] border border-[#006c55]/30 animate-in slide-in-from-right duration-700">
                             <div className="flex gap-2 mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#d9f1a2] animate-bounce"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#d9f1a2] animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#d9f1a2] animate-bounce [animation-delay:0.4s]"></div>
                             </div>
                             <p className="text-sm text-white leading-relaxed font-medium">Com base nos slides do Prof. Ricardo e nas suas anotações, recomendo focar 45min em Evolucionismo Social e 30min em Relativismo Cultural. Quer os tópicos principais?</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* 6. SECTION: MURAL DE ATIVOS (GAMIFICATION) */}
        <section className="py-32 lg:py-48 bg-white overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 lg:px-20">
              <div className="flex flex-col lg:flex-row items-center gap-20">
                 <div className="w-full lg:w-1/2 order-2 lg:order-1">
                    <div className="grid grid-cols-3 gap-4 rotate-3 group">
                       {[1,2,3,4,5,6,7,8,9].map((i) => (
                         <div key={i} className="aspect-square bg-slate-50 rounded-3xl border border-slate-100 p-2 shadow-sm transition-all hover:scale-110 hover:-rotate-3 hover:shadow-xl hover:z-10 cursor-pointer overflow-hidden">
                            <img src={`https://picsum.photos/seed/${i + 100}/300/300`} className="w-full h-full object-cover rounded-2xl" alt="Badge" />
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="w-full lg:w-1/2 space-y-8 order-1 lg:order-2">
                    <span className="text-[12px] font-black uppercase text-[#006c55] tracking-[0.5em]">Ativos Digitais</span>
                    <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Crie sua Identidade <br /> <span className="text-[#006c55]">Visual Única.</span></h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                       O Mural Thoth é onde sua jornada ganha forma. Registre emblemas, ativos e conquistas vitais. Cada passo no Thoth é um ativo colecionável que valida sua autoridade acadêmica.
                    </p>
                    <div className="pt-8">
                       <Link to="/signup" className="inline-flex items-center gap-4 text-[#006c55] font-black uppercase tracking-widest text-sm hover:gap-6 transition-all">
                          Ver Sistema de Emblemas <ArrowRight size={20} />
                       </Link>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* 7. SECTION: BENEFÍCIOS (EXISTING UPDATED) */}
        <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(#006c55 1.5px, transparent 1.5px)',
                 backgroundSize: '40px 40px'
               }}>
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-20 relative z-10">
            <div className="text-center mb-24">
              <span className="text-[11px] font-black uppercase text-[#006c55] tracking-[0.5em] block mb-4">Arquitetura Thoth</span>
              <h2 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none">Simples. Inteligente. Vitalício.</h2>
              <div className="w-24 h-2 bg-[#d9f1a2] mx-auto mt-8 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, i) => (
                <div 
                  key={i} 
                  className="group p-10 bg-white rounded-[3rem] border border-slate-200/50 hover:border-[#006c55]/30 transition-all duration-500 shadow-sm hover:shadow-3xl hover:translate-y-[-10px] flex flex-col items-center text-center lg:items-start lg:text-left"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center ${benefit.color} group-hover:bg-[#006c55] group-hover:text-white transition-all duration-500 mb-8 shadow-sm group-hover:rotate-6`}>
                    <benefit.icon size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight leading-tight uppercase text-[15px]">{benefit.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CTA FINAL (REFORMULADO) */}
        <section className="py-24 lg:py-40 px-6 lg:px-20 bg-white">
           <div className="max-w-7xl mx-auto rounded-[5rem] p-12 lg:p-32 text-center relative overflow-hidden bg-gradient-to-br from-[#006c55] to-[#004d3d] shadow-[0_50px_100px_rgba(0,108,85,0.4)]">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] -z-0"></div>
              
              <div className="relative z-10 space-y-12">
                 <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full border border-white/20">
                    <Rocket size={18} className="text-[#d9f1a2]" />
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Acesso Vitalício Disponível</span>
                 </div>
                 
                 <h2 className="text-5xl lg:text-[100px] font-black text-white tracking-tighter leading-[0.85]">
                    Lidere o seu <br /> <span className="text-[#d9f1a2]">Futuro Agora.</span>
                 </h2>
                 <p className="text-white/70 text-lg lg:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
                    Não seja apenas mais um estudante. Seja o protagonista da sua evolução tecnológica. Entre para a elite acadêmica do Thoth.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-6 justify-center pt-8">
                    <Link to="/signup" className="px-16 py-7 bg-[#d9f1a2] text-[#006c55] rounded-[28px] font-black text-sm uppercase tracking-[0.3em] shadow-3xl hover:scale-110 transition-all active:scale-95 flex items-center gap-3">
                       Cadastrar Agora <MousePointer2 size={20} />
                    </Link>
                    <Link to="/contact" className="px-16 py-7 bg-white/10 text-white border border-white/20 rounded-[28px] font-black text-sm uppercase tracking-[0.3em] hover:bg-white/20 transition-all backdrop-blur-md">
                       Agendar Demo
                    </Link>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-24 border-t border-slate-200 bg-white hidden" >
        <div className="max-w-7xl mx-auto px-6 lg:px-20 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="flex flex-col items-center md:items-start gap-6">
              <div className="text-4xl font-black text-[#006c55] tracking-tighter">thoth</div>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] text-center md:text-left">Creative Suite • TICS for Advanced Education</p>
              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#006c55] cursor-pointer transition-all shadow-sm"><Globe size={18} /></div>
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#006c55] cursor-pointer transition-all shadow-sm"><Mail size={18} /></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24 text-center md:text-left">
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Evolução</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-[12px] font-bold text-slate-500 hover:text-[#006c55] transition-colors">VisionLab</a></li>
                  <li><a href="#" className="text-[12px] font-bold text-slate-500 hover:text-[#006c55] transition-colors">MotionLab</a></li>
                  <li><a href="#" className="text-[12px] font-bold text-slate-500 hover:text-[#006c55] transition-colors">Lumina AI</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Suporte</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-[12px] font-bold text-slate-500 hover:text-[#006c55] transition-colors">Documentação TICS</a></li>
                  <li><a href="#" className="text-[12px] font-bold text-slate-500 hover:text-[#006c55] transition-colors">API Status</a></li>
                  <li><a href="#" className="text-[12px] font-bold text-slate-500 hover:text-[#006c55] transition-colors">Segurança</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Ecossistema</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-[12px] font-bold text-slate-500 hover:text-[#006c55] transition-colors">Shop</a></li>
                  <li><a href="#" className="text-[12px] font-bold text-slate-500 hover:text-[#006c55] transition-colors">Mural de Ativos</a></li>
                  <li><a href="#" className="text-[12px] font-bold text-slate-500 hover:text-[#006c55] transition-colors">Parceiros</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Legal</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-[12px] font-bold text-slate-500 hover:text-[#006c55] transition-colors">Privacidade</a></li>
                  <li><a href="#" className="text-[12px] font-bold text-slate-500 hover:text-[#006c55] transition-colors">Licenciamento</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">© 2024 Thoth Creative Suite. Licenciado via Protocolo Neural TICS.</p>
             <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Network Verified</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50"></div>
             </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-1deg); }
        }
        .animate-float-slow {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .shadow-3xl {
          box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Landing;
