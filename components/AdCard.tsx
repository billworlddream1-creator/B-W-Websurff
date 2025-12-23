
import React, { useEffect } from 'react';
import { Ad } from '../types';

interface AdCardProps {
  ad: Ad;
  onAdClick: (id: string) => void;
  onAdImpression: (id: string) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onAdClick, onAdImpression }) => {
  useEffect(() => {
    onAdImpression(ad.id);
  }, [ad.id]);

  return (
    <div className="group relative bg-white border-2 border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-xl hover:border-[var(--theme-primary)] transition-all duration-300 transform hover:-translate-y-1">
      <div className="absolute top-4 right-4 z-10">
        <span className="px-2 py-0.5 text-[9px] font-black theme-bg text-white rounded-full uppercase tracking-tighter">
          Sponsored
        </span>
      </div>
      
      <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden mb-4">
        <img 
          src={ad.image} 
          alt={ad.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x250?text=AD'; }}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-black text-slate-900 leading-tight group-hover:theme-text transition-colors">
          {ad.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2">
          {ad.description}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase">{ad.clientName}</span>
        <a 
          href={ad.url} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => onAdClick(ad.id)}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[11px] font-black hover:theme-bg transition-colors"
        >
          Learn More <i className="fa-solid fa-external-link ml-1"></i>
        </a>
      </div>
    </div>
  );
};

export default AdCard;
