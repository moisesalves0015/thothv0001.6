import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../types';
import ImageModal from './ImageModal';
import { 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Calendar, 
  Target,
  Bookmark,
  Share2,
  Link,
  FileText,
  Download,
  MoreVertical,
  MessageCircle,
  Heart,
  BarChart2,
  Clock,
  CheckCircle,
  ExternalLink,
  Paperclip,
  Globe
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onBookmarkToggle?: (postId: string, bookmarked: boolean) => void;
  onLikeToggle?: (postId: string, liked: boolean) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onBookmarkToggle, onLikeToggle }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalData, setModalData] = useState<{ images: string[], index: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(post.replies || 0);
  const [shareCount, setShareCount] = useState(0);

  const charLimit = 280;
  const isLongText = post.content.length > charLimit;

  const openModal = (idx: number) => {
    setModalData({ images: post.images, index: idx });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const getPostTypeConfig = (type?: string) => {
    const configs = {
      'study': { label: 'Estudo', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50/80', border: 'border-emerald-100' },
      'resource': { label: 'Recurso', icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50/80', border: 'border-amber-100' },
      'event': { label: 'Evento', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50/80', border: 'border-purple-100' },
      'question': { label: 'Dúvida', icon: Target, color: 'text-red-600', bg: 'bg-red-50/80', border: 'border-red-100' },
      'general': { label: 'Geral', icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50/80', border: 'border-blue-100' }
    };
    return type && configs[type as keyof typeof configs] ? configs[type as keyof typeof configs] : configs.general;
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmarkToggle) {
      onBookmarkToggle(post.id, !isBookmarked);
    }
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    if (onLikeToggle) {
      onLikeToggle(post.id, newLikedState);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return timestamp;
  };

  const renderCollage = () => {
    const imgCount = post.images?.length || 0;
    if (imgCount === 0) return null;

    const typeConfig = getPostTypeConfig(post.postType);

    if (imgCount === 1) {
      return (
        <div className="relative w-full h-64 mb-4 cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-100 flex-shrink-0 shadow-lg bg-gradient-to-br from-white to-slate-50 group" onClick={() => openModal(0)}>
          <img src={post.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt="Publicação" />
          <div className="absolute top-3 left-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${typeConfig.bg} ${typeConfig.border} border backdrop-blur-sm`}>
              {React.createElement(typeConfig.icon, { size: 12, className: typeConfig.color })}
              <span className={`text-[9px] font-black uppercase tracking-tighter ${typeConfig.color}`}>{typeConfig.label}</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2 mb-4 h-48 overflow-hidden rounded-2xl flex-shrink-0 relative">
        <div className="relative h-full cursor-pointer overflow-hidden rounded-xl group" onClick={() => openModal(0)}>
          <img src={post.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Principal" />
          <div className="absolute top-2 left-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${typeConfig.bg} ${typeConfig.border} border backdrop-blur-sm`}>
              {React.createElement(typeConfig.icon, { size: 10, className: typeConfig.color })}
              <span className={`text-[8px] font-black uppercase tracking-tighter ${typeConfig.color}`}>{typeConfig.label}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-rows-2 gap-2 h-full">
          {post.images.slice(1, 3).map((img, idx) => (
            <div key={idx} className="relative h-full cursor-pointer overflow-hidden rounded-xl group" onClick={() => openModal(idx + 1)}>
              <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Galeria ${idx}`} />
            </div>
          ))}
        </div>
        {imgCount > 3 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
            +{imgCount - 3} imagens
          </div>
        )}
      </div>
    );
  };

  const renderLinkAttachment = () => {
    if (!post.externalLink) return null;
    return (
      <a href={post.externalLink.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-xl border-2 border-blue-100 bg-gradient-to-r from-blue-50/60 to-blue-50/30 mb-3 hover:bg-blue-50 transition-all duration-300 group" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 border border-blue-100 group-hover:scale-105 transition-transform"><Globe size={16} className="text-blue-500" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Recurso Externo</span><ExternalLink size={10} className="text-blue-400" /></div>
          <h5 className="text-[12px] font-bold text-slate-900 truncate leading-tight mb-1">{post.externalLink.title}</h5>
          <p className="text-[10px] text-blue-500 truncate font-medium">{post.externalLink.url.replace('https://', '').replace('http://', '').split('/')[0]}</p>
        </div>
      </a>
    );
  };

  const renderFileAttachment = () => {
    if (!post.attachmentFile) return null;
    return (
      <div className="flex items-start gap-3 p-3 rounded-xl border-2 border-[#006c55]/10 bg-gradient-to-r from-[#006c55]/5 to-[#006c55]/3 mb-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 border border-[#006c55]/10"><Paperclip size={16} className="text-[#006c55]" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-[#006c55] uppercase tracking-wider">Arquivo Anexado</span>
            <a href={post.attachmentFile.url} download className="p-1.5 text-slate-400 hover:text-[#006c55] transition-colors" onClick={(e) => e.stopPropagation()}><Download size={12} /></a>
          </div>
          <div className="flex items-center justify-between">
            <div><h5 className="text-[12px] font-bold text-slate-900 truncate leading-tight">{post.attachmentFile.name}</h5><span className="text-[10px] text-[#006c55] font-black uppercase tracking-wider">{post.attachmentFile.size}</span></div>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-[#006c55]/10"><FileText size={14} className="text-[#006c55]" /></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex-shrink-0 w-full sm:w-[340px] h-[500px] flex flex-col bg-gradient-to-br from-white via-white to-white/95 rounded-3xl p-6 shadow-lg border border-white/60 snap-center hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-start justify-between mb-4 flex-shrink-0 relative">
          <div className="flex items-start gap-3 overflow-hidden flex-1">
            <div className="relative">
              <img src={post.author.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-lg flex-shrink-0" alt={post.author.name} />
              {post.author.verified && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#006c55] to-[#00876a] rounded-full flex items-center justify-center border-2 border-white"><CheckCircle size={8} className="text-white" fill="white" /></div>}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-[14px] font-black text-slate-900 leading-tight truncate">{post.author.name}</h4>
                  {post.author.verified && <span className="text-[8px] font-black text-[#006c55] bg-[#006c55]/10 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Verificado</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                <span className="font-bold truncate">{post.author.username}</span>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1"><Clock size={10} /><span>{formatTimestamp(post.timestamp)}</span></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2" ref={menuRef}>
            <button onClick={handleBookmark} className={`p-2 rounded-xl transition-all active:scale-90 ${isBookmarked ? 'text-[#006c55] bg-gradient-to-br from-[#006c55]/10 to-[#006c55]/5' : 'text-slate-400 hover:text-[#006c55] hover:bg-slate-50'}`} title={isBookmarked ? "Remover" : "Salvar"}><Bookmark size={16} strokeWidth={isBookmarked ? 2.5 : 2} fill={isBookmarked ? "currentColor" : "none"} /></button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-xl transition-all active:scale-90 ${isMenuOpen ? 'text-slate-900 bg-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} title="Opções"><MoreVertical size={16} /></button>
            {isMenuOpen && <div className="absolute right-0 top-10 w-56 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors"><Share2 size={14} />Compartilhar</button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors"><Link size={14} />Copiar link</button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 hover:bg-slate-50 text-left transition-colors"><BarChart2 size={14} />Estatísticas</button>
                <div className="h-px bg-slate-100 my-2 mx-4"></div>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 text-left transition-colors"><ExternalLink size={14} />Denunciar</button>
              </div>}
          </div>
        </div>
        {renderCollage()}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto no-scrollbar pr-2 mb-4">
            <p className="text-[14px] text-slate-800 leading-relaxed mb-3 font-medium">
              {isExpanded ? post.content : (isLongText ? post.content.substring(0, charLimit) + "..." : post.content)}
              {isLongText && <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="inline-block ml-2 text-[11px] font-black text-[#006c55] hover:underline cursor-pointer uppercase tracking-tighter">{isExpanded ? ' Menos' : ' Mais'}</button>}
            </p>
            {renderLinkAttachment()}
            {renderFileAttachment()}
            {post.tags && post.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.slice(0, 6).map(tag => <span key={tag} className="text-[9px] font-extrabold text-[#006c55] bg-gradient-to-r from-[#006c55]/10 to-[#006c55]/5 px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all hover:scale-105 cursor-pointer border border-[#006c55]/10">#{tag}</span>)}
              </div>}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100/80 flex-shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className={`flex items-center gap-1.5 transition-all active:scale-95 ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}><Heart size={16} strokeWidth={2.5} fill={isLiked ? "currentColor" : "none"} /><span className="text-[11px] font-bold">{likeCount}</span></button>
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors active:scale-95"><MessageCircle size={16} strokeWidth={2.5} /><span className="text-[11px] font-bold">{commentCount}</span></button>
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-500 transition-colors active:scale-95"><Share2 size={16} strokeWidth={2.5} /><span className="text-[11px] font-bold">{shareCount}</span></button>
            </div>
            <div className="flex items-center gap-2"><div className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><BarChart2 size={12} /><span>{Math.floor(Math.random() * 1000)} views</span></div></div>
          </div>
        </div>
      </div>
      {modalData && <ImageModal images={modalData.images} initialIndex={modalData.index} onClose={() => setModalData(null)} />}
    </>
  );
};

export default PostCard;
