import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  Sparkles, 
  Upload, 
  CreditCard, 
  ShieldCheck, 
  ChevronLeft, 
  Download, 
  Lock, 
  Globe, 
  Loader2, 
  ChevronRight,
  EyeOff,
  Info,
  CheckCircle2,
  AlertCircle,
  Users,
  LayoutGrid
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { BadgeService } from '../../modules/badges/badge.service';

const BadgeCreator: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFirstBadge, setIsFirstBadge] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Acadêmico');
  const [visibility, setVisibility] = useState('Público');
  const [imageUrl, setImageUrl] = useState('');
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  
  // Payment State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cpf, setCpf] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    const checkHistory = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(collection(db, 'badges'), where('creatorId', '==', auth.currentUser.uid));
        const snap = await getDocs(q);
        setIsFirstBadge(snap.empty);
      } catch (e) { console.error(e); }
    };
    checkHistory();
  }, []);

  const basePrice = 4.90;
  const platformFee = 1.50;
  const subtotal = useMemo(() => (width * height * basePrice), [width, height]);
  const totalPrice = useMemo(() => isFirstBadge ? 0 : subtotal + platformFee, [subtotal, platformFee, isFirstBadge]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      await BadgeService.createBadge({
        name: name.trim(),
        description: description.trim(),
        category,
        visibility,
        imageUrl,
        width,
        height,
        x: 0, 
        y: 0,
        creatorId: auth.currentUser?.uid || 'anonymous',
        totalPaid: totalPrice,
        paymentInfo: isFirstBadge ? 'First Badge Free' : 'Credit Card'
      });
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar emblema.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadReceipt = () => {
    const doc = new jsPDF();
    const transId = Math.random().toString(36).substring(2, 15).toUpperCase();
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    // Estilização do PDF
    doc.setFillColor(0, 108, 85); // Thoth Primary
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("CERTIFICADO DE ATIVO DIGITAL", 105, 25, { align: 'center' });
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`ID DA TRANSACAO: ${transId}`, 20, 50);
    doc.text(`DATA: ${date} AS ${time}`, 20, 55);
    doc.text(`STATUS: ${totalPrice === 0 ? 'GRATUITO (BENEFICIO BOAS-VINDAS)' : 'PAGO'}`, 20, 60);

    doc.setDrawColor(0, 108, 85);
    doc.setLineWidth(1);
    doc.line(20, 65, 190, 65);

    doc.setFontSize(16);
    doc.text("DETALHES DO EMBLEMA", 20, 80);
    doc.setFontSize(12);
    doc.text(`NOME: ${name}`, 20, 95);
    doc.text(`CATEGORIA: ${category}`, 20, 105);
    doc.text(`VISIBILIDADE: ${visibility}`, 20, 115);
    doc.text(`DIMENSOES NO MURAL: ${width}x${height} BLOCOS`, 20, 125);
    doc.text(`PROPRIETARIO: ${auth.currentUser?.displayName || 'USUARIO THOTH'}`, 20, 135);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const footerText = "Este documento comprova a posse e o registro do ativo digital no Mural Thoth Creative Suite. O ativo e vitalicio e irrevogavel dentro das normas da plataforma.";
    doc.text(doc.splitTextToSize(footerText, 170), 20, 260);
    
    doc.save(`thoth-cert-${name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 animate-in fade-in duration-700">
        <div className="w-full max-w-2xl glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl bg-white/90">
          <div className="bg-[#006c55] p-12 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <Sparkles size={200} className="absolute -top-20 -left-20 text-white" />
             </div>
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
               <CheckCircle2 size={40} className="text-[#006c55]" />
             </div>
             <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Ativo Registrado!</h2>
             <p className="text-white/80 font-bold text-xs uppercase tracking-[0.2em]">{isFirstBadge ? 'Primeiro Ativo Grátis Vitalício' : 'Processado com Sucesso'}</p>
          </div>
          
          <div className="p-12 flex flex-col items-center text-center">
             <div className="w-40 h-40 rounded-none overflow-hidden shadow-2xl border-4 border-white mb-8 group relative">
                <img src={imageUrl} className="w-full h-full object-cover" alt="Ativo" />
             </div>
             
             <div className="space-y-2 mb-10">
               <h3 className="text-xl font-black text-slate-900">{name}</h3>
               <p className="text-sm text-slate-500 max-w-xs">{description || "Nenhuma descrição fornecida."}</p>
             </div>

             <div className="grid grid-cols-2 gap-4 w-full">
               <button 
                 onClick={downloadReceipt}
                 className="h-14 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
               >
                 <Download size={16} /> Comprovante PDF
               </button>
               <button 
                 onClick={() => navigate('/')}
                 className="h-14 bg-[#006c55] hover:bg-[#005a46] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#006c55]/20"
               >
                 Explorar Mural <ChevronRight size={16} />
               </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => step === 1 ? navigate(-1) : setStep(s => s - 1)} 
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Fábrica de Ativos Digitais</h1>
            <p className="text-[10px] uppercase font-black text-[#006c55] tracking-widest mt-1">Passo {step} de 3 • Criação de Emblema</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`w-3 h-3 rounded-full transition-all duration-500 ${step === s ? 'bg-[#006c55] w-8' : s < step ? 'bg-[#006c55]/40' : 'bg-slate-200'}`} 
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          {step === 1 && (
            <div className="glass-panel p-8 space-y-8 rounded-[2rem] bg-white animate-in slide-in-from-left-4 duration-500">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identidade Visual</label>
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full h-64 border-2 border-dashed border-slate-200 rounded-none flex flex-col items-center justify-center cursor-pointer hover:border-[#006c55] hover:bg-[#006c55]/5 transition-all group overflow-hidden bg-slate-50/50"
                >
                  {imageUrl ? (
                    <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm group-hover:scale-110 transition-transform mb-4">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-400">Arraste ou clique para carregar</p>
                      <p className="text-[10px] uppercase font-black text-slate-300 mt-2">PNG, JPG ou WEBP • Máx 5MB</p>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Emblema</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Aluno Destaque 2024" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Largura (Blocos)</label>
                    <select 
                      value={width} 
                      onChange={e => setWidth(Number(e.target.value))} 
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-bold appearance-none"
                    >
                      {[1,2,3,4].map(v => <option key={v} value={v}>{v} {v === 1 ? 'Bloco' : 'Blocos'}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Altura (Blocos)</label>
                    <select 
                      value={height} 
                      onChange={e => setHeight(Number(e.target.value))} 
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-bold appearance-none"
                    >
                      {[1,2,3,4].map(v => <option key={v} value={v}>{v} {v === 1 ? 'Bloco' : 'Blocos'}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)} 
                disabled={!name || !imageUrl}
                className="w-full h-16 bg-[#006c55] hover:bg-[#005a46] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-[#006c55]/20 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
              >
                Configurar Exposição <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="glass-panel p-8 space-y-8 rounded-[2rem] bg-white animate-in slide-in-from-left-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Ativo</label>
                <textarea 
                  placeholder="Conte a história por trás deste emblema ou as regras para obtê-lo..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full h-32 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Acadêmico', 'Social', 'Evento', 'Especial'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${category === cat ? 'bg-[#006c55] text-white border-[#006c55]' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visibilidade</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'Público', icon: Globe, label: 'Público', sub: 'Todos podem ver no mural' },
                      { id: 'Conexões', icon: Users, label: 'Conexões', sub: 'Apenas sua rede' },
                      { id: 'Privado', icon: EyeOff, label: 'Privado', sub: 'Apenas você' }
                    ].map(vis => (
                      <button
                        key={vis.id}
                        onClick={() => setVisibility(vis.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${visibility === vis.id ? 'bg-[#006c55]/5 border-[#006c55] ring-1 ring-[#006c55]' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${visibility === vis.id ? 'bg-[#006c55] text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <vis.icon size={16} />
                        </div>
                        <div>
                          <p className={`text-[11px] font-black uppercase ${visibility === vis.id ? 'text-[#006c55]' : 'text-slate-700'}`}>{vis.label}</p>
                          <p className="text-[9px] font-bold text-slate-400 tracking-tighter">{vis.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(3)} 
                className="w-full h-16 bg-[#006c55] hover:bg-[#005a46] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-[#006c55]/20 transition-all flex items-center justify-center gap-2"
              >
                Checkout Seguro <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="glass-panel p-8 space-y-8 rounded-[2rem] bg-white animate-in slide-in-from-left-4 duration-500">
              <div className="bg-[#006c55]/5 border border-[#006c55]/20 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-[#006c55] text-white rounded-xl flex items-center justify-center shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#006c55] uppercase tracking-tight">Thoth Finance Gateway</h3>
                  <p className="text-xs text-[#006c55]/70 font-bold leading-relaxed">Sua transação é protegida por criptografia de ponta-a-ponta e garantida pela Thoth Creative Suite.</p>
                </div>
              </div>

              {isFirstBadge && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                   <Sparkles className="text-emerald-500" size={18} />
                   <p className="text-[11px] font-black text-emerald-600 uppercase tracking-tight">Primeiro Ativo Detectado: Custo Zero Aplicado!</p>
                </div>
              )}

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Cartão</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000" 
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    required={!isFirstBadge}
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome no Cartão</label>
                  <input 
                    type="text" 
                    placeholder="JOÃO SILVA" 
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    required={!isFirstBadge}
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-bold uppercase"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Validade</label>
                    <input 
                      type="text" 
                      placeholder="MM/AA" 
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      required={!isFirstBadge}
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-center focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] font-bold"
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVV</label>
                    <input 
                      type="text" 
                      placeholder="***" 
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      required={!isFirstBadge}
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-center focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] font-bold"
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CPF/CNPJ</label>
                    <input 
                      type="text" 
                      placeholder="000.000.000-00" 
                      value={cpf}
                      onChange={e => setCpf(e.target.value)}
                      required={!isFirstBadge}
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-center focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <ShieldCheck className="text-emerald-500" size={20} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">Sua compra é segura. Ao clicar em finalizar, você concorda com nossos termos de licença de ativos digitais.</p>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-16 bg-[#006c55] hover:bg-[#005a46] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-[#006c55]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <>Finalizar e Publicar <Lock size={16} /></>}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-5 space-y-8 sticky top-24">
          <div className="glass-panel p-8 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white shadow-xl flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <LayoutGrid size={14} className="text-[#006c55]" /> Preview do Mural
            </h3>
            
            <div className="aspect-square bg-slate-100 rounded-none relative overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
              {imageUrl ? (
                <div 
                  className="bg-white rounded-none shadow-2xl border-4 border-white overflow-hidden transition-all duration-500 hover:scale-105"
                  style={{
                    width: `${(width / 4) * 80}%`,
                    height: `${(height / 4) * 80}%`
                  }}
                >
                  <img src={imageUrl} className="w-full h-full object-cover" alt="Badge Preview" />
                </div>
              ) : (
                <div className="flex flex-col items-center opacity-20">
                  <Sparkles size={64} />
                  <span className="text-xs font-black uppercase mt-4 tracking-widest">Aguardando Arte</span>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase">{name || "Novo Ativo Digital"}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{category} • {visibility}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#006c55]">{width}x{height}</span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Módulos</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                  <span>Espaço de Mural (x{width*height})</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase">
                  <span>Taxa de Registro</span>
                  <span>R$ {platformFee.toFixed(2)}</span>
                </div>
                {isFirstBadge && (
                  <div className="flex justify-between items-center text-[11px] font-black text-emerald-600 uppercase">
                    <span>Desconto de Boas-vindas</span>
                    <span>- R$ {(subtotal + platformFee).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[13px] font-black text-slate-900 uppercase">Total Final</span>
                  <span className="text-2xl font-black text-[#006c55]">R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#006c55]/10 border border-[#006c55]/20 rounded-2xl p-6 flex items-start gap-4">
             <Info className="text-[#006c55] shrink-0 mt-0.5" size={18} />
             <p className="text-[10px] font-bold text-[#006c55] uppercase leading-relaxed tracking-tight">
               Ao adquirir um ativo digital na Thoth, você recebe um certificado de autenticidade único. Emblemas podem ser movidos livremente em seu mural pessoal ou murais de conexões autorizadas.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeCreator;