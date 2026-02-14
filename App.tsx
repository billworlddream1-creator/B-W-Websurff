
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from './store';
import { Category, User, SubscriptionTier, CreditPlan } from './types';
import LinkCard from './components/LinkCard';
import AdCard from './components/AdCard';
import AdminPanel from './components/AdminPanel';
import AnalysisSection from './components/AnalysisSection';
import PaymentModal from './components/PaymentModal';
import CreatorDashboard from './components/CreatorDashboard';

const THEME_COLORS = [
  { primary: '#2563eb', secondary: '#dbeafe' },
  { primary: '#4f46e5', secondary: '#e0e7ff' },
  { primary: '#7c3aed', secondary: '#ede9fe' },
  { primary: '#db2777', secondary: '#fce7f3' },
  { primary: '#e11d48', secondary: '#ffe4e6' },
  { primary: '#ea580c', secondary: '#ffedd5' },
  { primary: '#ca8a04', secondary: '#fef9c3' },
  { primary: '#16a34a', secondary: '#dcfce7' },
  { primary: '#059669', secondary: '#ecfdf5' },
  { primary: '#0891b2', secondary: '#cffafe' },
];

const PROMPT_MESSAGES = [
  "🚀 Free users get limited shuffles. Go Unlimited!",
  "💎 Want your site at the top? Buy your slot now!",
  "🌟 Discover 1,000+ hidden corners of the web.",
  "✨ Upgrade to feature your project to our community!",
  "🔥 Get the Gold badge and unlock priority discovery.",
  "💰 Paid users earn real cash from every click!"
];

const SALUTATIONS = {
  login: [
    "Welcome back, Explorer!",
    "Ready for another journey?",
    "Great to see you again!",
    "Your discovery lab awaits.",
  ],
  signup: [
    "Welcome to the frontier!",
    "Glad you joined the community!",
    "Your journey starts here.",
    "Let's explore the web together!",
  ]
};

const App: React.FC = () => {
  const { 
    sites, ads, currentUser, setCurrentUser, signup, votes, config,
    addVote, registerClick, updateConfig, addSite, deleteSite, 
    updateSite, addAd, updateAd, deleteAd, blockUser, users,
    registerShuffle, processPayment, addUser, deleteUser, updateProfile
  } = useStore();

  const [view, setView] = useState<'home' | 'admin' | 'auth' | 'pricing' | 'stats' | 'referral' | 'creator'>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [randomizedItems, setRandomizedItems] = useState<(any)[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authData, setAuthData] = useState({ username: '', password: '', email: '', referralCode: '' });
  const [selectedPlan, setSelectedPlan] = useState<CreditPlan | null>(null);
  const [promptMsg, setPromptMsg] = useState(PROMPT_MESSAGES[0]);
  const [salutation, setSalutation] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  
  const lastThemeIndex = useRef<number>(-1);

  const applyRandomTheme = useCallback(() => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * THEME_COLORS.length);
    } while (randomIndex === lastThemeIndex.current);
    
    lastThemeIndex.current = randomIndex;
    const randomColor = THEME_COLORS[randomIndex];
    document.documentElement.style.setProperty('--theme-primary', randomColor.primary);
    document.documentElement.style.setProperty('--theme-secondary', randomColor.secondary);
  }, []);

  const shuffle = useCallback(() => {
    const canShuffle = registerShuffle();
    if (!canShuffle) {
      alert("Daily shuffle limit reached! Buy your slot to keep exploring.");
      setView('pricing');
      return;
    }

    setIsShuffling(true);
    
    setTimeout(() => {
      if (view !== 'home' && view !== 'creator' && view !== 'stats') {
        setView('home');
      }

      applyRandomTheme();
      setPromptMsg(PROMPT_MESSAGES[Math.floor(Math.random() * PROMPT_MESSAGES.length)]);

      let filteredSites = sites.filter(s => s.enabled);
      if (selectedCategory !== 'All') {
        filteredSites = filteredSites.filter(s => s.category === selectedCategory);
      }

      // Randomize selection from 1000 sites
      const paidSites = filteredSites.filter(s => s.isPaid).sort(() => 0.5 - Math.random());
      const normalSites = filteredSites.filter(s => !s.isPaid).sort(() => 0.5 - Math.random());
      
      const combined = [...paidSites, ...normalSites].slice(0, config.maxLinksPerPage);
      
      const activeAds = ads.filter(a => a.enabled);
      const result: any[] = [];
      
      combined.forEach((site, index) => {
        result.push({ type: 'site', data: site });
        if ((index + 1) % 8 === 0 && activeAds.length > 0) {
          const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)];
          result.push({ type: 'ad', data: randomAd });
        }
      });

      setRandomizedItems(result);
      setIsShuffling(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }, [sites, ads, selectedCategory, config.maxLinksPerPage, applyRandomTheme, registerShuffle, view]);

  useEffect(() => {
    if (!currentUser || currentUser.subscriptionTier === SubscriptionTier.FREE) return;
    
    const interval = setInterval(() => {
      if (view === 'home' && !isShuffling) shuffle();
    }, 25000);
    return () => clearInterval(interval);
  }, [currentUser, view, shuffle, isShuffling]);

  useEffect(() => {
    if (sites.length > 0 && randomizedItems.length === 0) {
      shuffle();
    }
  }, [sites.length, shuffle, randomizedItems.length]);

  const showSalutation = (type: 'login' | 'signup', name: string) => {
    const randomMsg = SALUTATIONS[type][Math.floor(Math.random() * SALUTATIONS[type].length)];
    setSalutation(`${randomMsg} ${name}`);
    setTimeout(() => setSalutation(null), 5000);
  };

  const handleLogin = () => {
    const user = users.find(u => (u.username === authData.username || u.email === authData.username));
    if (user) {
      if (user.isBlocked) return alert("Account blocked.");
      setCurrentUser(user);
      showSalutation('login', user.username);
      setView('home');
    } else alert("Invalid credentials.");
  };

  const handleSignup = () => {
    if (!config.isSignUpEnabled) return alert("Sign up disabled.");
    const user = signup(authData.username, authData.email, authData.referralCode);
    showSalutation('signup', user.username);
    setView('home');
  };

  const onPaymentSuccess = (siteDetails?: any) => {
    if (selectedPlan) {
      processPayment(selectedPlan);
      if (siteDetails) {
        addSite(siteDetails);
      }
      setSelectedPlan(null);
      setView('creator');
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const userSites = sites.filter(s => s.ownerId === currentUser?.id);

  const NavItem = ({ label, target, icon }: { label: string, target: any, icon: string }) => (
    <button 
      onClick={() => { setView(target); setIsMobileMenuOpen(false); }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
        view === target ? 'theme-bg-soft theme-text' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      <i className={`fa-solid ${icon} text-xs`}></i>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {salutation && (
        <div className="bg-slate-900 text-white text-center py-2 px-4 animate-bounce fixed top-24 left-1/2 -translate-x-1/2 z-[60] rounded-full shadow-2xl border border-white/20 font-bold text-sm">
          {salutation}
        </div>
      )}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        {(!currentUser || currentUser.subscriptionTier === SubscriptionTier.FREE) && (
          <div className="theme-bg text-white text-[10px] font-black py-1 px-4 text-center uppercase tracking-widest overflow-hidden whitespace-nowrap">
            <div className="animate-pulse">
              {promptMsg} — <button onClick={() => setView('pricing')} className="underline decoration-white/50 hover:decoration-white">Upgrade Now</button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setView('home'); shuffle(); }}>
              <div className="w-10 h-10 theme-bg rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12">
                <i className="fa-solid fa-compass text-xl"></i>
              </div>
              <span className="text-xl font-black tracking-tighter theme-text hidden sm:block">WebSurff</span>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              <NavItem label="Discovery" target="home" icon="fa-house" />
              <NavItem label="Leaderboard" target="stats" icon="fa-chart-line" />
              <NavItem label="Buy Your Slot" target="pricing" icon="fa-gem" />
              <NavItem label="Creator Hub" target="creator" icon="fa-wallet" />
              <NavItem label="Refer & Earn" target="referral" icon="fa-user-plus" />
              {isAdmin && <NavItem label="Admin" target="admin" icon="fa-unlock-keyhole" />}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {view === 'home' && (
              <button 
                onClick={shuffle}
                disabled={isShuffling}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 theme-bg text-white rounded-xl font-bold text-sm shadow-lg hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
              >
                <i className={`fa-solid ${isShuffling ? 'fa-spinner fa-spin' : 'fa-shuffle'}`}></i>
                {isShuffling ? 'Exploring...' : 'Surprise Me'}
              </button>
            )}

            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

            {currentUser ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end leading-none cursor-pointer" onClick={() => setView('creator')}>
                  <span className="text-sm font-black text-slate-900">{currentUser.displayName || currentUser.username}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] theme-text font-black uppercase tracking-tighter">${(currentUser.balance || 0).toFixed(2)}</span>
                    <span className="text-[10px] text-slate-300 font-bold">•</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{currentUser.credits} Pts</span>
                  </div>
                </div>
                <button onClick={() => { setCurrentUser(null); setView('home'); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <button onClick={() => setView('auth')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md">
                Sign In
              </button>
            )}

            <button 
              className="lg:hidden p-2 text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 p-4 space-y-2 animate-in slide-in-from-top duration-300">
            <NavItem label="Discovery" target="home" icon="fa-house" />
            <NavItem label="Leaderboard" target="stats" icon="fa-chart-line" />
            <NavItem label="Buy Your Slot" target="pricing" icon="fa-gem" />
            <NavItem label="Creator Hub" target="creator" icon="fa-wallet" />
            <NavItem label="Refer & Earn" target="referral" icon="fa-user-plus" />
            {isAdmin && <NavItem label="Admin" target="admin" icon="fa-unlock-keyhole" />}
            <div className="pt-2 border-t border-slate-50">
              <button 
                onClick={shuffle}
                disabled={isShuffling}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 theme-bg text-white rounded-xl font-bold text-sm shadow-md"
              >
                <i className={`fa-solid ${isShuffling ? 'fa-spinner fa-spin' : 'fa-shuffle'}`}></i>
                Shuffle Sites
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 relative">
        {view === 'home' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className={isShuffling ? 'opacity-50 transition-opacity' : ''}>
                <h1 className="text-4xl font-black text-slate-900 leading-tight">
                  Endless <span className="theme-text">Discovery</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">Explore 1,000+ handpicked resources, randomized just for you.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['All', ...Object.values(Category)].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat as any)} 
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === cat ? 'theme-bg text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-500 ${isShuffling ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
              {randomizedItems.map((item, idx) => (
                item.type === 'site' ? (
                  <LinkCard key={`s-${item.data.id}-${idx}`} site={item.data} currentUser={currentUser} userVote={votes.find(v => v.userId === currentUser?.id && v.linkId === item.data.id)} onVote={addVote} onClick={registerClick} />
                ) : (
                  <AdCard key={`a-${item.data.id}-${idx}`} ad={item.data} onAdClick={() => {}} onAdImpression={() => {}} />
                )
              ))}
            </div>

            <div className="mt-16 text-center">
              <button 
                onClick={shuffle} 
                disabled={isShuffling}
                className="group px-12 py-5 theme-bg text-white rounded-2xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto disabled:opacity-50"
              >
                <i className={`fa-solid ${isShuffling ? 'fa-spinner fa-spin' : 'fa-rotate-right group-hover:rotate-180'} transition-transform duration-500`}></i>
                {isShuffling ? 'EXPLORING THE WEB...' : 'EXPLORE MORE'}
              </button>
              <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">1,000+ Potential Destintations</p>
            </div>
          </div>
        )}

        {view === 'creator' && currentUser && (
          <CreatorDashboard user={currentUser} onUpdate={updateProfile} userSites={userSites} />
        )}
        
        {view === 'creator' && !currentUser && (
          <div className="max-w-md mx-auto py-20 text-center">
            <i className="fa-solid fa-lock text-6xl text-slate-200 mb-6"></i>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Creator Hub</h2>
            <p className="text-slate-500 mb-8 font-medium">Sign in to access your wallet, manage your site listings, and track your earnings.</p>
            <button onClick={() => setView('auth')} className="px-8 py-4 theme-bg text-white rounded-2xl font-black shadow-xl">
              Sign In to Hub
            </button>
          </div>
        )}

        {view === 'referral' && (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-slate-900 mb-4">Refer & <span className="theme-text">Earn Slots</span></h2>
              <p className="text-slate-500 font-medium text-lg">Invite your friends. For every 10 referrals, you get 1 extra promoted slot and 50 points!</p>
            </div>

            {currentUser ? (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Your Referral Code</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-4xl font-black theme-text font-mono tracking-widest bg-slate-50 px-6 py-3 rounded-2xl border border-dashed border-slate-300">
                      {currentUser.referralCode}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(currentUser.referralCode);
                        alert("Referral code copied!");
                      }}
                      className="p-4 theme-bg-soft theme-text rounded-2xl hover:scale-110 transition-transform"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-50 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Total Referrals</p>
                    <p className="text-3xl font-black text-slate-900">{currentUser.referredCount}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-50 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Extra Slots Earned</p>
                    <p className="text-3xl font-black theme-text">{currentUser.extraSlots}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-50 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Next Milestone</p>
                    <p className="text-3xl font-black text-slate-400">{(Math.floor(currentUser.referredCount / 10) + 1) * 10}</p>
                  </div>
                </div>

                <div className="bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div 
                    className="theme-bg h-full transition-all duration-1000"
                    style={{ width: `${(currentUser.referredCount % 10) * 10}%` }}
                  ></div>
                </div>
                <p className="text-center text-xs font-bold text-slate-500">{10 - (currentUser.referredCount % 10)} more referrals needed for your next slot!</p>
              </div>
            ) : (
              <div className="text-center bg-white p-12 rounded-3xl shadow-xl">
                <p className="text-lg font-bold text-slate-600 mb-6">You need to be logged in to participate in the referral program.</p>
                <button onClick={() => setView('auth')} className="px-8 py-4 theme-bg text-white rounded-2xl font-black">Login to Start Earning</button>
              </div>
            )}
          </div>
        )}

        {(view === 'home' || view === 'stats') && <AnalysisSection sites={sites} />}

        {view === 'pricing' && (
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Buy Your <span className="theme-text">Slot</span></h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">Support the platform and get premium features, including site listings and unlimited discovery.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {config.plans.map(plan => (
                <div key={plan.id} className={`bg-white rounded-3xl p-10 border-4 transition-all hover:scale-[1.02] flex flex-col ${currentUser?.subscriptionTier === plan.tier ? 'theme-border shadow-2xl scale-105 z-10' : 'border-slate-100 shadow-sm opacity-90 hover:opacity-100'}`}>
                  <div className="mb-8">
                    <span className="theme-bg-soft theme-text px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{plan.tier}</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">{plan.name}</h3>
                    <p className="text-5xl font-black text-slate-900 mt-4">${plan.price}<span className="text-base text-slate-400 font-bold">/one-time</span></p>
                  </div>
                  <ul className="space-y-5 mb-10 flex-1">
                    <li className="flex items-center gap-3 text-slate-600 font-bold"><i className="fa-solid fa-check-double theme-text"></i> {plan.credits} Listing Points</li>
                    <li className="flex items-center gap-3 text-slate-600 font-bold"><i className="fa-solid fa-check-double theme-text"></i> {plan.dailyShuffles === 1000 ? 'Unlimited' : `${plan.dailyShuffles} Daily`} Shuffles</li>
                    <li className="flex items-center gap-3 text-slate-600 font-bold"><i className="fa-solid fa-check-double theme-text"></i> Promoted Listing {plan.maxSites > 0 ? `(Max ${plan.maxSites})` : 'N/A'}</li>
                    <li className="flex items-center gap-3 text-slate-600 font-bold"><i className="fa-solid fa-money-bill-trend-up theme-text"></i> Monetize Your Site Clicks</li>
                    <li className="flex items-center gap-3 text-slate-600 font-bold"><i className="fa-solid fa-check-double theme-text"></i> Priority Feature Access</li>
                  </ul>
                  <button 
                    onClick={() => {
                       if (!currentUser) return setView('auth');
                       setSelectedPlan(plan);
                    }}
                    className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${currentUser?.subscriptionTier === plan.tier ? 'bg-slate-100 text-slate-400 cursor-default' : 'theme-bg text-white shadow-xl hover:shadow-2xl'}`}
                  >
                    {currentUser?.subscriptionTier === plan.tier ? 'Active Slot' : 'Secure Slot'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'admin' && isAdmin && (
          <AdminPanel 
            sites={sites} 
            ads={ads} 
            users={users} 
            config={config} 
            currentUser={currentUser}
            onUpdateConfig={updateConfig} 
            onAddSite={addSite} 
            onDeleteSite={deleteSite} 
            onUpdateSite={updateSite} 
            onAddAd={addAd} 
            onUpdateAd={updateAd} 
            onDeleteAd={deleteAd} 
            onBlockUser={blockUser}
            onAddUser={addUser}
            onDeleteUser={deleteUser}
          />
        )}

        {view === 'auth' && (
          <div className="max-w-md mx-auto mt-20 px-4 pb-20">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 theme-bg rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-xl">
                  <i className="fa-solid fa-user-astronaut"></i>
                </div>
                <h2 className="text-3xl font-black text-slate-900">{authMode === 'login' ? 'Login' : 'Create Account'}</h2>
                <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">{authMode === 'login' ? 'Welcome Back' : 'Join the Discovery'}</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Identifier</label>
                  <input placeholder="Username or Email" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[var(--theme-primary)] outline-none transition-all" value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} />
                </div>
                {authMode === 'signup' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email Address</label>
                      <input placeholder="hello@example.com" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[var(--theme-primary)] outline-none transition-all" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Referral Code (Optional)</label>
                      <input placeholder="XYZ123" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[var(--theme-primary)] outline-none transition-all" value={authData.referralCode} onChange={e => setAuthData({...authData, referralCode: e.target.value})} />
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Secret Key</label>
                  <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[var(--theme-primary)] outline-none transition-all" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} />
                </div>
                <button onClick={authMode === 'login' ? handleLogin : handleSignup} className="w-full py-4 theme-bg text-white rounded-xl font-black shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-0 transition-all mt-4">
                  {authMode === 'login' ? 'Access Account' : 'Register Now'}
                </button>
                <div className="pt-6 text-center">
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
                    className="text-xs font-black theme-text hover:underline uppercase tracking-wider"
                  >
                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedPlan && <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} onSuccess={onPaymentSuccess} />}
      
      <footer className="bg-white border-t border-slate-100 py-12 px-8 relative mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 hidden md:block"></div>
          
          <div className="flex-1 text-center">
            <div className="flex justify-center items-center gap-6 mb-4">
              <i className="fa-brands fa-twitter text-slate-300 hover:theme-text cursor-pointer transition-colors"></i>
              <i className="fa-brands fa-github text-slate-300 hover:theme-text cursor-pointer transition-colors"></i>
              <i className="fa-brands fa-discord text-slate-300 hover:theme-text cursor-pointer transition-colors"></i>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
              &copy; 2024 B&W WebSurff • The Ultimate Discovery Lab
            </p>
          </div>

          <div className="flex-1 flex justify-center md:justify-end">
            <a 
              href="https://wa.me/your-number-here" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-2.5 bg-[#25D366] text-white rounded-full font-bold text-xs shadow-xl hover:scale-105 transition-transform active:scale-95"
            >
              <i className="fa-brands fa-whatsapp text-lg"></i>
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
