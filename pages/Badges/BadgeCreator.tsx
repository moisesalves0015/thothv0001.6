import React from 'react';
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
import Cropper from 'react-easy-crop';
import { useBadgeCreator } from '../../hooks/useBadgeCreator';

const BadgeCreator: React.FC = () => {
  const {
    navigate,
    fileInputRef,
    step,
    setStep,
    isProcessing,
    isSuccess,
    isAdmin,
    name, setName,
    description, setDescription,
    category, setCategory,
    visibility, setVisibility,
    imageUrl, setImageUrl,
    width, setWidth,
    height, setHeight,
    cardNumber, setCardNumber,
    cardHolder, setCardHolder,
    cpf, setCpf,
    expiry, setExpiry,
    cvv, setCvv,
    subtotal,
    platformFee,
    totalPrice,
    isFree,
    crop, setCrop,
    zoom, setZoom,
    rotation, setRotation,
    onCropComplete,
    handleImageUpload,
    submitBadge,
    downloadReceipt
  } = useBadgeCreator();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitBadge();
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 animate-in fade-in duration-700">
        <div className="w-full max-w-2xl liquid-glass rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="bg-[#006c55] p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Sparkles size={200} className="absolute -top-20 -left-20 text-white" />
            </div>
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CheckCircle2 size={40} className="text-[#006c55]" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Ativo Registrado!</h2>
            <p className="text-white/80 font-bold text-xs uppercase tracking-[0.2em]">{isFree ? (isAdmin ? 'Ativo Administrativo Confirmado' : 'Primeiro Ativo Grátis Vitalício') : 'Processado com Sucesso'}</p>
          </div>

          <div className="p-12 flex flex-col items-center text-center">
            <div
              className="bg-white rounded-none shadow-2xl border-4 border-white mb-8 group relative dark:bg-[#1E293B] dark:border-white/5"
              style={{
                width: `${Math.min(width * 120, 320)}px`,
                height: `${Math.min(height * 120, 320)}px`,
                aspectRatio: `${width}/${height}`
              }}
            >
              <img src={imageUrl} className="w-full h-full object-cover" alt="Ativo" />
            </div>

            <div className="space-y-2 mb-10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{name}</h3>
              <p className="text-sm text-slate-500 max-w-xs dark:text-slate-400">{description || "Nenhuma descrição fornecida."}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <button
                onClick={downloadReceipt}
                className="h-14 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                <Download size={16} /> Comprovante PDF
              </button>
              <button
                onClick={() => navigate('/home')}
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
            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none dark:text-white">Fábrica de Ativos Digitais</h1>
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
            <div className="liquid-glass p-8 space-y-8 rounded-[2rem] animate-in slide-in-from-left-4 duration-500">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">Identidade Visual</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 border-2 border-dashed border-slate-200 rounded-none flex flex-col items-center justify-center cursor-pointer hover:border-[#006c55] hover:bg-[#006c55]/5 transition-all group overflow-hidden bg-slate-50/50 dark:bg-slate-800/40 dark:border-slate-700 dark:hover:border-[#006c55] dark:hover:bg-[#006c55]/10"
                >
                  {imageUrl ? (
                    <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm group-hover:scale-110 transition-transform mb-4 dark:bg-slate-800 dark:text-slate-400">
                        <Upload size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-300">Arraste ou clique para carregar</p>
                      <p className="text-[10px] uppercase font-black text-slate-300 mt-2 dark:text-slate-500">PNG, JPG ou WEBP • Máx 5MB</p>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">Nome do Emblema</label>
                  <input
                    type="text"
                    placeholder="Ex: Aluno Destaque 2024"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-[#006c55]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">Largura (Blocos)</label>
                    <select
                      value={width}
                      onChange={e => setWidth(Number(e.target.value))}
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-bold appearance-none dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-[#006c55]/20"
                    >
                      {[1, 2, 3, 4].map(v => <option key={v} value={v}>{v} {v === 1 ? 'Bloco' : 'Blocos'}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">Altura (Blocos)</label>
                    <select
                      value={height}
                      onChange={e => setHeight(Number(e.target.value))}
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-bold appearance-none dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-[#006c55]/20"
                    >
                      {[1, 2, 3, 4].map(v => <option key={v} value={v}>{v} {v === 1 ? 'Bloco' : 'Blocos'}</option>)}
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
            <div className="liquid-glass p-8 space-y-8 rounded-[2rem] animate-in slide-in-from-left-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">Descrição do Ativo</label>
                <textarea
                  placeholder="Conte a história por trás deste emblema ou as regras para obtê-lo..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full h-32 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-medium resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-[#006c55]/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">Categoria</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Acadêmico', 'Social', 'Evento', 'Especial'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${category === cat ? 'bg-[#006c55] text-white border-[#006c55]' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">Visibilidade</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'Público', icon: Globe, label: 'Público', sub: 'Todos podem ver no mural' },
                      { id: 'Conexões', icon: Users, label: 'Conexões', sub: 'Apenas sua rede' },
                      { id: 'Privado', icon: EyeOff, label: 'Privado', sub: 'Apenas você' }
                    ].map(vis => (
                      <button
                        key={vis.id}
                        onClick={() => setVisibility(vis.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${visibility === vis.id ? 'bg-[#006c55]/5 border-[#006c55] ring-1 ring-[#006c55]' : 'bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${visibility === vis.id ? 'bg-[#006c55] text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-300'}`}>
                          <vis.icon size={16} />
                        </div>
                        <div>
                          <p className={`text-[11px] font-black uppercase ${visibility === vis.id ? 'text-[#006c55]' : 'text-slate-700 dark:text-slate-300'}`}>{vis.label}</p>
                          <p className="text-[9px] font-bold text-slate-400 tracking-tighter dark:text-slate-500">{vis.sub}</p>
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
            <div className="liquid-glass p-8 space-y-8 rounded-[2rem] animate-in slide-in-from-left-4 duration-500">
              <div className="bg-[#006c55]/5 border border-[#006c55]/20 rounded-2xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-[#006c55] text-white rounded-xl flex items-center justify-center shrink-0">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#006c55] uppercase tracking-tight">Thoth Finance Gateway</h3>
                  <p className="text-xs text-[#006c55]/70 font-bold leading-relaxed">Sua transação é protegida por criptografia de ponta-a-ponta e garantida pela Thoth Creative Suite.</p>
                </div>
              </div>

              {(isFree) && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                  <Sparkles className="text-emerald-500" size={18} />
                  <p className="text-[11px] font-black text-emerald-600 uppercase tracking-tight">
                    {isAdmin ? 'Acesso Administrativo: Custo Zero' : 'Primeiro Ativo Detectado: Custo Zero Aplicado!'}
                  </p>
                </div>
              )}

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">Número do Cartão</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    required={!isFree}
                    disabled={isFree}
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-bold disabled:opacity-50 disabled:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-[#006c55]/20 dark:disabled:bg-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">Nome no Cartão</label>
                  <input
                    type="text"
                    placeholder="JOÃO SILVA"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    required={!isFree}
                    disabled={isFree}
                    className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] transition-all text-slate-800 font-bold uppercase disabled:opacity-50 disabled:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-[#006c55]/20 dark:disabled:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">Validade</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      required={!isFree}
                      disabled={isFree}
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-center focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] font-bold disabled:opacity-50 disabled:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-[#006c55]/20 dark:disabled:bg-slate-900"
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">CVV</label>
                    <input
                      type="text"
                      placeholder="***"
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      required={!isFree}
                      disabled={isFree}
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-center focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] font-bold disabled:opacity-50 disabled:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-[#006c55]/20 dark:disabled:bg-slate-900"
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 dark:text-slate-300">CPF/CNPJ</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={e => setCpf(e.target.value)}
                      required={!isFree}
                      disabled={isFree}
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-center focus:outline-none focus:ring-4 focus:ring-[#006c55]/10 focus:border-[#006c55] font-bold disabled:opacity-50 disabled:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-[#006c55]/20 dark:disabled:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                  <ShieldCheck className="text-emerald-500" size={20} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed dark:text-slate-300">Sua compra é segura. Ao clicar em finalizar, você concorda com nossos termos de licença de ativos digitais.</p>
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
          <div className="liquid-glass p-8 rounded-[2rem] shadow-xl flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <LayoutGrid size={14} className="text-[#006c55]" /> Preview do Mural
            </h3>

            <div className="relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden group dark:bg-slate-800 ring-4 ring-slate-100 dark:ring-slate-700">
              {imageUrl ? (
                <div className="absolute inset-0">
                  <Cropper
                    image={imageUrl}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={width / height}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    showGrid={false}
                    classes={{
                      containerClassName: "rounded-xl",
                      mediaClassName: "",
                      cropAreaClassName: "border-2 border-[#006c55]/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
                    }}
                  />

                  {/* Custom Grid Overlay - Always 1x1 tiles */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* 
                       The crop area in react-easy-crop is centered. 
                       We need our grid to match exactly that area visually.
                       This implementation relies on the fact that react-easy-crop centers the crop area.
                       However, since we can't easily hook into the exact pixel dimension of the crop area from outside without resize observer,
                       we rely on visual approximation or specific CSS if needed.
                       
                       Actually, react-easy-crop's `cropAreaClassName` allows styling the box.
                       So we can visualize the grid INSIDE that box if we could put children in it, but we can't easily.
                       
                       Strategy: Use the `aspect` ratio to calculate the grid lines.
                       The crop area is visible. The shadow covers the rest.
                       We will overlay a CSS grid on top of the entire container, but masked to the crop area? 
                       No, simpler: The Crop Area itself has a border.
                       We need to draw lines *within* the crop area.
                       
                       Since we can't easily put DOM elements inside the crop area div controlled by the library,
                       we will rely on the library's grid if it supported custom columns/rows, but it implies 3x3.
                       
                       Alternative: CSS `mask` or `background-image` on the cropAreaClassName?
                       Yes! passing a class with ::after pseudo-element to draw grid lines.
                     */}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                  <Sparkles size={64} />
                  <span className="text-xs font-black uppercase mt-4 tracking-widest">Aguardando Arte</span>
                </div>
              )}
            </div>

            {imageUrl && (
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Zoom</span>
                    <span>{zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#006c55] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <span>Rotação</span>
                    <span>{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    aria-labelledby="Rotation"
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#006c55] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125"
                  />
                </div>

                <style>{`
                  .reactEasyCrop_CropArea {
                    border: 2px solid rgba(0, 108, 85, 0.5) !important;
                    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7) !important;
                    background-image: 
                      linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
                    background-size: ${100 / width}% ${100 / height}% !important;
                    background-position: -1px -1px !important;
                  }
                `}</style>
              </div>
            )}


            <div className="mt-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-700">
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase dark:text-white">{name || "Novo Ativo Digital"}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter dark:text-slate-300">{category} • {visibility}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#006c55]">{width}x{height}</span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter dark:text-slate-300">Módulos</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase dark:text-slate-300">
                  <span>Espaço de Mural (x{width * height})</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase dark:text-slate-300">
                  <span>Taxa de Registro</span>
                  <span>R$ {platformFee.toFixed(2)}</span>
                </div>
                {(isFree) && (
                  <div className="flex justify-between items-center text-[11px] font-black text-emerald-600 uppercase">
                    <span>{isAdmin ? 'Desconto Admin' : 'Desconto de Boas-vindas'}</span>
                    <span>- R$ {(subtotal + platformFee).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center dark:border-slate-700">
                  <span className="text-[13px] font-black text-slate-900 uppercase dark:text-white">Total Final</span>
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