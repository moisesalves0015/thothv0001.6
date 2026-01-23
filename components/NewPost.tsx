import React, { useState, useRef, useEffect } from 'react';
import { X, FileText, Image as ImageIcon, Link as LinkIcon, Send, Loader2 } from 'lucide-react';
import { StorageService } from '../modules/storage/storage.service';
import { PostService } from '../modules/post/post.service';
import { auth } from '../firebase';
import { Author } from '../types';

type AttachmentType = 'none' | 'image' | 'file' | 'link';

interface NewPostProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const NewPost: React.FC<NewPostProps> = ({ isOpen, onClose, onPostCreated }) => {
  const [text, setText] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [activeAttachment, setActiveAttachment] = useState<AttachmentType>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attachment States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rawImageFile, setRawImageFile] = useState<File | null>(null);

  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; url: string; raw?: File } | null>(null);
  const [selectedLink, setSelectedLink] = useState<{ url: string; title: string } | null>(null);
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [tempLink, setTempLink] = useState('');

  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawImageFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      // Não limpa arquivo nem link - permite múltiplos anexos
      // Atualiza activeAttachment apenas se não houver outros anexos
      if (!selectedFile && !selectedLink) {
        setActiveAttachment('image');
      }
    }
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFile({
        name: file.name,
        size: `${sizeInMB} MB`,
        url: URL.createObjectURL(file),
        raw: file
      });
      // Não limpa imagem nem link - permite múltiplos anexos
      // Atualiza activeAttachment apenas se não houver outros anexos
      if (!selectedImage && !selectedLink) {
        setActiveAttachment('file');
      }
    }
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLinkAdd = () => {
    if (tempLink.trim()) {
      let url = tempLink.trim();
      if (!url.startsWith('http')) url = 'https://' + url;
      setSelectedLink({
        url,
        title: url.replace('https://', '').replace('http://', '').split('/')[0]
      });
      setActiveAttachment('link');
      setIsLinkInputOpen(false);
      setTempLink('');
      // Link é exclusivo - limpa outros anexos
      setSelectedImage(null);
      setSelectedFile(null);
      setRawImageFile(null);
    }
  };

  const clearImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    setSelectedImage(null);
    setRawImageFile(null);
    // Atualiza activeAttachment se não houver mais anexos
    if (!selectedFile && !selectedLink) {
      setActiveAttachment('none');
    }
  };

  const clearFile = () => {
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
    }
    setSelectedFile(null);
    // Atualiza activeAttachment se não houver mais anexos
    if (!selectedImage && !selectedLink) {
      setActiveAttachment('none');
    }
  };

  const clearLink = () => {
    setSelectedLink(null);
    // Atualiza activeAttachment se não houver mais anexos
    if (!selectedImage && !selectedFile) {
      setActiveAttachment('none');
    }
  };

  const clearAttachments = () => {
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    if (selectedFile?.url) URL.revokeObjectURL(selectedFile.url);
    setActiveAttachment('none');
    setSelectedImage(null);
    setRawImageFile(null);
    setSelectedFile(null);
    setSelectedLink(null);
  };

  const handlePost = async () => {
    if (!text.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      alert("Você precisa estar logado para publicar.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImages: string[] = [];
      let finalFileAttachment = null;

      const timestamp = Date.now();

      // 1. Upload Image if exists (independente de activeAttachment)
      if (rawImageFile) {
        const imageUrl = await StorageService.uploadFile(`posts/${user.uid}/images/${timestamp}_${rawImageFile.name}`, rawImageFile);
        finalImages = [imageUrl];
      }

      // 2. Upload File if exists (independente de activeAttachment)
      if (selectedFile?.raw) {
        const fileUrl = await StorageService.uploadFile(`posts/${user.uid}/files/${timestamp}_${selectedFile.name}`, selectedFile.raw);
        finalFileAttachment = {
          name: selectedFile.name,
          size: selectedFile.size,
          url: fileUrl
        };
      }

      const author: Author = {
        id: user.uid,
        name: user.displayName || 'Usuário',
        username: '@' + (user.email?.split('@')[0] || 'usuario'),
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        verified: false
      };

      const tagList = hashtags.split(' ').map(t => t.replace('#', '')).filter(t => t.length > 0);

      await PostService.createPost(
        text,
        tagList,
        finalImages,
        author,
        selectedLink,
        finalFileAttachment
      );

      setText('');
      setHashtags('');
      clearAttachments();

      if (onPostCreated) {
        onPostCreated();
      }
      onClose();

    } catch (error) {
      console.error("Error creating post:", error);
      alert("Erro ao criar publicação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPreview = () => {
    const hasAnyAttachment = selectedImage || selectedFile || selectedLink;
    if (!hasAnyAttachment) return null;

    return (
      <div className="mb-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
        {/* Preview de Imagem */}
        {selectedImage && (
          <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm">
            <img src={selectedImage} className="w-full max-h-[300px] object-cover" alt="Preview" />
            <button
              onClick={clearImage}
              className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all backdrop-blur-sm active:scale-90"
              title="Remover imagem"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        )}

        {/* Preview de Link */}
        {selectedLink && (
          <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-blue-100 bg-blue-50/50 shadow-sm transition-all hover:bg-blue-50">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 border border-blue-100 uppercase text-[10px] font-black text-blue-500">
              URL
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-[14px] font-black text-slate-900 truncate tracking-tight">{selectedLink.title}</h5>
              <p className="text-[11px] text-blue-500 font-bold truncate opacity-80">{selectedLink.url}</p>
            </div>
            <button onClick={clearLink} className="p-2 text-slate-400 hover:text-slate-600 transition-colors" title="Remover link">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Preview de Arquivo */}
        {selectedFile && (
          <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#006c55]/10 bg-[#006c55]/5 shadow-sm transition-all hover:bg-[#006c55]/10">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 border border-[#006c55]/10">
              <FileText className="text-[#006c55]" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-[14px] font-black text-slate-900 truncate tracking-tight">{selectedFile.name}</h5>
              <span className="text-[10px] text-[#006c55] font-black uppercase tracking-widest">{selectedFile.size}</span>
            </div>
            <button onClick={clearFile} className="p-2 text-slate-400 hover:text-slate-600 transition-colors" title="Remover arquivo">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[4px] p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Criar Publicação</h3>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#006c55] opacity-70 mt-2">Compartilhe conhecimento</span>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-600 active:scale-90"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8 pb-4 max-h-[60vh] overflow-y-auto no-scrollbar flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O que está acontecendo agora?"
            className="w-full h-32 bg-transparent text-[18px] font-medium text-slate-800 placeholder:text-slate-300 border-none focus:ring-0 resize-none p-0 custom-scrollbar leading-relaxed"
            autoFocus
            disabled={isSubmitting}
          />

          {renderPreview()}

          {/* Link Input Overlay */}
          {isLinkInputOpen && (
            <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in slide-in-from-top-4 duration-300">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempLink}
                  onChange={(e) => setTempLink(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-white border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium h-11"
                  autoFocus
                />
                <button
                  onClick={handleLinkAdd}
                  className="bg-blue-500 text-white px-4 rounded-xl hover:bg-blue-600 transition-all active:scale-95 font-bold text-xs uppercase"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setIsLinkInputOpen(false)}
                  className="bg-white text-slate-400 p-2.5 rounded-xl hover:bg-slate-50 transition-all border border-blue-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-[#006c55]/30 focus-within:bg-white transition-all shadow-sm">
            <span className="text-[#006c55] font-black text-lg select-none">#</span>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="principais topicos..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600 placeholder:text-slate-300 p-0"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-white border-t border-slate-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-[20px] border border-slate-100 shadow-inner">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={imageInputRef}
                onChange={handleImageSelect}
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                className={`p-3 rounded-xl transition-all active:scale-90 ${selectedImage ? 'bg-[#006c55] text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-[#006c55]'}`}
                title="Adicionar imagem"
              >
                <ImageIcon size={20} strokeWidth={2.5} />
              </button>

              <button
                onClick={() => setIsLinkInputOpen(true)}
                className={`p-3 rounded-xl transition-all active:scale-90 ${selectedLink ? 'bg-[#006c55] text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-[#006c55]'}`}
                title="Adicionar link"
              >
                <LinkIcon size={20} strokeWidth={2.5} />
              </button>

              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-xl transition-all active:scale-90 ${selectedFile ? 'bg-[#006c55] text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-[#006c55]'}`}
                title="Adicionar arquivo"
              >
                <FileText size={20} strokeWidth={2.5} />
              </button>
            </div>

            <button
              onClick={handlePost}
              disabled={isSubmitting || !text.trim()}
              className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isSubmitting || !text.trim()
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                : 'bg-[#006c55] text-white hover:bg-[#005a46] shadow-[#006c55]/20'
                }`}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} strokeWidth={3} />
              ) : (
                <>
                  <span>Publicar Agora</span>
                  <Send size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPost;
