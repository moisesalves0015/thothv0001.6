
/**
 * Author
 * Representa o autor de uma postagem ou conteúdo.
 */
export interface Author {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  university?: string;
  course?: string;
  fullName?: string;
  phoneNumber?: string;
  stats?: {
    followers: number;
    following: number;
    projects: number;
  };
}

/**
 * Post
 * Estrutura de dados de uma postagem no feed.
 * Pode conter texto, imagens, anexos, links e tags.
 */
export interface Post {
  id: string;
  author: Author;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  images: string[];
  externalLink?: {
    url: string;
    title: string;
  };
  attachmentFile?: {
    name: string;
    size: string;
    url: string;
  };
  itemCount?: string;
  tags?: string[];
  postType?: 'general' | 'study' | 'resource' | 'event' | 'question';
  likedBy?: string[]; // Array of UIDs
  repostedBy?: { uid: string; name: string }[];
  originalPostId?: string; // If it's a repost
  originalAuthor?: Author; // Dados do autor original em caso de repost
  originalTimestamp?: string; // Timestamp do post original em caso de repost
}

/**
 * Connection
 * Representa uma conexão ou sugestão de amigo/colega na rede.
 */
export interface Connection {
  id: string;
  name: string;
  role: string;
  avatar: string;
  verified: boolean;
  followers: number;
  projects: number;
}

/**
 * Reminder
 * Representa um lembrete ou tarefa simples para o usuário.
 */
export interface Reminder {
  id: string;
  title: string;
  text: string;
  completed: boolean;
  isHighlighted: boolean;
  isStarred?: boolean;
  type?: 'study' | 'work' | 'personal' | 'exam';
  timestamp: number;
  date?: string;
  time?: string;
}

/**
 * PrintRequest
 * Estrutura para solicitação de impressão no serviço de impressoras (Thoth Print).
 */
export interface PrintRequest {
  id: string;
  fileName: string;
  fileUrl?: string; // URL do arquivo no Firebase Storage
  printerName: string;
  stationId: string; // ID amigável (ex: CAMPUS-01)
  stationOwnerEmail: string; // Email do dono para Security Rules
  pages: string;
  isColor: boolean;
  isDuplex: boolean;
  totalPrice: number;
  status: 'pending' | 'printing' | 'ready' | 'cancelled';
  timestamp: number;
  archived?: boolean;
  pickupCode?: string;
  customerName?: string;
  customerId: string;
  paymentMethod: 'paid' | 'on_pickup';
  priority: 'normal' | 'urgent';
  queuePosition?: number;
}

/**
 * PrintRequestMessage
 * Mensagem de chat entre usuário e gráfica no contexto de um pedido.
 */
export interface PrintRequestMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'shop'; // Identifica quem enviou
  text: string;
  timestamp: number;
  read: boolean;
}

/**
 * PrinterStats
 * Estatísticas para o dashboard de impressoras (receita, trabalhos pendentes etc).
 */
export interface PrinterStats {
  dailyRevenue: number;
  monthlyRevenue: number;
  pendingJobs: number;
  completedToday: number;
}

/**
 * Badge
 * Insígnia ou conquista que pode ser exibida no perfil do usuário.
 */
export interface Badge {
  id: string;
  name: string;
  imageUrl: string;
  width: number; // em tiles (1-4)
  height: number; // em tiles (1-4)
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  createdAt?: any; // Firestore Timestamp
  isPublic?: boolean; // Se outros podem ver/salvar
  tags?: string[]; // Para busca
  usageCount?: number; // Quantas vezes foi salvo
  price?: number; // Legacy field, pode ser removido no futuro
}

/**
 * BadgeSlot
 * Posicionamento de um Badge no grid do perfil.
 */
export interface BadgeSlot {
  badge: Badge;
  x: number;
  y: number;
}

/**
 * SidebarConfig
 * Configuração visual ou comportamental da barra lateral.
 */
export interface SidebarConfig {
  title: string;
  maxPosts?: number;
  userId?: string; // Optional: filter posts by specific user
}

/**
 * Message
 * Representa uma mensagem em um chat (ex: chat com IA).
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  groundingUrls?: { uri: string; title: string }[];
}

export type ChatType = 'direct' | 'group' | 'study' | 'project';
export type MessageType = 'text' | 'image' | 'file' | 'link' | 'assignment' | 'announcement';

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  role?: 'student' | 'teacher' | 'admin';
  online?: boolean;
  email?: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  avatar: string;
  type: ChatType;
  members: string[];
  adminId: string;
  course?: string;
  subject?: string;
  tags?: string[];
  muted?: boolean;
  pinned?: boolean;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number; // Unix timestamp for sorting
  time?: string; // Display time (optional, can be derived)
  date?: string; // Display date (optional, can be derived)
  status: 'sent' | 'delivered' | 'read';
  type: MessageType;
  attachments?: {
    url: string;
    name: string;
    type: string;
    size?: string;
  }[];
  reactions?: { emoji: string; userIds: string[] }[];
  edited?: boolean;
  pinned?: boolean;
  replyToId?: string;
}

/**
 * GeneratedImage
 * Metadados de uma imagem gerada por IA.
 */
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

/**
 * GeneratedVideo
 * Metadados de um vídeo gerado por IA.
 */
export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

/**
 * Transcription
 * Estrutura para transcrição de áudio/voz.
 */
export interface Transcription {
  role: 'user' | 'assistant';
  text: string;
}

/**
 * Event
 * Representa um evento acadêmico ou social na plataforma.
 */
export interface ThothEvent {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'palestra' | 'social' | 'estudo' | 'outro';
  date: any; // Timestamp do Firebase
  location: string;
  creatorId: string;
  participants: string[]; // UIDs confirmados
  interested: string[]; // UIDs interessados
  invited: string[]; // UIDs convidados
  maxParticipants?: number;
  coverImage?: string;
  createdAt: any;
}
