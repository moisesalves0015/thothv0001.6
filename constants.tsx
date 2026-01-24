
import { Post, Connection } from './types';

/**
 * MOCK_POSTS
 * Lista de postagens simuladas para popular o feed inicial durante o desenvolvimento.
 * Cada post contém informações do autor, conteúdo, métricas e imagens.
 */
export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: {
      id: 'a1',
      name: 'Robert Fox',
      username: '@alessandroveronezi',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
      verified: true
    },
    content: 'Embora Corfu nos dê a capacidade de fotografar à beira-mar com fundos azuis incríveis cheios de luz do céu, Florina nos mostra seu lado suave. A atmosfera humilde e a Luz de Florina que vem...',
    timestamp: '15m atrás',
    likes: 1600,
    replies: 2300,
    tags: ['paisagem', 'flora', 'natureza', 'fotografia', 'viagem', 'arte', 'luz'],
    images: [
      'https://picsum.photos/seed/corfu1/600/600',
      'https://picsum.photos/seed/corfu2/300/300',
      'https://picsum.photos/seed/corfu3/300/300',
      'https://picsum.photos/seed/corfu4/300/300',
      'https://picsum.photos/seed/corfu5/300/300',
      'https://picsum.photos/seed/corfu6/300/300'
    ]
  },
  {
    id: '2',
    author: {
      id: 'a2',
      name: 'Dianne Russell',
      username: '@amandadasilva',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dianne',
    },
    content: 'Observando a vida selvagem local no quintal. A natureza é verdadeiramente fascinante quando você olha de perto.',
    timestamp: '1h atrás',
    likes: 856,
    replies: 42,
    tags: ['natureza', 'wildlife'],
    images: [
      'https://picsum.photos/seed/cat/600/400'
    ]
  },
  {
    id: '3',
    author: {
      id: 'a3',
      name: 'Azuki Garden',
      username: '@azuki_official',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Azuki',
      verified: true
    },
    content: 'Nova coleção de arte digital explorando tons pastéis e texturas orgânicas.',
    timestamp: '3h atrás',
    likes: 1200,
    replies: 154,
    tags: ['art', 'nft', 'digital', 'design', 'creative', 'pastel', 'minimalist'],
    images: [
      'https://picsum.photos/seed/azuki1/400/400',
      'https://picsum.photos/seed/azuki2/200/200',
      'https://picsum.photos/seed/azuki3/200/200'
    ]
  },
  {
    id: '4',
    author: {
      id: 'a4',
      name: 'Moisés Silva',
      username: '@moises_dev',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Moisés',
    },
    content: 'Testando a nova interface do Thoth. O sistema de grid está ficando excelente para visualização de portfólios.',
    timestamp: '5h atrás',
    likes: 450,
    replies: 12,
    tags: ['ui', 'ux', 'thoth', 'frontend', 'react', 'tailwind', 'pixels', 'designsystem', 'coding'],
    images: [
      'https://picsum.photos/seed/code/600/600',
      'https://picsum.photos/seed/office/300/300'
    ]
  },
  {
    id: '5',
    author: {
      id: 'a5',
      name: 'Carla Rocha',
      username: '@carla_arch',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carla',
      verified: true
    },
    content: 'Inspiração matinal: a luz filtrada pelas cobogós cria padrões geométricos incríveis no chão da sala.',
    timestamp: '8h atrás',
    likes: 2300,
    replies: 89,
    tags: ['arquitetura', 'luz', 'geometric', 'interior', 'decor', 'morning'],
    images: [
      'https://picsum.photos/seed/arch1/600/600',
      'https://picsum.photos/seed/arch2/300/300',
      'https://picsum.photos/seed/arch3/300/300',
      'https://picsum.photos/seed/arch4/300/300',
      'https://picsum.photos/seed/arch5/300/300'
    ]
  }
];

/**
 * MOCK_CONNECTIONS
 * Lista de conexões/usuários sugeridos simulados.
 * Usado na barra lateral ou páginas de sugestão de conexões.
 */
export const MOCK_CONNECTIONS: Connection[] = [
  {
    id: 'c1',
    name: 'Sophie Bennett',
    role: 'Product Designer who focuses on simplicity & usability.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    verified: true,
    followers: 312,
    projects: 48
  },
  {
    id: 'c2',
    name: 'Marcus Thorne',
    role: 'Senior Motion Designer exploring the limits of digital art.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    verified: true,
    followers: 1240,
    projects: 156
  },
  {
    id: 'c3',
    name: 'Elena Vance',
    role: 'UX Researcher specialized in cognitive psychology and behavior.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    verified: false,
    followers: 890,
    projects: 34
  },
  {
    id: 'c4',
    name: 'Julian Rose',
    role: 'Frontend Architect with a passion for creative coding.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    verified: true,
    followers: 2100,
    projects: 89
  },
  {
    id: 'c5',
    name: 'Amara K.',
    role: '3D Artist focused on hyper-realistic textures and environments.',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400',
    verified: false,
    followers: 420,
    projects: 12
  },
  {
    id: 'c6',
    name: 'Lucas Mendes',
    role: 'Full Stack Developer & Open Source enthusiast.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    verified: true,
    followers: 1560,
    projects: 72
  },
  {
    id: 'c7',
    name: 'Bia Fernandes',
    role: 'Creative Director building meaningful brand experiences.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    verified: true,
    followers: 2840,
    projects: 210
  },
  {
    id: 'c8',
    name: 'Victor Hugo',
    role: 'Mobile Engineer crafting seamless iOS & Android apps.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    verified: false,
    followers: 670,
    projects: 24
  },
  {
    id: 'c9',
    name: 'Clara Oswald',
    role: 'Illustration Artist focused on storytelling and character design.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
    verified: true,
    followers: 4120,
    projects: 342
  },
  {
    id: 'c10',
    name: 'Rafael Lima',
    role: 'Data Scientist turning complex data into actionable insights.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    verified: false,
    followers: 950,
    projects: 18
  },
  {
    id: 'c11',
    name: 'Isabela Soares',
    role: 'Interior Architect creating sustainable and modern spaces.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    verified: true,
    followers: 1890,
    projects: 64
  },
  {
    id: 'c12',
    name: 'Daniel Kim',
    role: 'Product Manager passionate about user-centric growth.',
    avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&q=80&w=400',
    verified: true,
    followers: 1320,
    projects: 41
  }
];
