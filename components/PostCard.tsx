
import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../types';
import ImageModal from './ImageModal';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalData, setModalData] = useState<{ images: string[], index: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const charLimit = 150;
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

  const renderCollage = () => {
    const imgCount = post.images.length;
    if (imgCount === 0) return null;

    if (imgCount === 1) {
      return (
        <div className="w-full h-64 mb-4 cursor-pointer overflow-hidden rounded-2xl border border-slate-100/50 flex-shrink-0 shadow-inner bg-slate-50" onClick={() => openModal(0)}>
          <img src={post.images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Publicação" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-1.5 mb-4 h-44 overflow-hidden rounded-xl flex-shrink-0">
        <div className="h-full cursor-pointer overflow-hidden" onClick={() => openModal(0)}>
          <img src={post.images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Principal" />
        </div>
        <div className="grid grid-cols-2 gap-1.5 h-full">
          {post.images.slice(1, 5).map((img, idx) => (
            <div key={idx} className="relative h-full cursor-pointer overflow-hidden" onClick={() => openModal(idx + 1)}>
              <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt={`Galeria ${idx}`} />
              {idx === 3 && imgCount > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-white font-bold text-[10px]">+{imgCount - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Card G: Aumentado para 460px de altura */}
      <div className="flex-shrink-0 w-full sm:w-[315px] h-[460px] flex flex-col bg-white/75 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-white/90 snap-center hover:shadow-lg transition-all duration-300 relative overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 h-10 flex-shrink-0 relative">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src={post.author.avatar} className="w-10 h-10 rounded-full object-cover border border-white shadow-sm flex-shrink-0" alt={post.author.name} />
            <div className="flex flex-col min-w-0">
              <h4 className="text-[13px] font-bold text-slate-900 leading-tight truncate">{post.author.name}</h4>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                <span>{post.author.username}</span>
                <span className="text-slate-300">•</span>
                <span>{post.timestamp}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-1.5 rounded-lg transition-all active:scale-90 ${isBookmarked ? 'text-[#006c55] bg-[#006c55]/10' : 'text-slate-300 hover:text-slate-500'}`}
            >
              <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-1.5 rounded-lg transition-all active:scale-90 ${isMenuOpen ? 'text-slate-900 bg-slate-100' : 'text-slate-300 hover:text-slate-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /><circle cx="5" cy="12" r="1.5" /></svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-11 w-48 bg-white/95 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors">Compartilhar</button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 text-left transition-colors">Copiar link</button>
                <div className="h-px bg-slate-100 my-1 mx-4"></div>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-[12px] font-bold text-red-500 hover:bg-red-50 text-left transition-colors">Denunciar</button>
              </div>
            )}
          </div>
        </div>

        {/* Media Collage - Altura Otimizada para h-44 */}
        {renderCollage()}

        {/* Content Area com Link Inline */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
            <p className="text-[13px] text-slate-700 leading-relaxed text-justify sm:text-left mb-3">
              {isExpanded ? post.content : (isLongText ? post.content.substring(0, charLimit) + "..." : post.content)}
              {isLongText && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                  className="inline-block ml-1 text-[11px] font-black text-[#006c55] hover:underline cursor-pointer uppercase tracking-tighter"
                >
                  {isExpanded ? ' Ver menos' : ' Ler mais'}
                </button>
              )}
            </p>

            {/* Attachments rendering */}
            {post.externalLink && (
              <a
                href={post.externalLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50/50 mb-3 hover:bg-blue-50 transition-colors group"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-[11px] font-bold text-slate-900 truncate leading-tight">{post.externalLink.title}</h5>
                  <p className="text-[9px] text-blue-500 truncate font-medium">{post.externalLink.url.replace('https://', '').replace('http://', '')}</p>
                </div>
              </a>
            )}

            {post.attachmentFile && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[#006c55]/10 bg-[#006c55]/5 mb-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 border border-[#006c55]/10">
                  <svg className="w-4 h-4 text-[#006c55]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-[11px] font-bold text-slate-900 truncate leading-tight">{post.attachmentFile.name}</h5>
                  <span className="text-[9px] text-[#006c55] font-black uppercase tracking-widest">{post.attachmentFile.size}</span>
                </div>
                <a
                  href={post.attachmentFile.url}
                  download
                  className="p-1.5 text-slate-400 hover:text-[#006c55] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
              </div>
            )}
          </div>

          {/* Hashtags fixas no rodapé */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t border-slate-100/50 flex-shrink-0">
              {post.tags.slice(0, 5).map(tag => (
                <span key={tag} className="text-[8px] font-extrabold text-[#006c55] bg-[#006c55]/5 px-2 py-1 rounded-md uppercase tracking-wider transition-colors hover:bg-[#006c55]/10">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalData && (
        <ImageModal
          images={modalData.images}
          initialIndex={modalData.index}
          onClose={() => setModalData(null)}
        />
      )}
    </>
  );
};

export default PostCard;
