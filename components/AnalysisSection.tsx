
import React from 'react';
import { SiteLink } from '../types';

interface AnalysisSectionProps {
  sites: SiteLink[];
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ sites }) => {
  const mostLiked = [...sites].sort((a, b) => b.likes - a.likes).slice(0, 4);
  const mostVisited = [...sites].sort((a, b) => b.clicks - a.clicks).slice(0, 4);

  return (
    <section className="bg-white border-t border-slate-200 py-12 px-4 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Community Favorites */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 theme-bg-soft theme-text rounded-full flex items-center justify-center">
                <i className="fa-solid fa-heart"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Community Favorites</h2>
            </div>
            <div className="space-y-4">
              {mostLiked.map((site, idx) => (
                <div key={site.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <span className="text-2xl font-black text-slate-200 w-6">0{idx + 1}</span>
                  <img src={site.logo} alt="" className="w-10 h-10 rounded-lg object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm">{site.name}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{site.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold theme-text">{site.likes}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Likes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Now */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-fire"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Trending Now</h2>
            </div>
            <div className="space-y-4">
              {mostVisited.map((site, idx) => (
                <div key={site.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <span className="text-2xl font-black text-slate-200 w-6">0{idx + 1}</span>
                  <img src={site.logo} alt="" className="w-10 h-10 rounded-lg object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm">{site.name}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{site.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-green-600">{site.clicks}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Visits</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalysisSection;
