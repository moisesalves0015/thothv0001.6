
import React, { useState } from 'react';
import { AiService } from '../modules/ai/ai.service';
import { GeneratedImage } from '../types';
import { Sparkles, Image as ImageIcon, Download, Trash2, Loader2, Maximize2 } from 'lucide-react';

const VisionLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');

  const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];

  // Handle image generation using the AiService
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      // Correctly call the AiService for image generation
      const imageUrl = await AiService.generateImage(prompt, aspectRatio);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt,
        timestamp: Date.now(),
      };
      setImages(prev => [newImage, ...prev]);
      setPrompt('');
    } catch (error: any) {
      console.error("Image generation error:", error);
      alert("Erro ao gerar imagem: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/30 backdrop-blur-sm rounded-3xl border border-white/40">
      <header className="p-6 border-b border-slate-200/50 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Ateliê de Visão</h2>
          <p className="text-[10px] uppercase font-bold text-[#006c55] tracking-widest mt-0.5">Gemini 2.5 Flash Image • Alta Fidelidade</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {/* Creator Section */}
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 border border-white shadow-xl space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles size={12} className="text-[#006c55]" /> Descrição da Obra
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Um astronauta tocando saxofone em Marte, estilo cyberpunk, iluminação volumétrica, 8k..."
                className="w-full bg-slate-50/50 border border-slate-200 rounded-3xl p-6 h-32 focus:outline-none focus:ring-2 focus:ring-[#006c55]/20 focus:border-[#006c55] transition-all text-[16px] leading-relaxed text-slate-800 resize-none"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proporção (Aspect Ratio)</label>
                 <div className="flex flex-wrap gap-2">
                   {aspectRatios.map((ratio) => (
                     <button
                       key={ratio}
                       onClick={() => setAspectRatio(ratio)}
                       className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all border ${
                         aspectRatio === ratio 
                         ? 'bg-[#006c55] text-white border-[#006c55] shadow-lg shadow-[#006c55]/20' 
                         : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                       }`}
                     >
                       {ratio}
                     </button>
                   ))}
                 </div>
               </div>
               
               <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="h-16 px-10 bg-[#006c55] hover:bg-[#005a46] rounded-2xl font-black text-white shadow-xl shadow-[#006c55]/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:grayscale min-w-[200px] mt-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <ImageIcon size={18} />
                    Gerar Imagem
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Feed */}
        <div className="max-w-6xl mx-auto space-y-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <span className="w-8 h-px bg-slate-200"></span> Galeria Recente
          </h3>
          
          {images.length === 0 ? (
            <div className="h-64 bg-white/40 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200">
              <ImageIcon size={40} className="text-slate-300 mb-4" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sua galeria de artes aparecerá aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
              {images.map(img => (
                <div key={img.id} className="bg-white rounded-[2rem] overflow-hidden border border-white shadow-lg flex flex-col group transition-all hover:shadow-2xl">
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={img.prompt} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                       <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                         <Maximize2 size={20} />
                       </button>
                    </div>
                  </div>
                  <div className="p-6 bg-white flex flex-col gap-3">
                    <p className="text-xs font-bold text-slate-600 line-clamp-2 leading-relaxed">"{img.prompt}"</p>
                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        {new Date(img.timestamp).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <a 
                          href={img.url} 
                          download={`thoth-vision-${img.id}.png`}
                          className="p-2 text-slate-400 hover:text-[#006c55] transition-colors"
                        >
                          <Download size={16} />
                        </a>
                        <button 
                          onClick={() => deleteImage(img.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default VisionLab;
