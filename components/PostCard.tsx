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
  Repeat2,
  Link,
  FileText,
  Download,
  Globe,
  Loader2,
  Trash2,
  Edit3,
  EyeOff,
  AlertTriangle,
  Clock,
  ExternalLink,
  Paperclip,
  CheckCircle,
  BarChart2,
  Heart,
  MoreVertical
} from 'lucide-react';
import { PostService } from '../modules/post/post.service';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface PostCardProps {
  post: Post;
  onBookmarkToggle?: (postId: string, bookmarked: boolean) => void;
  onLikeToggle?: (postId: string, liked: boolean) => void;
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onBookmarkToggle, onLikeToggle, onDelete }) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(user ? post.likedBy?.includes(user.uid) : false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalData, setModalData] = useState<{ images: string[], index: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [shareCount, setShareCount] = useState(post.repostedBy?.length || 0);
  const [isReposting, setIsReposting] = useState(false);

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

  const handleBookmark = async () => {
    if (!user) return;
    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);
    try {
      await PostService.toggleBookmark(user.uid, post, newBookmarkedState);
      if (onBookmarkToggle) {
        onBookmarkToggle(post.id, newBookmarkedState);
      }
    } catch (e) {
      console.error("Error toggling bookmark:", e);
      setIsBookmarked(!newBookmarkedState);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      await PostService.toggleLike(post.id, user.uid, newLikedState);
      if (onLikeToggle) onLikeToggle(post.id, newLikedState);
    } catch (e) {
      console.error("Error toggling like:", e);
      // Revert optimistic update
      setIsLiked(!newLikedState);
      setLikeCount(prev => !newLikedState ? prev + 1 : prev - 1);
    }
  };

  const handleRepost = async () => {
    if (!user || isReposting) return;
    setIsReposting(true);
    try {
      const currentUser = {
        id: user.uid,
        name: user.displayName || 'Estudante',
        username: user.email?.split('@')[0] || 'estudante',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
      };
      await PostService.repost(post, currentUser);
      setShareCount(prev => prev + 1);
      toast.success('Publicação repostada com sucesso!');
    } catch (e) {
      console.error("Error reposting:", e);
      toast.error('Erro ao repostar publicação.');
    } finally {
      setIsReposting(false);
      setIsMenuOpen(false);
    }
  };

  const handleEdit = async () => {
    if (post.author.id !== user?.uid) return;
    const newContent = window.prompt("Edite sua publicação:", post.content);
    if (newContent !== null && newContent.trim() !== "" && newContent !== post.content) {
      try {
        await PostService.updatePost(post.id, { content: newContent });
        post.content = newContent; // Atualização local simples
        toast.success("Publicação atualizada!");
        setIsMenuOpen(false);
      } catch (e) {
        console.error("Error updating post:", e);
        toast.error("Erro ao atualizar publicação.");
      }
    }
  };

  const handleDelete = async () => {
    if (!user || isDeleting || post.author.id !== user.uid) return;
    if (!window.confirm("Tem certeza que deseja apagar esta publicação? Esta ação é irreversível.")) return;

    setIsDeleting(true);
    try {
      await PostService.deletePost(post.id);
      if (onDelete) onDelete(post.id);
      setIsMenuOpen(false);
      toast.success("Publicação apagada.");
    } catch (e) {
      console.error("Error deleting post:", e);
      toast.error("Erro ao apagar publicação.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAction = (action: string) => {
    console.log(`Action chosen: ${action}`);
    setIsMenuOpen(false);
    // Future implementation for Report, Hide, etc.
    if (action === 'report') alert('Denúncia enviada com sucesso.');
    if (action === 'hide') alert('Esta publicação não aparecerá mais para você.');
  };

  const formatTimestamp = (timestamp: string) => {
    return timestamp;
  };

  const renderCollage = () => {
    const imgCount = post.images?.length || 0;
    if (imgCount === 0) return null;

    const typeConfig = getPostTypeConfig(post.postType);
    const hasText = post.content.trim().length > 0;

    // Altura baseada no conteúdo
    const containerHeight = hasText ? 'h-[200px]' : 'h-[300px]';

    if (imgCount === 1) {
      return (
        <div className={`relative w-full ${containerHeight} mb-4 cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-100 flex-shrink-0 shadow-lg bg-gradient-to-br from-white to-slate-50 group transition-all duration-300`} onClick={() => openModal(0)}>
          <img src={post.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt="Publicação" />
          <div className="absolute top-3 left-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${typeConfig.bg} ${typeConfig.border} border backdrop-blur-sm`}>
              {React.createElement(typeConfig.icon, { size: 12, className: typeConfig.color })}
              <span className={`text-[9px] font-black uppercase tracking-tighter ${typeConfig.color}`}>{typeConfig.label}</span>
            </div>
          </div>
        </div>
      );
    }

    if (imgCount === 2) {
      return (
        <div className={`grid grid-cols-2 gap-2 mb-4 ${containerHeight} overflow-hidden rounded-2xl flex-shrink-0 relative transition-all duration-300`}>
          {post.images.slice(0, 2).map((img, idx) => (
            <div key={idx} className="relative h-full cursor-pointer overflow-hidden group" onClick={() => openModal(idx)}>
              <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Imagem ${idx}`} />
            </div>
          ))}
        </div>
      );
    }

    if (imgCount === 3) {
      return (
        <div className={`grid grid-cols-3 gap-2 mb-4 ${containerHeight} overflow-hidden rounded-2xl flex-shrink-0 relative transition-all duration-300`}>
          <div className="col-span-2 relative h-full cursor-pointer overflow-hidden group" onClick={() => openModal(0)}>
            <img src={post.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Principal" />
          </div>
          <div className="grid grid-rows-2 gap-2 h-full">
            {post.images.slice(1, 3).map((img, idx) => (
              <div key={idx} className="relative h-full cursor-pointer overflow-hidden group" onClick={() => openModal(idx + 1)}>
                <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Imagem ${idx}`} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (imgCount === 4) {
      return (
        <div className={`flex flex-col gap-2 mb-4 ${containerHeight} overflow-hidden rounded-2xl flex-shrink-0 relative transition-all duration-300`}>
          <div className="h-2/3 relative cursor-pointer overflow-hidden group" onClick={() => openModal(0)}>
            <img src={post.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Principal" />
          </div>
          <div className="h-1/3 grid grid-cols-3 gap-2">
            {post.images.slice(1, 4).map((img, idx) => (
              <div key={idx} className="relative h-full cursor-pointer overflow-hidden group" onClick={() => openModal(idx + 1)}>
                <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Imagem ${idx}`} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 5 ou mais imagens
    return (
      <div className={`grid grid-cols-2 gap-2 mb-4 ${containerHeight} overflow-hidden rounded-2xl flex-shrink-0 relative transition-all duration-300`}>
        <div className="relative h-full cursor-pointer overflow-hidden group" onClick={() => openModal(0)}>
          <img src={post.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Principal" />
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
          {post.images.slice(1, 5).map((img, idx) => (
            <div key={idx} className="relative h-full cursor-pointer overflow-hidden group" onClick={() => openModal(idx + 1)}>
              <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Imagem ${idx}`} />
              {idx === 3 && imgCount > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[12px] font-black backdrop-blur-[2px]">
                  +{imgCount - 5} imagens
                </div>
              )}
            </div>
          ))}
        </div>
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
            <div className="min-w-0 flex-1"><h5 className="text-[12px] font-bold text-slate-900 truncate leading-tight">{post.attachmentFile.name}</h5><span className="text-[10px] text-[#006c55] font-black uppercase tracking-wider">{post.attachmentFile.size}</span></div>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-[#006c55]/10 flex-shrink-0 ml-2"><FileText size={14} className="text-[#006c55]" /></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex-shrink-0 w-[350px] h-[500px] flex flex-col bg-gradient-to-br from-white via-white to-white/95 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-6 shadow-lg border border-white/60 dark:border-white/5 snap-center hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
        {post.originalPostId && (
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Repeat2 size={12} className="text-[#006c55] dark:text-emerald-400" />
            <span className="text-[10px] font-bold text-[#006c55] dark:text-emerald-400 uppercase tracking-wider">
              {post.repostedBy && post.repostedBy[0]?.uid === user?.uid ? 'Você repostou' : `${post.repostedBy?.[0]?.name} repostou`}
            </span>
          </div>
        )}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-start justify-between mb-4 flex-shrink-0 relative">
          <div className="flex items-start gap-3 overflow-hidden flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img src={post.author.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-lg" alt={post.author.name} />
              {post.author.verified && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#006c55] to-[#00876a] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800"><CheckCircle size={8} className="text-white" fill="white" /></div>}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5 min-w-0">
                <h4 className="text-[14px] font-black text-slate-900 dark:text-white leading-tight truncate shrink-1">{post.author.name}</h4>
                {post.author.verified && <span className="text-[8px] font-black text-[#006c55] dark:text-emerald-400 bg-[#006c55]/10 dark:bg-emerald-400/10 px-1.5 py-0.5 rounded-md uppercase tracking-tighter flex-shrink-0">V</span>}
              </div>
              <div className="flex flex-col text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold truncate">{post.author.username}</span>
                <div className="flex items-center gap-1 mt-0.5 opacity-70"><Clock size={10} /><span>{formatTimestamp(post.timestamp)}</span></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2" ref={menuRef}>
            <button onClick={handleBookmark} className={`p-2 rounded-xl transition-all active:scale-95 ${isBookmarked ? 'text-[#006c55] dark:text-emerald-400 bg-gradient-to-br from-[#006c55]/10 to-[#006c55]/5 dark:from-emerald-400/10 dark:to-emerald-400/5' : 'text-slate-400 hover:text-[#006c55] dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`} title={isBookmarked ? "Remover" : "Salvar"}><Bookmark size={16} strokeWidth={isBookmarked ? 2.5 : 2} fill={isBookmarked ? "currentColor" : "none"} /></button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-xl transition-all active:scale-95 ${isMenuOpen ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`} title="Opções"><MoreVertical size={16} /></button>
            {isMenuOpen && <div className="absolute right-0 top-10 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Opções para o Dono */}
              {user?.uid === post.author.id ? (
                <>
                  <button
                    onClick={handleRepost}
                    disabled={isReposting}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    {isReposting ? <Loader2 size={14} className="animate-spin" /> : <Repeat2 size={14} />}
                    Repostar no meu feed
                  </button>
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <Edit3 size={14} /> Editar publicação
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                    <BarChart2 size={14} /> Estatísticas
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4"></div>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-colors"
                  >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Apagar publicação
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRepost}
                    disabled={isReposting}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors disabled:opacity-50"
                  >
                    {isReposting ? <Loader2 size={14} className="animate-spin" /> : <Repeat2 size={14} />}
                    Repostar
                  </button>
                  <button onClick={() => handleAction('copy_link')} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                    <Link size={14} /> Copiar link
                  </button>
                  <button onClick={() => handleAction('hide')} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                    <EyeOff size={14} /> Não tenho interesse
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4"></div>
                  <button onClick={() => handleAction('report')} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-colors">
                    <AlertTriangle size={14} /> Denunciar
                  </button>
                </>
              )}
            </div>}
          </div>
        </div>
        {/* Conteúdo Principal (Texto e Mídia) */}
        <div className={`flex-1 flex flex-col min-h-0 ${post.originalPostId ? 'bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-3 border border-slate-100 dark:border-white/5 mb-3' : ''}`}>
          {renderCollage()}
          <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
            <p className="text-[14px] text-slate-800 dark:text-slate-200 leading-relaxed mb-3 font-medium">
              {isExpanded ? post.content : (isLongText ? post.content.substring(0, charLimit) + "..." : post.content)}
              {isLongText && <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="inline-block ml-2 text-[11px] font-black text-[#006c55] dark:text-emerald-400 hover:underline cursor-pointer uppercase tracking-tighter">{isExpanded ? ' Menos' : ' Mais'}</button>}
            </p>
            {renderLinkAttachment()}
            {renderFileAttachment()}
          </div>
        </div>

        {/* Hashtags e Rodapé Fixo */}
        <div className="flex-shrink-0">
          {post.tags && post.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 6).map(tag => <span key={tag} className="text-[9px] font-extrabold text-[#006c55] dark:text-emerald-400 bg-gradient-to-r from-[#006c55]/10 to-[#006c55]/5 dark:from-emerald-400/10 dark:to-emerald-400/5 px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all hover:scale-105 cursor-pointer border border-[#006c55]/10 dark:border-white/5">#{tag}</span>)}
          </div>}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 dark:border-white/5">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className={`flex items-center gap-1.5 transition-all active:scale-95 ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}><Heart size={16} strokeWidth={2.5} fill={isLiked ? "currentColor" : "none"} /><span className="text-[11px] font-bold">{likeCount}</span></button>
              <button onClick={handleRepost} disabled={isReposting} className={`flex items-center gap-1.5 transition-all active:scale-95 ${isReposting ? 'opacity-50' : 'text-slate-400 hover:text-[#006c55]'}`}><Repeat2 size={16} strokeWidth={2.5} /><span className="text-[11px] font-bold">{shareCount}</span></button>
            </div>
          </div>
        </div>
      </div>
      {modalData && <ImageModal images={modalData.images} initialIndex={modalData.index} onClose={() => setModalData(null)} />}
    </>
  );
};

export default PostCard;
