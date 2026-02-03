import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../../types';
import ImageModal from './ImageModal';
import NewPost from './NewPost';
import ClickableAvatar from './ClickableAvatar';
import ProfilePreviewModal from './ProfilePreviewModal';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Calendar,
  Target,
  Bookmark,
  Repeat2,
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
  MoreVertical,
  Download,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PostService } from '../../modules/post/post.service';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

import { useUserProfile } from '../../hooks/useUserProfile';
import { usePost } from '../../hooks/usePost';

interface PostCardProps {
  post: Post;
  onBookmarkToggle?: (postId: string, bookmarked: boolean) => void;
  onLikeToggle?: (postId: string, liked: boolean) => void;
  onDelete?: (postId: string) => void;
  onRepostSuccess?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onBookmarkToggle, onLikeToggle, onDelete, onRepostSuccess }) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // 1. Identification of Repost vs Original
  const isRepost = !!post.originalPostId;
  const originalPostId = post.originalPostId; // For reposts, this is the key ID

  // 2. Fetch LIVE data for the *Content* Source
  // If it's a repost, we fetch the original to get the latest text/images AND latest author profile of that original
  // If it's a regular post, we skip this hook (id undefined)
  const { post: liveOriginalPost, loading: loadingOriginal, error: originalError } = usePost(originalPostId);

  // 3. Determine Display Data
  // If repost: use liveOriginalPost (if loaded), else fallback to post (snapshot) - but if error, handle it.
  // If normal: use post.

  // MERGED POST OBJECT for display rendering
  // We prioritize the live fetched original post for content.
  // The 'post' prop still governs the "wrapper" (who reposted, timestamp of repost)
  const displayPost = isRepost ? (liveOriginalPost || post) : post;

  // 4. Content Availability Check for Reposts
  const isOriginalDeleted = isRepost && !loadingOriginal && originalError === 'Post not found';

  // 5. Author to display in the Main Header (not the small repost header)
  // For Repost: It's the Original Post's author.
  // For Normal: It's the Post's author.
  // We use displayPost.author because if liveOriginalPost is loaded, it has the snapshot of author *at that time* or we can trust the 'latest' fetch if 'usePost' included author.
  // Actually, 'usePost' returns the Firestore doc. The author field in Firestore might be a snapshot.
  // We already have 'useUserProfile' from previous step to fix the avatar. Let's combine them.

  const displayAuthor = displayPost.originalPostId && displayPost.originalAuthor ? displayPost.originalAuthor : displayPost.author;

  // Fetch live profile for the displayed author (already implemented)
  const isAuthorSelf = user?.uid === displayAuthor.id;
  const { profile: authorProfile } = useUserProfile(isAuthorSelf ? undefined : displayAuthor.id);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalData, setModalData] = useState<{ images: string[], index: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [likeCount, setLikeCount] = useState(displayPost.likes || 0);
  const [shareCount, setShareCount] = useState(displayPost.repostedBy?.length || 0);
  const [isReposting, setIsReposting] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Helper para obter o avatar mais atualizado
  const getAuthorAvatar = (authorId: string, currentAvatar: string) => {
    if (user && user.uid === authorId) {
      if (user.photoURL) return user.photoURL;
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName || 'Thoth'}`;
    }
    if (authorProfile && authorProfile.uid === authorId && authorProfile.photoURL) {
      return authorProfile.photoURL;
    }
    return currentAvatar;
  };

  // Sync internal state with Display Post changes (e.g. if original post likes change)
  useEffect(() => {
    if (user) {
      setIsLiked(displayPost.likedBy?.includes(user.uid) || false);
      const checkBookmark = async () => {
        try {
          const bookmarked = await PostService.isPostBookmarked(user.uid, displayPost.id);
          setIsBookmarked(bookmarked);
        } catch (e) {
          console.error("Error checking bookmark:", e);
        }
      };
      checkBookmark();
    }
    setLikeCount(displayPost.likes || 0);
    setShareCount(displayPost.repostedBy?.length || 0);
  }, [user, displayPost.id, displayPost.likedBy, displayPost.likes, displayPost.repostedBy]);

  const openModal = (idx: number) => {
    setModalData({ images: displayPost.images, index: idx });
  };



  // --- HANDLERS (Update to use displayPost.id for interactions like Like, but post.id for Deleting the repost itself) ---

  // Liking: When liking a Repost, usually you are liking the ORIGINAL content. 
  // Thoth Logic: The 'Post' interface has 'likes'. 
  // If I see a Repost B (of A), and I like it, does B get a like or A?
  // Usually platforms show A's metrics. 
  // Let's assume we interact with the ID of the content being displayed (displayPost.id).
  // If displayPost IS the original (because we swapped it), we are liking the original.

  const handleLike = async () => {
    if (!user) return;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      await PostService.toggleLike(displayPost.id, user.uid, newLikedState);
      if (onLikeToggle) onLikeToggle(displayPost.id, newLikedState);
    } catch (e) {
      console.error("Error toggling like:", e);
      setIsLiked(!newLikedState);
      setLikeCount(prev => !newLikedState ? prev + 1 : prev - 1);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);
    try {
      // Bookmark the content visible (displayPost)
      await PostService.toggleBookmark(user.uid, displayPost, newBookmarkedState);
      if (onBookmarkToggle) {
        onBookmarkToggle(displayPost.id, newBookmarkedState);
      }
    } catch (e) {
      console.error("Error toggling bookmark:", e);
      setIsBookmarked(!newBookmarkedState);
    }
  };

  // ... (Reposters specific logic needed? Reposting a Repost usually reposts the Original)
  const handleRepost = async () => {
    if (!user || isReposting) return;
    // We always repost the ORIGINAL content, not the repost wrapper
    const contentToRepost = isRepost ? displayPost : post;

    setIsReposting(true);
    try {
      const currentUser = {
        id: user.uid,
        name: user.displayName || 'Estudante',
        username: user.email?.split('@')[0] || 'estudante',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
      };
      await PostService.repost(contentToRepost, currentUser);
      setShareCount(prev => prev + 1);
      toast.success('Publicação repostada com sucesso!');
      if (onRepostSuccess) onRepostSuccess();
    } catch (e) {
      console.error("Error reposting:", e);
      toast.error('Erro ao repostar publicação.');
    } finally {
      setIsReposting(false);
      setIsMenuOpen(false);
    }
  };

  // Deleting: If I am the author of THIS card (post.author), I can delete.
  // If it's a repost, I am deleting the Repost Wrapper (post.id), NOT the original (displayPost.id).
  const handleDelete = async () => {
    if (!user || isDeleting || post.author.id !== user.uid) return;
    if (!window.confirm("Tem certeza que deseja apagar esta publicação? Esta ação é irreversível.")) return;

    setIsDeleting(true);
    try {
      await PostService.deletePost(post.id); // Delete the wrapper
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

  // ... rest of hooks ...

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

  // ... handleAction uses post.id for Hiding/Reporting (the wrapper), but Bookmarking uses displayPost (above).
  const handleAction = async (action: string) => {
    setIsMenuOpen(false);
    switch (action) {
      case 'copy':
        try {
          const link = `${window.location.origin}/post/${displayPost.id}`; // Link to CONTENT
          await navigator.clipboard.writeText(link);
          toast.success('Link copiado para a área de transferência!');
        } catch (err) {
          toast.error('Erro ao copiar link.');
        }
        break;
      case 'report':
        toast.success('Denúncia recebida. Analisaremos o conteúdo em breve.');
        break;
      case 'hide':
        toast.info('Esta publicação não será mais exibida para você.');
        if (onDelete) onDelete(post.id); // Hide THIS card
        break;
      case 'edit':
        // Cannot edit a Repost wrapper content, only delete.
        // If displayPost author is me, maybe I can edit original? 
        // For simplicity: Edit button only if post.active matches user (wrapper edit? Reposts usually don't have body)
        // OR if displayPost.author matches user (edit original).
        // Current logic: handleEdit checks post.author.id. 
        if (post.author.id === user?.uid && !isRepost) handleEdit();
        break;
      case 'bookmark':
        handleBookmark();
        break;
      default:
        console.log(`Action ${action} not implemented`);
    }
  };

  // State for edit modal (Original Post Only for now)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = async () => {
    if (post.author.id !== user?.uid) return;
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };

  // Format Timestamp
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    let date: Date;
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleHashtagClick = (tag: string) => {
    navigate(`/explorar?q=${encodeURIComponent('#' + tag)}`);
  };

  // Render Helpers use 'displayPost' instead of 'post'
  const hasImages = (displayPost.images?.length || 0) > 0;
  const safeContent = displayPost.content || "";

  // ... renderCollage, renderLinkAttachment, renderFileAttachment need to be updated to use displayPost inside them or pass post as arg
  // Since they are defined inside component closure and capture 'post', we need to redefine them or make them use displayPost.
  // Ideally, re-write them to use 'displayPost'.

  // To avoid massive rewrite of render functions in this block, I will alias post -> displayPost variable names
  // BUT 'post' is prop. I can't reassign.
  // I will have to update the render functions references.

  const renderCollage = () => {
    const imgCount = displayPost.images?.length || 0;
    if (imgCount === 0) return null;
    const typeConfig = getPostTypeConfig(displayPost.postType);
    const containerHeight = 'h-full';

    // ... Copy implementation but use displayPost ...
    const Wrapper = ({ children, onClick }: any) => (
      <div className="relative w-full h-full cursor-pointer overflow-hidden group transition-all duration-300" onClick={onClick}>
        {children}
      </div>
    );

    if (imgCount === 1) {
      return (
        <Wrapper onClick={() => openModal(0)}>
          <img src={displayPost.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt="Publicação" />
          <div className="absolute top-3 left-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${typeConfig.bg} ${typeConfig.border} border backdrop-blur-sm shadow-sm`}>
              {React.createElement(typeConfig.icon, { size: 12, className: typeConfig.color })}
              <span className={`text-[9px] font-black uppercase tracking-tighter ${typeConfig.color}`}>{typeConfig.label}</span>
            </div>
          </div>
        </Wrapper>
      );
    }
    // ... Implement 2, 3, 4, 5+ logic same as before but using displayPost.images ...
    if (imgCount === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 w-full h-full">
          {displayPost.images.slice(0, 2).map((img, idx) => (
            <Wrapper key={idx} onClick={() => openModal(idx)}>
              <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Img ${idx}`} />
            </Wrapper>
          ))}
        </div>
      );
    }

    if (imgCount === 3) {
      return (
        <div className={`grid grid-cols-3 gap-2 mb-4 ${containerHeight} overflow-hidden rounded-2xl flex-shrink-0 relative transition-all duration-300`}>
          <div className="col-span-2 relative h-full cursor-pointer overflow-hidden group" onClick={() => openModal(0)}>
            <img src={displayPost.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Principal" />
          </div>
          <div className="grid grid-rows-2 gap-2 h-full">
            {displayPost.images.slice(1, 3).map((img, idx) => (
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
            <img src={displayPost.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Principal" />
          </div>
          <div className="h-1/3 grid grid-cols-3 gap-2">
            {displayPost.images.slice(1, 4).map((img, idx) => (
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
          <img src={displayPost.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Principal" />
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
          {displayPost.images.slice(1, 5).map((img, idx) => (
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
    if (!displayPost.externalLink) return null;
    return (
      <a href={displayPost.externalLink.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-xl border-2 border-blue-100 bg-gradient-to-r from-blue-50/60 to-blue-50/30 mb-3 hover:bg-blue-50 transition-all duration-300 group" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 border border-blue-100 group-hover:scale-105 transition-transform"><Globe size={16} className="text-blue-500" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Recurso Externo</span><ExternalLink size={10} className="text-blue-400" /></div>
          <h5 className="text-[12px] font-bold text-slate-900 truncate leading-tight mb-1">{displayPost.externalLink.title}</h5>
          <p className="text-[10px] text-blue-500 truncate font-medium">{displayPost.externalLink.url.replace('https://', '').replace('http://', '').split('/')[0]}</p>
        </div>
      </a>
    );
  };

  const renderFileAttachment = () => {
    if (!displayPost.attachmentFile) return null;
    return (
      <div className="flex items-start gap-3 p-3 rounded-xl border-2 border-[#006c55]/10 bg-gradient-to-r from-[#006c55]/5 to-[#006c55]/3 mb-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 border border-[#006c55]/10"><Paperclip size={16} className="text-[#006c55]" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-[#006c55] uppercase tracking-wider">Arquivo Anexado</span>
            <a href={displayPost.attachmentFile.url} download className="p-1.5 text-slate-400 hover:text-[#006c55] transition-colors" onClick={(e) => e.stopPropagation()}><Download size={12} /></a>
          </div>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1"><h5 className="text-[12px] font-bold text-slate-900 truncate leading-tight">{displayPost.attachmentFile.name}</h5><span className="text-[10px] text-[#006c55] font-black uppercase tracking-wider">{displayPost.attachmentFile.size}</span></div>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-[#006c55]/10 flex-shrink-0 ml-2"><FileText size={14} className="text-[#006c55]" /></div>
          </div>
        </div>
      </div>
    );
  };

  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current && !isExpanded) {
      const el = textRef.current;
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }
  }, [displayPost.content, isExpanded, displayPost.images]);


  const [areTagsExpanded, setAreTagsExpanded] = useState(false);
  const MAX_VISIBLE_TAGS = 5;
  const visibleTags = displayPost.tags ? (areTagsExpanded ? displayPost.tags : displayPost.tags.slice(0, MAX_VISIBLE_TAGS)) : [];
  const remainingTags = (displayPost.tags?.length || 0) - MAX_VISIBLE_TAGS;

  if (isOriginalDeleted) {
    return null;
  }



  return (
    <>
      <div className="flex-shrink-0 w-[350px] h-[500px] flex flex-col bg-gradient-to-br from-white via-white to-white/95 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-6 shadow-lg border border-white/60 dark:border-white/5 snap-center hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* HEADER DE QUEM RECOMPARTILHOU (Só aparece se for repost) e MENU se for repost */}
        {isRepost && (
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Repeat2 size={16} className="text-[#006c55]" />
                <img src={getAuthorAvatar(post.author.id, post.author.avatar)} className="w-6 h-6 rounded-lg object-cover" alt={post.author.name} />
              </div>
              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-black text-slate-700 dark:text-slate-300 truncate">{post.repostedBy && post.repostedBy[0]?.uid === user?.uid ? 'Você' : post.author.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">repostou</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 opacity-80">{formatTimestamp(post.timestamp)}</span>
              </div>
            </div>

            {/* Menu no Repost Header */}
            <div className="relative flex-shrink-0 ml-2" ref={menuRef}>
              <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"><MoreVertical size={16} /></button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                  {/* Se dono do post exibido (no caso de repost, editamos o repost e não original) */}
                  {user?.uid === post.author.id ? (
                    <>
                      <button onClick={() => handleDelete()} className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-colors"><Trash2 size={12} /> Apagar Repost</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleAction('hide')} className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"><EyeOff size={12} /> Não tenho interesse</button>
                      <button onClick={() => handleAction('report')} className="w-full flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-colors"><AlertTriangle size={12} /> Denunciar</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HEADER DO AUTOR PRINCIPAL (Original ou do Post) */}
        <div className="flex items-start justify-between mb-4 flex-shrink-0 relative">
          <div className="flex items-start gap-3 overflow-hidden flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <ClickableAvatar
                userId={displayAuthor.id}
                username={displayAuthor.username}
                photoURL={getAuthorAvatar(displayAuthor.id, displayAuthor.avatar)}
                displayName={displayAuthor.name}
                size="lg"
              />
              {displayAuthor.verified && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#006c55] to-[#00876a] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800"><CheckCircle size={8} className="text-white" fill="white" /></div>}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5 min-w-0">
                <h4
                  className="text-[14px] font-black text-slate-900 dark:text-white leading-tight truncate shrink-1 cursor-pointer hover:text-[#006c55] dark:hover:text-emerald-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileModalOpen(true);
                  }}
                >
                  {displayAuthor.name}
                </h4>
                {displayAuthor.verified && <span className="text-[8px] font-black text-[#006c55] dark:text-emerald-400 bg-[#006c55]/10 dark:bg-emerald-400/10 px-1.5 py-0.5 rounded-md uppercase tracking-tighter flex-shrink-0">V</span>}
              </div>
              <div className="flex flex-col text-[11px] text-slate-500 dark:text-slate-400">
                <span
                  className="font-bold truncate cursor-pointer hover:text-[#006c55] dark:hover:text-emerald-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileModalOpen(true);
                  }}
                >
                  {/* Username Logic: Se for eu, usa meu userProfile.username (live). Se não, usa do post. */}
                  {(() => {
                    const isMe = user?.uid === displayAuthor.id;
                    const rawUsername = isMe ? (userProfile?.username || displayAuthor.username) : displayAuthor.username;
                    const username = rawUsername || 'usuario';
                    const display = username.startsWith('@') ? username : `@${username}`;
                    return display;
                  })()}
                </span>
                {/* Data sempre visível agora - Se for repost, tenta mostrar a data original se disponível no post, senão mostra timestamp do post atual mesmo (fallback) */}
                <div className="flex items-center gap-1 mt-0.5 opacity-70">
                  <Clock size={10} />
                  <span>{(() => {
                    // For reposts, try to use originalTimestamp, otherwise fall back to the post's timestamp
                    const timestampToUse = isRepost
                      ? (post.originalTimestamp || post.timestamp)
                      : post.timestamp;
                    return formatTimestamp(timestampToUse);
                  })()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu de Opções - Só aparece aqui se NÃO for repost. Se for repost, o menu está lá em cima. */}
          {!isRepost && (
            <div className="relative flex-shrink-0 ml-2" ref={menuRef}>
              <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                <MoreVertical size={16} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                  {user?.uid === displayAuthor.id ? (
                    <>
                      <button onClick={() => handleEdit()} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"><Edit3 size={14} /> Editar</button>
                      <button onClick={handleDelete} disabled={isDeleting} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-colors disabled:opacity-50">{isDeleting ? 'Excluindo...' : 'Excluir'}</button>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4"></div>
                      <button onClick={() => handleAction('bookmark')} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"><Bookmark size={14} /> {isBookmarked ? 'Remover' : 'Salvar'}</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleAction('bookmark')} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"><Bookmark size={14} /> {isBookmarked ? 'Remover' : 'Salvar'}</button>
                      <button onClick={() => handleAction('hide')} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"><EyeOff size={14} /> Não tenho interesse</button>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4"></div>
                      <button onClick={() => handleAction('report')} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-left transition-colors"><AlertTriangle size={14} /> Denunciar</button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo Principal Flexível */}
        <div className="flex-1 flex flex-col min-h-0 relative overflow-y-auto no-scrollbar">
          {/* Imagem (flex-1) */}
          {hasImages && (
            <div className="flex-1 min-h-0 w-full rounded-2xl overflow-hidden mb-3 border border-slate-100/50 bg-slate-50 flex-shrink-0">
              {renderCollage()}
            </div>
          )}

          {/* Texto (flex-none, max 5 lines) */}
          {safeContent && (
            <div className={`flex-shrink-0 w-full mb-2`}>
              <div className="relative">
                <p
                  ref={textRef}
                  className={`text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap ${!isExpanded && hasImages ? 'line-clamp-5' : ''}`}
                >
                  {safeContent}
                </p>
                {hasImages && isOverflowing && (
                  <div className={`${isExpanded ? 'mt-1' : 'absolute bottom-0 right-0 bg-transparent'}`}>
                    <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-[11px] font-black text-[#006c55] hover:underline uppercase tracking-tighter bg-white/90 dark:bg-slate-900/90 px-1 rounded-sm backdrop-blur-sm">
                      {isExpanded ? 'Ver menos' : 'ver mais'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {renderLinkAttachment()}
          {renderFileAttachment()}
        </div>

        {/* Hashtags e Rodapé Fixo */}
        <div className="flex-shrink-0">
          {post.tags && post.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mb-3">
            {visibleTags.map(tag => (
              <span
                key={tag}
                onClick={() => handleHashtagClick(tag)}
                className="text-[9px] font-extrabold text-[#006c55] dark:text-emerald-400 bg-gradient-to-r from-[#006c55]/10 to-[#006c55]/5 dark:from-emerald-400/10 dark:to-emerald-400/5 px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all hover:scale-105 cursor-pointer border border-[#006c55]/10 dark:border-white/5 active:bg-[#006c55] active:text-white"
              >
                #{tag}
              </span>
            ))}

            {/* Botão +N */}
            {!areTagsExpanded && remainingTags > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setAreTagsExpanded(true); }}
                className="text-[9px] font-extrabold text-[#006c55] dark:text-emerald-400 px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all hover:scale-105 cursor-pointer border border-[#006c55]/20 hover:bg-[#006c55]/10"
              >
                +{remainingTags}
              </button>
            )}

            {/* Botão Ver menos */}
            {areTagsExpanded && remainingTags > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setAreTagsExpanded(false); }}
                className="text-[9px] font-extrabold text-slate-400 hover:text-[#006c55] px-2 py-1.5 uppercase tracking-wider transition-colors ml-1"
              >
                Ver menos
              </button>
            )}
          </div>}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 dark:border-white/5">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className={`flex items-center gap-1.5 transition-all active:scale-95 ${isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}><Heart size={16} strokeWidth={2.5} fill={isLiked ? "currentColor" : "none"} /><span className="text-[11px] font-bold">{likeCount}</span></button>

              {/* Botão de Repost */}
              {/* Lógica:
                  1. Se for meu card de repost (isRepost && author == me): ESCONDER.
                  2. Se não (Original ou Repost de outro): MOSTRAR.
                  3. Se já repostei: Desabilitar e deixar verde.
              */}
              {!(isRepost && post.author.id === user?.uid) && (
                <button
                  onClick={handleRepost}
                  disabled={isReposting || post.repostedBy?.some(u => u.uid === user?.uid)}
                  className={`flex items-center gap-1.5 transition-all active:scale-95 ${post.repostedBy?.some(u => u.uid === user?.uid)
                    ? 'text-[#006c55] cursor-default' // Já repostado: Verde, sem cursor pointer (se disabled não pegar estilo)
                    : isReposting
                      ? 'opacity-50'
                      : 'text-slate-400 hover:text-[#006c55]'
                    }`}
                >
                  <Repeat2 size={16} strokeWidth={2.5} />
                  {!post.originalPostId && <span className="text-[11px] font-bold">{shareCount}</span>}
                </button>
              )}
            </div>
            <button onClick={handleBookmark} className={`transition-all active:scale-95 ${isBookmarked ? 'text-[#006c55]' : 'text-slate-400 hover:text-[#006c55]'}`}>
              <Bookmark size={16} strokeWidth={2.5} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div >
      {modalData && <ImageModal images={modalData.images} initialIndex={modalData.index} onClose={() => setModalData(null)} />
      }

      {/* Edit Modal */}
      {
        isEditModalOpen && (
          <NewPost
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            mode="edit"
            initialData={post}
            onPostUpdated={() => {
              // Recarregar feed (ou update otimista mais complexo). 
              // O ideal seria passar onPostUpdated como prop para o pai fazer refresh.
              // Para MVP, damos reload simples chamando onRepostSuccess (se ele for refresh)
              // Ou apenas toast.
              toast.success("Publicação atualizada com sucesso!");
              if (onRepostSuccess) onRepostSuccess();
            }}
          />
        )
      }

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        userId={displayAuthor.id}
        username={displayAuthor.username}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default PostCard;
