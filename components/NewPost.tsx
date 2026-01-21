
import React, { useState } from 'react';

interface NewPostProps {
  isOpen: boolean;
  onClose: () => void;
}

type AttachmentType = 'none' | 'image' | 'link' | 'file' | 'location';

const NewPost: React.FC<NewPostProps> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<AttachmentType>('none');

  if (!isOpen) return null;

  const handleAttachment = (type: AttachmentType) => {
    setActiveAttachment(type === activeAttachment ? 'none' : type);
  };

  const renderPreview = () => {
    switch (activeAttachment) {
      case 'image':
        return (
          <div className="relative group rounded-xl overflow-hidden border border-slate-200 mb-4 bg-slate-50 animate-in fade-in zoom-in-95 duration-300">
            <img src="https://picsum.photos/seed/post_preview/800/400" className="w-full h-32 object-cover opacity-90" alt="Preview" />
            <button onClick={() => setActiveAttachment('none')} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        );
      case 'link':
        return (
          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-blue-100 bg-blue-50/50 mb-4 animate-in slide-in-from-left-2 duration-300">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-[11px] font-bold text-slate-900 truncate">Título do Link Externo</h5>
              <p className="text-[9px] text-slate-500 truncate">https://exemplo.com/artigo</p>
            </div>
            <button onClick={() => setActiveAttachment('none')} className="text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50 mb-4 animate-in slide-in-from-left-2 duration-300">
            <div className="w-8 h-8 bg-[#006c55]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#006c55]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-[11px] font-bold text-slate-700 truncate">arquivo.pdf</h5>
              <span className="text-[9px] text-slate-400">2.4 MB</span>
            </div>
            <button onClick={() => setActiveAttachment('none')} className="text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-2 sm:p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[440px] max-h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-in slide-in-from-bottom-4 duration-500 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-50 flex-shrink-0">
          <div className="flex flex-col">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Nova Publicação</h3>
            <p className="text-[9px] uppercase tracking-widest font-bold text-[#006c55] mt-0.5 opacity-70">Feed ao vivo</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600 active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {/* Main Input Area */}
          <div className="mb-4">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="O que está acontecendo?"
              className="w-full h-24 bg-transparent text-[16px] text-slate-800 placeholder:text-slate-300 border-none focus:ring-0 resize-none p-0 custom-scrollbar"
              autoFocus
            />
          </div>

          {/* Dynamic Previews */}
          {renderPreview()}

          {/* Hashtags Input - Adjusted to 16px font */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 mb-6 focus-within:border-[#006c55]/30 focus-within:bg-white transition-all">
            <span className="text-[#006c55] font-black text-[16px] select-none">#</span>
            <input 
              type="text" 
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="hashtags..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] font-medium text-slate-600 placeholder:text-slate-300 p-0"
            />
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="px-5 py-4 bg-white border-t border-slate-50 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm ${isToolsOpen ? 'bg-[#006c55] text-white rotate-45' : 'bg-white border border-slate-100 text-slate-400 hover:text-[#006c55]'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              </button>

              {/* Tools Bar - Responsive adaptation */}
              {isToolsOpen && (
                <div className="flex items-center gap-0.5 p-1 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-left-4 duration-300">
                  <button onClick={() => handleAttachment('image')} className={`p-2 rounded-lg transition-all ${activeAttachment === 'image' ? 'bg-[#006c55] text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </button>
                  <button onClick={() => handleAttachment('link')} className={`p-2 rounded-lg transition-all ${activeAttachment === 'link' ? 'bg-[#006c55] text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                  </button>
                  <button onClick={() => handleAttachment('file')} className={`p-2 rounded-lg transition-all ${activeAttachment === 'file' ? 'bg-[#006c55] text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                  </button>
                </div>
              )}
            </div>
            
            <button className="flex-1 bg-[#006c55] hover:bg-[#005a46] text-white py-2.5 rounded-xl font-black text-[12px] transition-all shadow-lg shadow-[#006c55]/20 active:scale-95 flex items-center justify-center gap-2 min-w-[120px]">
              <span>Publicar</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPost;
