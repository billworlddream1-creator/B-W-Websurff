import React from 'react';
import { SiteLink, User, VoteRecord } from '../types';

interface LinkCardProps {
  site: SiteLink;
  currentUser: User | null;
  userVote: VoteRecord | undefined;
  onVote: (id: string, type: 'like' | 'dislike') => void;
  onClick: (id: string) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ site, currentUser, userVote, onVote, onClick }) => {
  return (
    <div className="group relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-xl hover:border-[var(--theme-primary)] transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center">
          <img 
            src={site.logo} 
            alt={site.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100?text=?'; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold theme-text truncate transition-colors">
            {site.name}
          </h3>
          <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-500 rounded">
            {site.category}
          </span>
        </div>
      </div>
      
      <p className="mt-3 text-sm text-slate-600 line-clamp-2 min-h-[40px]">
        {site.description}
      </p>

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onVote(site.id, 'like'); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              userVote?.type === 'like' 
                ? 'theme-bg-soft theme-text' 
                : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <i className={`fa-regular fa-thumbs-up ${userVote?.type === 'like' ? 'font-bold' : ''}`}></i>
            <span>{site.likes}</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onVote(site.id, 'dislike'); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              userVote?.type === 'dislike' 
                ? 'bg-red-100 text-red-600' 
                : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <i className={`fa-regular fa-thumbs-down ${userVote?.type === 'dislike' ? 'font-bold' : ''}`}></i>
            <span>{site.dislikes}</span>
          </button>
        </div>

        <a 
          href={site.url} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => onClick(site.id)}
          className="px-3 py-1.5 theme-bg text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-colors"
        >
          Explore <i className="fa-solid fa-arrow-up-right-from-square ml-1"></i>
        </a>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-white/95 via-transparent to-transparent flex flex-col justify-end p-4 rounded-xl">
        <span className="text-[10px] theme-text font-bold tracking-widest uppercase mb-1">Previewing</span>
      </div>
    </div>
  );
};

export default LinkCard;