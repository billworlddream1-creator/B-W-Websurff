
export enum Category {
  SOCIAL = 'Social Media',
  EDUCATION = 'Education',
  TECH = 'Technology',
  BUSINESS = 'Business',
  ENTERTAINMENT = 'Entertainment',
  NEWS = 'News',
  CREATIVE = 'Creative',
  TOOLS = 'Tools',
  AI = 'AI & ML'
}

export enum SubscriptionTier {
  FREE = 'FREE',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD'
}

export interface CreditPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  maxSites: number;
  dailyShuffles: number;
  tier: SubscriptionTier;
}

export interface SiteLink {
  id: string;
  url: string;
  name: string;
  description: string;
  category: Category;
  logo: string;
  likes: number;
  dislikes: number;
  clicks: number;
  createdAt: string;
  enabled: boolean;
  isPaid?: boolean;
  ownerId?: string;
}

export interface Ad {
  id: string;
  clientName: string;
  title: string;
  description: string;
  url: string;
  image: string;
  clicks: number;
  impressions: number;
  cpc: number;
  enabled: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  isBlocked: boolean;
  credits: number;
  subscriptionTier: SubscriptionTier;
  shufflesToday: number;
  lastShuffleDate: string;
}

export interface VoteRecord {
  userId: string;
  linkId: string;
  type: 'like' | 'dislike';
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}

export interface AdminConfig {
  maxLinksPerPage: number;
  randomizationLogic: 'fully-random' | 'category-balanced';
  isSignUpEnabled: boolean;
  plans: CreditPlan[];
}
