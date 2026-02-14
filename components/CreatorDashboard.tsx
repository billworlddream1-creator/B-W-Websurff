
import React, { useState } from 'react';
import { User, SubscriptionTier, SiteLink } from '../types';

interface CreatorDashboardProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
  userSites: SiteLink[];
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ user, onUpdate, userSites }) => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'profile' | 'performance'>('wallet');
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    profileImage: user.profileImage || '',
    paymentDetails: user.paymentDetails || ''
  });
  const [isRequesting, setIsRequesting] = useState(false);

  const isSubscriber = user.subscriptionTier !== SubscriptionTier.FREE;
  const balance = user.balance || 0;
  const threshold = user.payoutThreshold || 5.00;
  const progress = Math.min((balance / threshold) * 100, 100);
  const canRequestPayout = balance >= threshold;

  const handleSave = () => {
    onUpdate(formData);
    alert("Profile and Payment details updated!");
  };

  const handleRequestPayout = () => {
    if (!user.paymentDetails) {
      alert("Please add your payment details in the Settings tab before requesting a payout.");
      setActiveTab('profile');
      return;
    }
    
    setIsRequesting(true);
    // Simulate API call
    setTimeout(() => {
      alert(`Payout request for $${balance.toFixed(2)} submitted successfully! Our team will process this to your account within 3-5 business days.`);
      setIsRequesting(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 space-y-2">
          <div className="p-6 bg-slate-900 rounded-2xl mb-6 shadow-xl text-center">
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-[var(--theme-primary)] overflow-hidden mb-4 bg-slate-800 flex items-center justify-center">
              {user.profileImage ? (
                <img src={user.profileImage} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <i className="fa-solid fa-user text-3xl text-slate-500"></i>
              )}
            </div>
            <h2 className="text-white font-black truncate px-2">{user.displayName || user.username}</h2>
            <span className="text-[10px] theme-bg-soft theme-text px-2 py-0.5 rounded font-black uppercase mt-2 inline-block">
              {user.subscriptionTier} Tier
            </span>
          </div>

          <nav className="space-y-1">
            <button onClick={() => setActiveTab('wallet')} className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'wallet' ? 'theme-bg text-white shadow-lg' : 'hover:bg-white text-slate-600'}`}>
              <i className="fa-solid fa-wallet"></i> Wallet
            </button>
            <button onClick={() => setActiveTab('performance')} className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'performance' ? 'theme-bg text-white shadow-lg' : 'hover:bg-white text-slate-600'}`}>
              <i className="fa-solid fa-chart-simple"></i> Performance
            </button>
            <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'profile' ? 'theme-bg text-white shadow-lg' : 'hover:bg-white text-slate-600'}`}>
              <i className="fa-solid fa-gear"></i> Settings
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'wallet' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Balance Card */}
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 theme-bg opacity-20 blur-3xl -mr-16 -mt-16"></div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Available Balance</p>
                  <h3 className="text-5xl font-black mb-4">${balance.toFixed(4)}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Rate: $0.01 / 1000 clicks</span>
                  </div>
                </div>

                {/* Status Card / Progress Tracker */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="font-black text-slate-900">Payout Progress</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Goal: ${threshold.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black theme-text">{progress.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div className="relative mb-6">
                    {/* Progress Bar Container */}
                    <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden p-1 shadow-inner border border-slate-50">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 relative ${canRequestPayout ? 'theme-bg animate-pulse' : 'theme-bg opacity-90'}`}
                        style={{ width: `${progress}%` }}
                      >
                        {/* Shimmer effect inside the bar */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] pointer-events-none"></div>
                      </div>
                    </div>
                    
                    {/* Goal Markers */}
                    <div className="flex justify-between mt-2 px-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase">$0</span>
                      <div className="h-2 w-px bg-slate-200"></div>
                      <span className="text-[9px] font-black text-slate-400 uppercase">${threshold.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-medium mb-6">
                    {progress >= 100 
                      ? "Congratulations! You've reached the threshold and can now withdraw your earnings." 
                      : `Keep growing! You are $${(threshold - balance).toFixed(2)} away from your next payout.`
                    }
                  </p>
                  
                  {canRequestPayout && (
                    <button 
                      onClick={handleRequestPayout}
                      disabled={isRequesting}
                      className="w-full py-4 theme-bg text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isRequesting ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fa-solid fa-paper-plane"></i>
                      )}
                      {isRequesting ? 'Processing Request...' : 'Request Payout Now'}
                    </button>
                  )}
                </div>
              </div>

              {!isSubscriber && (
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shrink-0">
                    <i className="fa-solid fa-triangle-exclamation text-xl"></i>
                  </div>
                  <div>
                    <h5 className="font-black text-orange-900">Monetization Disabled</h5>
                    <p className="text-sm text-orange-700">Only paid subscribers can earn from site clicks. <button onClick={() => window.location.hash = '#pricing'} className="font-black underline hover:text-orange-900">Upgrade your plan</button> to start earning today.</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <h4 className="text-xl font-black text-slate-900 mb-6">Payment Configuration</h4>
                <div className="flex items-center gap-4 p-5 border border-slate-100 rounded-2xl bg-slate-50">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <i className="fa-brands fa-paypal text-2xl"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900">Preferred Destination</p>
                    <p className="text-xs text-slate-500 font-medium">{user.paymentDetails || "No payment method configured yet."}</p>
                  </div>
                  <button onClick={() => setActiveTab('profile')} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all shadow-sm">
                    {user.paymentDetails ? 'Update' : 'Configure'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-black text-slate-900">Portfolio Performance</h4>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                    <i className="fa-solid fa-circle text-[8px] text-green-500 animate-pulse"></i>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Live Updates</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {userSites.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                        <i className="fa-solid fa-globe text-3xl"></i>
                      </div>
                      <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No Active Listings</p>
                      <p className="text-xs text-slate-400 mt-1">Upgrade your plan to list your websites here.</p>
                    </div>
                  ) : (
                    userSites.map(site => (
                      <div key={site.id} className="flex flex-wrap md:flex-nowrap items-center justify-between p-5 border border-slate-50 hover:border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group">
                        <div className="flex items-center gap-5 w-full md:w-auto">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 group-hover:scale-105 transition-transform">
                            <img src={site.logo} className="w-full h-full object-cover" alt="" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/100'} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 group-hover:theme-text transition-colors">{site.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{site.category}</span>
                              <span className="text-[8px] text-slate-200">•</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ID: {site.id}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-10 mt-4 md:mt-0 ml-auto md:ml-0">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Clicks</p>
                            <p className="text-lg font-black text-slate-900">{site.clicks.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Generated</p>
                            <p className="text-lg font-black theme-text">${(site.clicks * 0.00001).toFixed(4)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-black text-slate-900">Identity & Settings</h4>
                <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Display Name</label>
                    <input 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)] font-medium text-slate-700 transition-all"
                      value={formData.displayName}
                      onChange={e => setFormData({...formData, displayName: e.target.value})}
                      placeholder="Your Public Creator Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Profile Image URL</label>
                    <input 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)] font-medium text-slate-700 transition-all"
                      value={formData.profileImage}
                      onChange={e => setFormData({...formData, profileImage: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Payout Information (PayPal/Bank)</label>
                    <textarea 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[var(--theme-primary)] h-36 font-medium text-slate-700 resize-none transition-all"
                      value={formData.paymentDetails}
                      onChange={e => setFormData({...formData, paymentDetails: e.target.value})}
                      placeholder="e.g. paypal.me/yourname or your.email@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-400 font-medium italic">All changes are updated across your global discovery lab profile instantly.</p>
                <button 
                  onClick={handleSave}
                  className="px-10 py-4 theme-bg text-white rounded-2xl font-black shadow-xl hover:scale-[1.03] active:scale-95 transition-all whitespace-nowrap"
                >
                  Save Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
