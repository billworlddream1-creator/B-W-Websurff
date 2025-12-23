
import { Category, SiteLink, SubscriptionTier, CreditPlan } from './types';

export const DEFAULT_PLANS: CreditPlan[] = [
  {
    id: 'plan-free',
    name: 'Free Starter',
    price: 0,
    credits: 0,
    maxSites: 0,
    dailyShuffles: 7,
    tier: SubscriptionTier.FREE
  },
  {
    id: 'plan-bronze',
    name: 'Bronze Explorer',
    price: 9.99,
    credits: 50,
    maxSites: 1,
    dailyShuffles: 20,
    tier: SubscriptionTier.BRONZE
  },
  {
    id: 'plan-gold',
    name: 'Gold Surfer',
    price: 29.99,
    credits: 200,
    maxSites: 5,
    dailyShuffles: 1000, // Effectively unlimited
    tier: SubscriptionTier.GOLD
  }
];

export const INITIAL_SITES: SiteLink[] = [
  {
    id: '1',
    name: 'Facebook',
    url: 'https://facebook.com',
    description: 'Connect with friends and the world around you.',
    category: Category.SOCIAL,
    logo: 'https://cdn-icons-png.flaticon.com/512/124/124010.png',
    likes: 120,
    dislikes: 15,
    clicks: 450,
    createdAt: new Date().toISOString(),
    enabled: true,
    isPaid: true
  },
  {
    id: '2',
    name: 'Harvard University',
    url: 'https://harvard.edu',
    description: 'The oldest institution of higher learning in the US.',
    category: Category.EDUCATION,
    logo: 'https://cdn-icons-png.flaticon.com/512/3671/3671804.png',
    likes: 240,
    dislikes: 5,
    clicks: 890,
    createdAt: new Date().toISOString(),
    enabled: true,
  },
  {
    id: '3',
    name: 'GitHub',
    url: 'https://github.com',
    description: 'Where the world builds software.',
    category: Category.TECH,
    logo: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
    likes: 500,
    dislikes: 2,
    clicks: 1200,
    createdAt: new Date().toISOString(),
    enabled: true,
    isPaid: true
  }
];

export const generateMockLinks = (count: number): SiteLink[] => {
  const categories = Object.values(Category);
  return Array.from({ length: count }).map((_, i) => {
    const id = (i + 6).toString();
    const cat = categories[Math.floor(Math.random() * categories.length)];
    return {
      id,
      name: `Resource ${id}`,
      url: `https://example.com/site-${id}`,
      description: `Exploring the intersection of ${cat} and modern digital life.`,
      category: cat,
      logo: `https://picsum.photos/seed/${id}/100/100`,
      likes: Math.floor(Math.random() * 100),
      dislikes: Math.floor(Math.random() * 20),
      clicks: Math.floor(Math.random() * 500),
      createdAt: new Date().toISOString(),
      enabled: true,
      isPaid: Math.random() > 0.95
    };
  });
};
