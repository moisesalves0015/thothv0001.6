
export interface Author {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
}

export interface Post {
  id: string;
  author: Author;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  images: string[];
  itemCount?: string;
  tags?: string[];
}

export interface Connection {
  id: string;
  name: string;
  role: string;
  avatar: string;
  verified: boolean;
  followers: number;
  projects: number;
}

export interface Reminder {
  id: string;
  text: string;
  completed: boolean;
  isHighlighted: boolean;
  timestamp: number;
}

export interface PrintRequest {
  id: string;
  fileName: string;
  printerName: string;
  pages: string;
  isColor: boolean;
  isDuplex: boolean;
  totalPrice: number;
  status: 'pending' | 'printing' | 'ready' | 'cancelled';
  timestamp: number;
  archived?: boolean;
  pickupCode?: string;
  customerName?: string;
}

export interface PrinterStats {
  dailyRevenue: number;
  monthlyRevenue: number;
  pendingJobs: number;
  completedToday: number;
}

export interface Badge {
  id: string;
  name: string;
  imageUrl: string;
  width: number; // em tiles (1-4)
  height: number; // em tiles (1-4)
  creatorId: string;
  price: number;
}

export interface BadgeSlot {
  badge: Badge;
  x: number;
  y: number;
}

export interface SidebarConfig {
  title: string;
  maxPosts?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  groundingUrls?: { uri: string; title: string }[];
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface Transcription {
  role: 'user' | 'assistant';
  text: string;
}
