import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Send,
  Loader2,
  BookOpen,
  GraduationCap,
  Sparkles,
  Hash,
  Globe,
  Paperclip,
  Calendar,
  Target,
  Info
} from 'lucide-react';
import { StorageService } from '../modules/storage/storage.service';
import { PostService } from '../modules/post/post.service';
import { auth } from '../firebase';
import { Author } from '../types';

type AttachmentType = 'none' | 'image' | 'file' | 'link';
type PostType = 'general' | 'study' | 'resource' | 'event' | 'question';

interface NewPostProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const NewPost: React.FC<NewPostProps> = ({ isOpen, onClose, onPostCreated }) => {
  const [text, setText] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [activeAttachment, setActiveAttachment] = useState<AttachmentType>('none');
  const [postType, setPostType] = useState<PostType>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const maxCharacters = 2000;

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [rawImageFiles, setRawImageFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; url: string; raw?: File } | null>(null);
  const [selectedLink, setSelectedLink] = useState<{ url: string; title: string } | null>(null);
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [tempLink, setTempLink] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Client-side safety check for SSR environment
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const postTypes = [
    { id: 'general', label: 'Geral', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { id: 'study', label: 'Estudo', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { id: 'resource', label: 'Recurso', icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { id: 'event', label: 'Evento', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
    { id: 'question', label: 'Dúvida', icon: Target, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
  ];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxCharacters) {
      setText(value);
      setCharacterCount(value.length);
    }
  };

  const addHashtag = () => {
    const tag = currentTagInput.trim().replace('#', '');
    if (tag && !hashtags.includes(tag) && hashtags.length < 5) {
      setHashtags([...hashtags, tag]);
      setCurrentTagInput('');
    }
  };

  const removeHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handlePost();
    }
    if (e.key === 'Enter' && e.target === tagInputRef.current) {
      e.preventDefault();
      addHashtag();
    }
    if (e.key === 'Backspace' && currentTagInput === '' && hashtags.length > 0) {
      removeHashtag(hashtags.length - 1);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remainingSlots = 10 - selectedImages.length;
    if (remainingSlots <= 0) {
      alert("Você pode adicionar no máximo 10 imagens.");
      return;
    }
    const newFiles = files.slice(0, remainingSlots);
    const newUrls = newFiles.map(file => URL.createObjectURL(file as Blob));
    setRawImageFiles(prev => [...prev, ...newFiles]);
    setSelectedImages(prev => [...prev, ...newUrls]);
    if (!selectedFile && !selectedLink) setActiveAttachment('image');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(selectedImages[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setRawImageFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedImages.length === 1 && !selectedFile && !selectedLink) setActiveAttachment('none');
  };

  const clearImage = () => {
    selectedImages.forEach(url => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setRawImageFiles([]);
    if (!selectedFile && !selectedLink) setActiveAttachment('none');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFile({ name: file.name, size: `${sizeInMB} MB`, url: URL.createObjectURL(file), raw: file });
      if (selectedImages.length === 0 && !selectedLink) setActiveAttachment('file');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLinkAdd = () => {
    if (tempLink.trim()) {
      let url = tempLink.trim();
      if (!url.startsWith('http')) url = 'https://' + url;
      const domain = url.replace('https://', '').replace('http://', '').split('/')[0];
      let title = domain;
      const pathParts = url.split('/').filter(Boolean);
      if (pathParts.length > 1) {
        const lastPart = pathParts[pathParts.length - 1];
        title = lastPart.replace(/-/g, ' ').replace(/_/g, ' ');
      }
      setSelectedLink({ url, title: title.charAt(0).toUpperCase() + title.slice(1) });
      setActiveAttachment('link');
      setIsLinkInputOpen(false);
      setTempLink('');
    }
  };

  const clearFile = () => {
    if (selectedFile?.url) URL.revokeObjectURL(selectedFile.url);
    setSelectedFile(null);
    if (selectedImages.length === 0 && !selectedLink) setActiveAttachment('none');
  };

  const clearLink = () => {
    setSelectedLink(null);
    if (selectedImages.length === 0 && !selectedFile) setActiveAttachment('none');
  };

  const clearAttachments = () => {
    selectedImages.forEach(url => URL.revokeObjectURL(url));
    if (selectedFile?.url) URL.revokeObjectURL(selectedFile.url);
    setActiveAttachment('none');
    setSelectedImages([]);
    setRawImageFiles([]);
    setSelectedFile(null);
    setSelectedLink(null);
  };

  const handlePost = async () => {
    if (!text.trim()) {
      alert("Por favor, escreva algo para publicar!");
      return;
    }
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
      if (rawImageFiles.length > 0) {
        const uploadPromises = rawImageFiles.map((file, idx) =>
          StorageService.uploadFile(`posts/${user.uid}/images/${timestamp}_${idx}_${file.name}`, file)
        );
        finalImages = await Promise.all(uploadPromises);
      }
      if (selectedFile?.raw) {
        const fileUrl = await StorageService.uploadFile(`posts/${user.uid}/files/${timestamp}_${selectedFile.name}`, selectedFile.raw);
        finalFileAttachment = { name: selectedFile.name, size: selectedFile.size, url: fileUrl };
      }
      const author = {
        id: user.uid,
        name: user.displayName || 'Usuário',
        username: '@' + (user.email?.split('@')[0] || 'usuario'),
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        verified: false
      };
      await PostService.createPost(text, hashtags, finalImages, author, selectedLink, finalFileAttachment, postType);
      setText('');
      setHashtags([]);
      setCurrentTagInput('');
      clearAttachments();
      setPostType('general');
      if (onPostCreated) onPostCreated();
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Erro ao criar publicação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPreview = () => {
    const hasAnyAttachment = selectedImages.length > 0 || selectedFile || selectedLink;
    if (!hasAnyAttachment) return null;
    return (
      <div className="mb-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
        {selectedImages.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Imagens ({selectedImages.length}/10)</span>
              <button onClick={clearImage} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Limpar todas</button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 snap-x">
              {selectedImages.map((src, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm snap-start group">
                  <img src={src} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                  <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-red-500 transition-all backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100" title="Remover imagem"><X size={10} strokeWidth={3} /></button>
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-[8px] font-bold rounded backdrop-blur-sm">{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedLink && (
          <div className="p-3 rounded-xl border-2 border-blue-100 bg-gradient-to-r from-blue-50/50 to-blue-50/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-blue-100"><Globe size={14} className="text-blue-500" /></div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Link Adicionado</span>
              </div>
              <button onClick={clearLink} className="text-slate-400 hover:text-slate-600 transition-colors p-1"><X size={16} strokeWidth={2.5} /></button>
            </div>
            <div className="pl-10">
              <h5 className="text-[13px] font-bold text-slate-900 mb-1 truncate">{selectedLink.title}</h5>
              <p className="text-[11px] text-blue-500 font-medium truncate opacity-80">{selectedLink.url}</p>
            </div>
          </div>
        )}
        {selectedFile && (
          <div className="p-3 rounded-xl border-2 border-[#006c55]/10 bg-gradient-to-r from-[#006c55]/5 to-[#006c55]/3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-[#006c55]/10"><Paperclip size={14} className="text-[#006c55]" /></div>
                <span className="text-[11px] font-black text-[#006c55] uppercase tracking-wider">Arquivo Anexado</span>
              </div>
              <button onClick={clearFile} className="text-slate-400 hover:text-slate-600 transition-colors p-1"><X size={16} strokeWidth={2.5} /></button>
            </div>
            <div className="pl-10">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-[13px] font-bold text-slate-900 mb-1 truncate">{selectedFile.name}</h5>
                  <span className="text-[10px] text-[#006c55] font-black uppercase tracking-wider">{selectedFile.size}</span>
                </div>
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-[#006c55]/10"><FileText size={18} className="text-[#006c55]" /></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getPlaceholderByType = () => {
    switch (postType) {
      case 'study': return 'Compartilhe um método de estudo, dica acadêmica ou material útil...';
      case 'resource': return 'Indique um livro, artigo, ferramenta ou recurso valioso...';
      case 'event': return 'Anuncie um evento, palestra, workshop ou encontro acadêmico...';
      case 'question': return 'Faça uma pergunta sobre a matéria, projeto ou dúvida acadêmica...';
      default: return 'Compartilhe conhecimento, ideias ou experiências universitárias...';
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 animate-in fade-in duration-500" onClick={onClose}>
      <div className="w-full max-w-[620px] bg-gradient-to-br from-white via-white to-white/95 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700 flex flex-col border border-white/40 max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500" />
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-50/80 relative">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006c55] to-[#00876a] flex items-center justify-center shadow-lg"><GraduationCap size={20} className="text-white" /></div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Compartilhar Conhecimento</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-[#006c55] opacity-90">Thoth University</span>
                  <span className="text-[8px] text-slate-400">•</span>
                  <span className="text-[10px] font-bold text-slate-500">Contribua com a comunidade</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600 active:scale-90 flex items-center justify-center"><X size={20} strokeWidth={2.5} /></button>
        </div>
        <div className="p-8 pb-4 max-h-[60vh] overflow-y-auto no-scrollbar flex-1">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Tipo de Publicação</span>
              <span className="text-[10px] font-bold text-slate-400">Selecione o propósito</span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {postTypes.map((type) => {
                const Icon = type.icon;
                const isActive = postType === type.id;
                return (
                  <button key={type.id} onClick={() => setPostType(type.id as PostType)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all flex-shrink-0 ${isActive ? `${type.bg} ${type.border} border-2 ${type.color} font-bold` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}><Icon size={16} /><span className="text-[12px] whitespace-nowrap">{type.label}</span></button>
                );
              })}
            </div>
          </div>
          <div className="relative mb-6">
            <textarea ref={textareaRef} value={text} onChange={handleTextChange} placeholder={getPlaceholderByType()} className="w-full min-h-[160px] bg-gradient-to-b from-white to-slate-50/30 text-[16px] font-medium text-slate-800 placeholder:text-slate-400 border-2 border-slate-100 focus:border-[#006c55]/30 focus:ring-2 focus:ring-[#006c55]/10 transition-all resize-none p-5 rounded-2xl leading-relaxed shadow-inner" autoFocus disabled={isSubmitting} onKeyDown={handleKeyDown} />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className={`text-[11px] font-bold ${characterCount > maxCharacters * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>{characterCount}/{maxCharacters}</span>
              <div className="text-[10px] text-slate-300">|</div>
              <span className="text-[10px] font-bold text-slate-400">Ctrl+Enter para publicar</span>
            </div>
          </div>
          {renderPreview()}
          {isLinkInputOpen && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/50 to-blue-50/30 rounded-2xl border-2 border-blue-100 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><LinkIcon size={16} className="text-blue-500" /><span className="text-[12px] font-bold text-blue-600">Adicionar Link</span></div>
                <button onClick={() => setIsLinkInputOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>
              </div>
              <div className="flex gap-2">
                <input type="text" value={tempLink} onChange={(e) => setTempLink(e.target.value)} placeholder="Cole a URL aqui..." className="flex-1 bg-white border-2 border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all font-medium" autoFocus />
                <button onClick={handleLinkAdd} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all active:scale-95 font-bold text-xs uppercase shadow-lg shadow-blue-500/20">Incluir</button>
              </div>
            </div>
          )}
        </div>
        <div className="px-8 py-6 bg-gradient-to-t from-white to-white/95 border-t border-slate-50/80 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Hash size={14} className="text-[#006c55]" /><span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Tópicos Relacionados</span></div>
              <span className="text-[10px] font-bold text-slate-400">{hashtags.length}/5 tags • Pressione Enter</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {hashtags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#006c55]/10 to-[#006c55]/5 rounded-lg border border-[#006c55]/20">
                  <span className="text-[11px] font-black text-[#006c55]">#{tag}</span>
                  <button onClick={() => removeHashtag(idx)} className="text-[#006c55]/60 hover:text-[#006c55] transition-colors"><X size={10} strokeWidth={3} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input ref={tagInputRef} type="text" value={currentTagInput} onChange={(e) => setCurrentTagInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Adicione tópicos..." className="flex-1 h-11 px-4 bg-white border-2 border-slate-100 rounded-xl focus:ring-2 focus:ring-[#006c55]/10 focus:border-[#006c55]/30 transition-all text-[13px] font-medium text-slate-700 placeholder:text-slate-400" disabled={isSubmitting || hashtags.length >= 5} maxLength={20} />
              <button onClick={addHashtag} disabled={!currentTagInput.trim() || hashtags.length >= 5} className="h-11 px-4 bg-white border-2 border-slate-100 rounded-xl text-[#006c55] hover:bg-[#006c55]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-xs uppercase">Add</button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-slate-50 to-white/50 rounded-2xl border border-slate-100 shadow-inner">
              <input type="file" accept="image/*" multiple ref={imageInputRef} onChange={handleImageSelect} className="hidden" />
              <button onClick={() => imageInputRef.current?.click()} className={`p-3 rounded-xl transition-all active:scale-90 ${selectedImages.length > 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-blue-500 hover:bg-white'}`} title="Imagens"><div className="relative"><ImageIcon size={20} strokeWidth={2.5} />{selectedImages.length > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">{selectedImages.length}</span>}</div></button>
              <button onClick={() => setIsLinkInputOpen(true)} className={`p-3 rounded-xl transition-all active:scale-90 ${selectedLink ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-blue-500 hover:bg-white'}`} title="Link"><LinkIcon size={20} strokeWidth={2.5} /></button>
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              <button onClick={() => fileInputRef.current?.click()} className={`p-3 rounded-xl transition-all active:scale-90 ${selectedFile ? 'bg-gradient-to-r from-[#006c55] to-[#00876a] text-white shadow-lg' : 'text-slate-400 hover:text-[#006c55] hover:bg-white'}`} title="Arquivo"><FileText size={20} strokeWidth={2.5} /></button>
            </div>
            <button onClick={handlePost} disabled={isSubmitting || !text.trim()} className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 min-w-[180px] ${isSubmitting || !text.trim() ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-300 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-[#006c55] via-[#007a62] to-[#00876a] text-white hover:shadow-2xl hover:shadow-[#006c55]/30'}`}>{isSubmitting ? (<><Loader2 className="animate-spin" size={20} strokeWidth={3} /><span>Publicando...</span></>) : (<><GraduationCap size={18} strokeWidth={2.5} /><span>Compartilhar</span><Send size={16} strokeWidth={3} /></>)}</button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default NewPost;
