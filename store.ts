
import { useState, useEffect } from 'react';
import { SiteLink, User, VoteRecord, AdminConfig, Category, Ad, SubscriptionTier, CreditPlan, ActivityLog } from './types';
import { INITIAL_SITES, generateMockLinks, DEFAULT_PLANS } from './constants';

const STORAGE_KEYS = {
  SITES: 'websurfer_sites',
  USERS: 'websurfer_users',
  VOTES: 'websurfer_votes',
  CONFIG: 'websurfer_config',
  CURRENT_USER: 'websurfer_current_user',
  ADS: 'websurfer_ads',
  LOGS: 'websurfer_logs'
};

const PAYOUT_THRESHOLD = 5.00;
const CLICK_REWARD_RATE = 0.00001; // $0.01 per 1000 clicks

const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const useStore = () => {
  const [sites, setSites] = useState<SiteLink[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [config, setConfig] = useState<AdminConfig>({
    maxLinksPerPage: 100,
    randomizationLogic: 'fully-random',
    isSignUpEnabled: true,
    plans: DEFAULT_PLANS
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedSites = localStorage.getItem(STORAGE_KEYS.SITES);
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const storedVotes = localStorage.getItem(STORAGE_KEYS.VOTES);
    const storedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
    const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const storedAds = localStorage.getItem(STORAGE_KEYS.ADS);
    const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);

    if (storedSites) setSites(JSON.parse(storedSites));
    else {
      // Generate exactly 1000 sites (3 initial + 997 mock)
      const initialSeed = [...INITIAL_SITES, ...generateMockLinks(997)];
      setSites(initialSeed);
      localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(initialSeed));
    }

    if (storedAds) setAds(JSON.parse(storedAds));
    if (storedLogs) setLogs(JSON.parse(storedLogs));

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const defaultAdmin: User = {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@websurfer.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
        isBlocked: false,
        credits: 10000,
        subscriptionTier: SubscriptionTier.GOLD,
        shufflesToday: 0,
        lastShuffleDate: new Date().toISOString().split('T')[0],
        referralCode: 'ADMINX',
        referredCount: 0,
        extraSlots: 0,
        balance: 0,
        totalEarnings: 0,
        payoutThreshold: PAYOUT_THRESHOLD
      };
      setUsers([defaultAdmin]);
    }

    if (storedVotes) setVotes(JSON.parse(storedVotes));
    if (storedConfig) setConfig(JSON.parse(storedConfig));
    if (storedCurrentUser) setCurrentUser(JSON.parse(storedCurrentUser));
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites)); }, [sites]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes)); }, [votes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads)); }, [ads]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs)); }, [logs]);

  const logActivity = (userId: string, action: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      action,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev.slice(0, 499)]);
  };

  const registerShuffle = () => {
    if (!currentUser) return true;
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = currentUser.lastShuffleDate !== today;
    const currentShuffles = isNewDay ? 0 : currentUser.shufflesToday;
    
    const userPlan = config.plans.find(p => p.tier === currentUser.subscriptionTier) || DEFAULT_PLANS[0];
    
    if (currentShuffles >= userPlan.dailyShuffles && currentUser.role !== 'admin') {
      return false;
    }

    const updatedUser: User = {
      ...currentUser,
      shufflesToday: currentShuffles + 1,
      lastShuffleDate: today
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    logActivity(currentUser.id, `Shuffled sites (Count: ${currentShuffles + 1})`);
    return true;
  };

  const signup = (username: string, email: string, referralCode?: string) => {
    const referrer = users.find(u => u.referralCode === referralCode?.toUpperCase());
    
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      username,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
      isBlocked: false,
      credits: 0,
      subscriptionTier: SubscriptionTier.FREE,
      shufflesToday: 0,
      lastShuffleDate: new Date().toISOString().split('T')[0],
      referralCode: generateReferralCode(),
      referredCount: 0,
      referredById: referrer?.id,
      extraSlots: 0,
      balance: 0,
      totalEarnings: 0,
      payoutThreshold: PAYOUT_THRESHOLD
    };

    let updatedUsers = [...users, newUser];

    if (referrer) {
      updatedUsers = updatedUsers.map(u => {
        if (u.id === referrer.id) {
          const newReferredCount = u.referredCount + 1;
          const newExtraSlots = Math.floor(newReferredCount / 10);
          return {
            ...u,
            referredCount: newReferredCount,
            extraSlots: newExtraSlots,
            credits: u.credits + (newReferredCount % 10 === 0 ? 50 : 0)
          };
        }
        return u;
      });
      logActivity(referrer.id, `Referred new user: ${username}`);
    }

    setUsers(updatedUsers);
    setCurrentUser(newUser);
    return newUser;
  };

  const registerClick = (linkId: string) => {
    const site = sites.find(s => s.id === linkId);
    if (!site) return;

    setSites(prev => prev.map(s => s.id === linkId ? { ...s, clicks: s.clicks + 1 } : s));

    if (site.ownerId) {
      setUsers(prevUsers => prevUsers.map(user => {
        if (user.id === site.ownerId && user.subscriptionTier !== SubscriptionTier.FREE) {
          const earningAmount = CLICK_REWARD_RATE;
          const updatedUser = {
            ...user,
            balance: (user.balance || 0) + earningAmount,
            totalEarnings: (user.totalEarnings || 0) + earningAmount
          };
          if (currentUser?.id === user.id) {
             setCurrentUser(updatedUser);
          }
          return updatedUser;
        }
        return user;
      }));
    }

    if (currentUser) logActivity(currentUser.id, `Visited site ${linkId}`);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    logActivity(currentUser.id, `Updated profile details`);
  };

  const addUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      username: userData.username || 'User',
      email: userData.email || '',
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      isBlocked: false,
      credits: userData.credits || 0,
      subscriptionTier: userData.subscriptionTier || SubscriptionTier.FREE,
      shufflesToday: 0,
      lastShuffleDate: new Date().toISOString().split('T')[0],
      referralCode: generateReferralCode(),
      referredCount: 0,
      extraSlots: 0,
      balance: 0,
      totalEarnings: 0,
      payoutThreshold: PAYOUT_THRESHOLD
    };
    setUsers(prev => [...prev, newUser]);
    if (currentUser) logActivity(currentUser.id, `Admin added user: ${newUser.username}`);
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setSites(prev => prev.filter(s => s.ownerId !== userId));
    if (currentUser) logActivity(currentUser.id, `Admin deleted user ID: ${userId}`);
  };

  const processPayment = (plan: CreditPlan) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      credits: currentUser.credits + plan.credits,
      subscriptionTier: plan.tier,
      shufflesToday: 0,
      lastShuffleDate: new Date().toISOString().split('T')[0]
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    logActivity(currentUser.id, `Purchased plan: ${plan.name}`);
  };

  const addVote = (linkId: string, type: 'like' | 'dislike') => {
    if (!currentUser) return;
    const existingVote = votes.find(v => v.userId === currentUser.id && v.linkId === linkId);
    if (existingVote) {
       if (existingVote.type === type) return;
       setVotes(prev => prev.map(v => (v.userId === currentUser.id && v.linkId === linkId) ? { ...v, type } : v));
       setSites(prev => prev.map(s => {
         if (s.id === linkId) {
           return {
             ...s,
             likes: type === 'like' ? s.likes + 1 : s.likes - 1,
             dislikes: type === 'dislike' ? s.dislikes + 1 : s.dislikes - 1
           };
         }
         return s;
       }));
    } else {
      setVotes(prev => [...prev, { userId: currentUser.id, linkId, type }]);
      setSites(prev => prev.map(s => {
        if (s.id === linkId) {
          return {
            ...s,
            likes: type === 'like' ? s.likes + 1 : s.likes,
            dislikes: type === 'dislike' ? s.dislikes + 1 : s.dislikes
          };
        }
        return s;
      }));
    }
    logActivity(currentUser.id, `${type}d site ${linkId}`);
  };

  const addSite = (site: Partial<SiteLink>) => {
    const newSite: SiteLink = {
      ...site as SiteLink,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      clicks: 0,
      enabled: true,
      ownerId: currentUser?.id
    };
    setSites(prev => [newSite, ...prev]);
    if (currentUser) {
      logActivity(currentUser.id, `Added new site: ${site.name}`);
    }
  };

  const updateConfig = (newConfig: Partial<AdminConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const updateSite = (updatedSite: SiteLink) => {
    setSites(prev => prev.map(s => s.id === updatedSite.id ? updatedSite : s));
  };

  const deleteSite = (id: string) => {
    setSites(prev => prev.filter(s => s.id !== id));
  };

  const addAd = (ad: any) => {
    const newAd: Ad = { ...ad, id: 'ad-' + Math.random().toString(36).substring(2, 9), clicks: 0, impressions: 0 };
    setAds(prev => [...prev, newAd]);
  };

  const updateAd = (updatedAd: Ad) => {
    setAds(prev => prev.map(ad => ad.id === updatedAd.id ? updatedAd : ad));
  };

  const deleteAd = (id: string) => {
    setAds(prev => prev.filter(ad => ad.id !== id));
  };

  const blockUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
  };

  return {
    sites, ads, users, votes, config, currentUser, logs,
    setCurrentUser, signup, addVote, registerClick, updateConfig, 
    updateSite, deleteSite, addSite, addAd, updateAd, deleteAd, 
    blockUser, registerShuffle, processPayment, addUser, deleteUser, updateProfile
  };
};
