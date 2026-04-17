import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'creator' | 'client';

export interface SocialLink {
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'website';
  url: string;
  followers?: number;
  engagementRate?: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'video' | 'image' | 'design' | 'link';
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
  username: string;
  avatar?: string;
  photoURL?: string;
  bio: string;
  niche: string;
  skills: Skill[];
  portfolio: PortfolioItem[];
  socialLinks: SocialLink[];
  profileScore: number;
  createdAt: string;
}

export interface GigPackage {
  name: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  features: string[];
}

export interface Gig {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  packages: {
    basic: GigPackage;
    standard: GigPackage;
    premium: GigPackage;
  };
  status: 'active' | 'paused' | 'draft';
  views: number;
  orders: number;
  rating: number;
  createdAt: string;
}

export interface Order {
  id: string;
  gigId: string;
  gigTitle: string;
  creatorId: string;
  clientId: string;
  clientName: string;
  packageType: 'basic' | 'standard' | 'premium';
  amount: number;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  createdAt: string;
  dueDate: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  gigs: Gig[];
  orders: Order[];
  apiKey: string;

  setCurrentUser: (user: User | Partial<User> | null) => void;
  login: (email: string, password: string) => User | null;
  signup: (data: Partial<User> & { password: string }) => User;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  addGig: (gig: Omit<Gig, 'id' | 'views' | 'orders' | 'rating' | 'createdAt'>) => void;
  updateGig: (id: string, updates: Partial<Gig>) => void;
  deleteGig: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  setApiKey: (key: string) => void;
}

const DEMO_USERS: User[] = [
  {
    id: 'creator-1',
    email: 'creator@demo.com',
    password: 'demo123',
    role: 'creator',
    displayName: 'Alex Rivera',
    username: 'alexrivera',
    bio: 'YouTube content strategist & video editor with 5+ years experience. I help creators grow from 0 to 100k subscribers with viral editing & thumbnails.',
    niche: 'YouTube Growth & Video Production',
    skills: [
      { name: 'Video Editing', level: 'expert' },
      { name: 'Thumbnail Design', level: 'expert' },
      { name: 'YouTube SEO', level: 'intermediate' },
      { name: 'Scripting', level: 'intermediate' },
      { name: 'Reels/TikTok Editing', level: 'beginner' },
    ],
    portfolio: [
      { id: 'p1', title: 'Tech Channel Rebrand', description: 'Helped a tech creator go from 1k to 50k in 6 months', url: 'https://youtube.com', type: 'video' },
      { id: 'p2', title: 'Viral Thumbnail Pack', description: '10 custom thumbnails with 8%+ CTR', url: 'https://dribbble.com', type: 'image' },
    ],
    socialLinks: [
      { platform: 'youtube', url: 'https://youtube.com/@alexrivera', followers: 12400, engagementRate: 6.2 },
      { platform: 'instagram', url: 'https://instagram.com/alexrivera', followers: 5800, engagementRate: 4.1 },
      { platform: 'tiktok', url: 'https://tiktok.com/@alexrivera', followers: 22000, engagementRate: 8.5 },
    ],
    profileScore: 78,
    createdAt: '2024-01-15',
  },
  {
    id: 'client-1',
    email: 'client@demo.com',
    password: 'demo123',
    role: 'client',
    displayName: 'Sarah Chen',
    username: 'sarahchen',
    bio: 'Fitness influencer looking for content editing support.',
    niche: 'Fitness & Wellness',
    skills: [],
    portfolio: [],
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/sarahchen', followers: 45000, engagementRate: 7.3 },
    ],
    profileScore: 55,
    createdAt: '2024-02-20',
  },
];

const DEMO_GIGS: Gig[] = [
  {
    id: 'gig-1',
    creatorId: 'creator-1',
    title: 'I will edit your YouTube video like MrBeast & Markiplier',
    description: 'Professional YouTube video editing with dynamic cuts, motion graphics, sound design, and color grading. I specialize in high-energy, retention-optimized edits.',
    category: 'Video Editing',
    tags: ['youtube', 'video editing', 'motion graphics', 'color grading', 'retention'],
    packages: {
      basic: { name: 'Basic', description: '5min video edit', price: 49, deliveryDays: 3, revisions: 2, features: ['HD Export', 'Basic Color', 'Subtitles'] },
      standard: { name: 'Standard', description: '15min video with graphics', price: 149, deliveryDays: 5, revisions: 3, features: ['4K Export', 'Color Grading', 'Motion Graphics', 'Sound Design'] },
      premium: { name: 'Premium', description: 'Full production 30min+', price: 299, deliveryDays: 7, revisions: 5, features: ['4K Export', 'Full Color Grade', 'Advanced Motion', 'Thumbnail Included', 'Priority Support'] },
    },
    status: 'active',
    views: 1247,
    orders: 23,
    rating: 4.9,
    createdAt: '2024-01-20',
  },
  {
    id: 'gig-2',
    creatorId: 'creator-1',
    title: 'I will design viral YouTube thumbnails that get 10% CTR',
    description: 'Eye-catching thumbnails designed with A/B testing principles. I analyze your niche, competitors, and psychology to create thumbnails that compel clicks.',
    category: 'Thumbnail Design',
    tags: ['thumbnail', 'youtube', 'design', 'ctr', 'canva', 'photoshop'],
    packages: {
      basic: { name: 'Basic', description: '1 thumbnail', price: 25, deliveryDays: 1, revisions: 2, features: ['HD Resolution', 'One Concept', 'Source File'] },
      standard: { name: 'Standard', description: '3 thumbnails + variations', price: 65, deliveryDays: 2, revisions: 3, features: ['4K Resolution', '3 Thumbnails', 'A/B Variation', 'Source Files'] },
      premium: { name: 'Premium', description: '10 thumbnails pack', price: 199, deliveryDays: 5, revisions: 5, features: ['4K Resolution', '10 Thumbnails', 'A/B Variations', 'Source Files', 'Analytics Consultation'] },
    },
    status: 'active',
    views: 892,
    orders: 41,
    rating: 5.0,
    createdAt: '2024-02-01',
  },
];

const DEMO_ORDERS: Order[] = [
  {
    id: 'order-1',
    gigId: 'gig-1',
    gigTitle: 'I will edit your YouTube video like MrBeast & Markiplier',
    creatorId: 'creator-1',
    clientId: 'client-1',
    clientName: 'Sarah Chen',
    packageType: 'standard',
    amount: 149,
    status: 'in_progress',
    createdAt: '2024-04-10',
    dueDate: '2024-04-15',
  },
  {
    id: 'order-2',
    gigId: 'gig-2',
    gigTitle: 'I will design viral YouTube thumbnails',
    creatorId: 'creator-1',
    clientId: 'client-1',
    clientName: 'Sarah Chen',
    packageType: 'premium',
    amount: 199,
    status: 'completed',
    createdAt: '2024-03-28',
    dueDate: '2024-04-02',
  },
  {
    id: 'order-3',
    gigId: 'gig-1',
    gigTitle: 'I will edit your YouTube video like MrBeast',
    creatorId: 'creator-1',
    clientId: 'u-2',
    clientName: 'Jake Morrison',
    packageType: 'basic',
    amount: 49,
    status: 'pending',
    createdAt: '2024-04-14',
    dueDate: '2024-04-17',
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: DEMO_USERS,
      gigs: DEMO_GIGS,
      orders: DEMO_ORDERS,
      apiKey: '',

      setCurrentUser: (user: User | Partial<User> | null) => set({ currentUser: user as User | null }),

      login(email, password) {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (user) set({ currentUser: user });
        return user || null;
      },

      signup(data) {
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: data.email!,
          password: data.password,
          role: data.role || 'creator',
          displayName: data.displayName || '',
          username: data.username || data.email!.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase(),
          bio: data.bio || '',
          niche: data.niche || '',
          skills: [],
          portfolio: [],
          socialLinks: [],
          profileScore: 20,
          createdAt: new Date().toISOString().split('T')[0],
        };
        set(s => ({ users: [...s.users, newUser], currentUser: newUser }));
        return newUser;
      },

      logout() { set({ currentUser: null }); },

      updateProfile(updates) {
        set(s => {
          if (!s.currentUser) return s;
          const updated = { ...s.currentUser, ...updates };
          return {
            currentUser: updated,
            users: s.users.map(u => u.id === updated.id ? updated : u),
          };
        });
      },

      addGig(gigData) {
        const newGig: Gig = {
          ...gigData,
          id: `gig-${Date.now()}`,
          views: 0,
          orders: 0,
          rating: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
        set(s => ({ gigs: [...s.gigs, newGig] }));
      },

      updateGig(id, updates) {
        set(s => ({ gigs: s.gigs.map(g => g.id === id ? { ...g, ...updates } : g) }));
      },

      deleteGig(id) {
        set(s => ({ gigs: s.gigs.filter(g => g.id !== id) }));
      },

      addOrder(order) {
        set(s => ({ orders: [...s.orders, order] }));
      },

      updateOrderStatus(id, status) {
        set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, status } : o) }));
      },

      setApiKey(key) { set({ apiKey: key }); },
    }),
    {
      name: 'facet-store',
      partialize: s => ({
        currentUser: s.currentUser,
        users: s.users,
        gigs: s.gigs,
        orders: s.orders,
        apiKey: s.apiKey,
      }),
    }
  )
);
