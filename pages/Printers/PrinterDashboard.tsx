import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Printer,
  Clock,
  CheckCircle2,
  Loader2,
  FileText,
  MoreVertical,
  ChevronLeft,
  Search,
  ShieldCheck,
  QrCode,
  LogOut,
  X,
  Plus,
  Play,
  Users,
  Send,
  Download,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Settings2,
  Lock,
  Calendar,
  Zap,
  AlertCircle,
  BarChart3,
  Package,
  Tag,
  Edit2,
  Trash2,
  Bell,
  MessageSquare,
  UserPlus,
  CreditCard,
  Layers,
  Filter,
  CheckCircle,
  Info,
  Upload,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  PieChart,
  TrendingDown,
  Target,
  RefreshCw,
  Shield,
  Key,
  Smartphone,
  Scan,
  Receipt,
  FileCheck,
  FileSearch,
  FileBarChart,
  FileText as FilePdf,
  FileImage,
  FolderOpen,
  Inbox,
  Headphones,
  Mic,
  Volume2,
  Tv,
  Camera,
  Film,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  BookOpen,
  Bookmark,
  Clipboard,
  ListChecks,
  CheckSquare,
  Power,
  Cloud,
  Database,
  Server,
  Cpu,
  HardDrive,
  Paintbrush,
  Type,
  LayoutGrid,
  Menu,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Move,
  Crop,
  Grid3x3,
  Columns,
  Table,
  Music,
  Phone,
  Video,
  Droplets,
  Heart,
  Star,
  ShoppingBag,
  ShoppingCart,
  Package2,
  Truck,
  Home,
  Building,
  MapPin,
  Navigation,
  Globe,
  Wifi,
  Battery,
  Bluetooth,
  Radio,
  Tv2,
  Watch,
  Gamepad,
  Keyboard,
  Mouse,
  Headset,
  Speaker,
  Monitor,
  Laptop,
  Smartphone as SmartphoneIcon,
  Tablet,
  Printer as PrinterIcon
} from 'lucide-react';
import { PrintService } from '../../modules/print/print.service';
import { PrintChatService } from '../../modules/print/print-chat.service';
import { PrinterService, PrinterStation } from '../../modules/print/printer.service';
import { PrintRequest, Message, PrintRequestMessage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerPage: number;
  colorPrice: number;
  type: 'document' | 'photo' | 'poster' | 'banner' | 'other';
  minPages: number;
  maxPages: number;
  turnaroundTime: number; // hours
  isActive: boolean;
}

interface ClientChat {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  orderId?: string;
  status: 'online' | 'offline' | 'away';
}

const PrinterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, userProfile, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PrintRequest | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [activeChatTab, setActiveChatTab] = useState<'support' | 'clients'>('support');
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Shop specific states
  const [showSettings, setShowSettings] = useState(false);
  const [showServiceManager, setShowServiceManager] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [stationId, setStationId] = useState<string>('');
  const [currentStation, setCurrentStation] = useState<PrinterStation | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [newService, setNewService] = useState<Partial<ServiceItem>>({
    name: '',
    description: '',
    basePrice: 0,
    pricePerPage: 0,
    colorPrice: 0,
    type: 'document',
    minPages: 1,
    maxPages: 100,
    turnaroundTime: 2,
    isActive: true
  });

  const [clientChats, setClientChats] = useState<ClientChat[]>([
    {
      id: '1',
      clientId: 'user1',
      clientName: 'João Silva',
      clientEmail: 'joao@email.com',
      lastMessage: 'Posso aumentar a gramatura do papel?',
      lastMessageTime: Date.now() - 1000 * 60 * 30,
      unreadCount: 2,
      orderId: 'req1',
      status: 'online'
    },
    {
      id: '2',
      clientId: 'user2',
      clientName: 'Maria Santos',
      clientEmail: 'maria@email.com',
      lastMessage: 'Obrigada pelo trabalho!',
      lastMessageTime: Date.now() - 1000 * 60 * 120,
      unreadCount: 0,
      status: 'offline'
    }
  ]);

  const [activeChat, setActiveChat] = useState<PrintRequest | null>(null);
  const [chatMessages, setChatMessages] = useState<PrintRequestMessage[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [supportMessages, setSupportMessages] = useState<Message[]>([
    { id: 's1', role: 'system', content: 'Terminal conectado via SSL. Estação: GR-THOTH-01', timestamp: Date.now() - 1000 * 60 * 60 },
    { id: 's2', role: 'user', content: 'Olá, detectamos uma instabilidade na fila do Bloco A.', timestamp: Date.now() - 1000 * 60 * 30 },
    { id: 's3', role: 'assistant', content: 'Estamos cientes. O servidor secundário já assumiu o processamento.', timestamp: Date.now() - 1000 * 60 * 20 }
  ]);

  useEffect(() => {
    const savedStationId = localStorage.getItem('thoth_station_id');
    if (!savedStationId) {
      navigate('/printers/login');
      return;
    }
    setStationId(savedStationId);

    const fetchStationAndOrders = async () => {
      let unsubOrders: (() => void) | null = null;

      const unsubStation = PrinterService.subscribeToStations((stations) => {
        const station = stations.find(s => s.stationId === savedStationId);
        if (station) {
          setCurrentStation(station);
          if (!unsubOrders) {
            const isAdmin = userProfile?.role?.toLowerCase() === 'admin';
            unsubOrders = PrintService.subscribeToShopOrders(
              station.stationId,
              station.ownerEmail,
              isAdmin,
              setRequests
            );
          }
        }
      });

      return () => {
        unsubStation();
        if (unsubOrders) (unsubOrders as any)();
      };
    };

    const cleanupPromise = fetchStationAndOrders();

    return () => {
      cleanupPromise.then(cleanup => cleanup());
    };
  }, [navigate, userProfile, loading]);

  // Subscribe to chat messages when a chat is active
  useEffect(() => {
    if (!activeChat) return;
    const unsubMessages = PrintChatService.subscribeToMessages(activeChat.id, setChatMessages);
    return () => unsubMessages();
  }, [activeChat]);

  // Subscribe to unread counts for all requests
  useEffect(() => {
    if (!authUser || requests.length === 0) return;
    const unsubscribers = requests.map(req =>
      PrintChatService.subscribeToUnreadCount(req.id, authUser.uid, (count) => {
        setUnreadCounts(prev => ({ ...prev, [req.id]: count }));
      })
    );
    return () => unsubscribers.forEach(unsub => unsub());
  }, [authUser, requests]);

  const moveRequest = async (id: string, newStatus: PrintRequest['status']) => {
    // Optimistic Update
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

    try {
      await PrintService.updateStatus(id, newStatus);
    } catch (e) {
      console.error("Erro ao mover pedido:", e);
      // Optional: Revert state here if needed
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: PrintRequest['status']) => {
    const id = e.dataTransfer.getData('requestId');
    if (id) await moveRequest(id, targetStatus);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData('requestId', id);
  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    if (activeChat && activeChatTab === 'clients') {
      try {
        await PrintChatService.sendMessage(activeChat.id, chatInput, 'shop');
        setChatInput('');
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
      }
    } else if (activeChatTab === 'support') {
      const msg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: chatInput,
        timestamp: Date.now()
      };
      setSupportMessages(prev => [...prev, msg]);
      setChatInput('');
    }
  };

  const getQueuePosition = (req: PrintRequest): number => {
    if (req.status !== 'pending') return 0;
    return PrintService.calculateQueuePosition(requests, req);
  };

  const filteredRequests = useMemo(() => {
    return requests
      .filter(r =>
        !r.archived && (
          r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        // Priority: Urgent first
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;

        // Timestamp: Oldest first (FIFO)
        return a.timestamp - b.timestamp;
      });
  }, [requests, searchQuery]);

  const stats = useMemo(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const daily = requests.filter(r => {
      const date = new Date(r.timestamp);
      return r.status === 'ready' &&
        date.getDate() === today.getDate() &&
        date.getMonth() === thisMonth &&
        date.getFullYear() === thisYear;
    });

    const monthly = requests.filter(r => {
      const date = new Date(r.timestamp);
      return r.status === 'ready' &&
        date.getMonth() === thisMonth &&
        date.getFullYear() === thisYear;
    });

    const totalRevenue = requests
      .filter(r => r.status === 'ready')
      .reduce((acc, curr) => acc + curr.totalPrice, 0);

    return {
      dailyRevenue: daily.reduce((acc, curr) => acc + curr.totalPrice, 0),
      monthlyRevenue: monthly.reduce((acc, curr) => acc + curr.totalPrice, 0),
      totalRevenue,
      pendingJobs: requests.filter(r => r.status === 'pending').length,
      printingJobs: requests.filter(r => r.status === 'printing').length,
      completedToday: daily.length,
      completedTotal: requests.filter(r => r.status === 'ready').length
    };
  }, [requests]);

  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(now.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyData = last7Days.map(date => {
      const dayRevenue = requests
        .filter(r => {
          const reqDate = new Date(r.timestamp).toISOString().split('T')[0];
          return reqDate === date && r.status === 'ready';
        })
        .reduce((acc, curr) => acc + curr.totalPrice, 0);

      return { date, revenue: dayRevenue };
    });

    const serviceTypes = services.map(service => {
      const serviceRequests = requests.filter(r =>
        (r as any).serviceType === service.id && r.status === 'ready'
      );
      return {
        name: service.name,
        count: serviceRequests.length,
        revenue: serviceRequests.reduce((acc, curr) => acc + curr.totalPrice, 0)
      };
    });

    return {
      dailyData,
      serviceTypes,
      avgOrderValue: stats.completedTotal > 0 ? stats.totalRevenue / stats.completedTotal : 0,
      completionRate: requests.length > 0 ?
        (stats.completedTotal / requests.length) * 100 : 0
    };
  }, [requests, services, stats]);

  const toggleShopStatus = async () => {
    if (!currentStation) return;
    try {
      await PrinterService.updateStation(currentStation.id, { isOpen: !currentStation.isOpen });
    } catch (e) {
      console.error("Erro ao alterar status:", e);
    }
  };

  const updatePricing = async (type: 'pb' | 'color', value: number) => {
    if (!currentStation) return;
    try {
      const newPrices = { ...currentStation.prices, [type]: value };
      await PrinterService.updateStation(currentStation.id, { prices: newPrices });
    } catch (e) {
      console.error("Erro ao alterar preços:", e);
    }
  };

  const addService = async () => {
    if (!newService.name || newService.basePrice === undefined || !currentStation) return;

    const service: ServiceItem = {
      id: Date.now().toString(),
      name: newService.name,
      description: newService.description || '',
      basePrice: newService.basePrice,
      pricePerPage: newService.pricePerPage || 0,
      colorPrice: newService.colorPrice || 0,
      type: newService.type || 'document',
      minPages: newService.minPages || 1,
      maxPages: newService.maxPages || 100,
      turnaroundTime: newService.turnaroundTime || 2,
      isActive: true
    };

    const updatedServices = [...services, service];
    setServices(updatedServices);
    await PrinterService.updateStation(currentStation.id, { services: updatedServices as any });

    setNewService({
      name: '',
      description: '',
      basePrice: 0,
      pricePerPage: 0,
      colorPrice: 0,
      type: 'document',
      minPages: 1,
      maxPages: 100,
      turnaroundTime: 2,
      isActive: true
    });
  };

  const updateService = async (id: string, updates: Partial<ServiceItem>) => {
    if (!currentStation) return;
    const updatedServices = services.map(service =>
      service.id === id ? { ...service, ...updates } : service
    );
    setServices(updatedServices);
    await PrinterService.updateStation(currentStation.id, { services: updatedServices as any });
  };

  const deleteService = async (id: string) => {
    if (!currentStation) return;
    const updatedServices = services.filter(service => service.id !== id);
    setServices(updatedServices);
    await PrinterService.updateStation(currentStation.id, { services: updatedServices as any });
  };

  const openChat = (request: PrintRequest) => {
    setActiveChat(request);
    setActiveChatTab('clients');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col font-sans relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="flex-none h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="px-6 py-4 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <PrinterIcon className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    {currentStation?.name || 'Gráfica'}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Dashboard de Gerenciamento
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar - Moved to Header */}
              <div className="hidden md:block w-64 lg:w-80 relative group mr-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-12 pr-4 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium text-sm"
                />
              </div>

              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <BarChart3 size={20} />
                  <span className="text-sm font-semibold">Analytics</span>
                </button>

                <button
                  onClick={() => setShowServiceManager(!showServiceManager)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  <Plus size={20} />
                  <span className="text-sm font-semibold">Serviços</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* User Info - New Addition */}
                <div className="hidden lg:flex flex-col items-end mr-4">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {authUser?.email}
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#006c55] dark:text-emerald-400 bg-[#006c55]/10 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                    {userProfile?.role?.toLowerCase() === 'admin' ? 'Administrador' : 'Gerente'}
                  </span>
                </div>

                <div className="relative">
                  <Bell size={22} className="text-slate-600 dark:text-slate-400" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </div>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings2 size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Adjusted for Footer */}
      <main className="flex-1 p-6 h-[calc(100vh-104px)] overflow-hidden">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
          {/* Left Column (Stats + Kanban) */}
          <div className="xl:col-span-8 flex flex-col gap-6 h-full overflow-hidden">


            {/* Main Grid Layout */}
            {/* Kanban Section (Remaining Height) */}
            <div className="flex-1 flex flex-col min-h-0">

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {['pending', 'printing', 'ready'].map((status) => (
                  <div
                    key={status}
                    onDragOver={(e) => { allowDrop(e); setDragOverColumn(status); }}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={(e) => { handleDrop(e, status as any); setDragOverColumn(null); }}
                    className="flex flex-col h-full bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl p-2"
                  >
                    <div className="flex items-center justify-between mb-3 px-2 pt-2 flex-none">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${status === 'pending' ? 'bg-amber-500' :
                          status === 'printing' ? 'bg-blue-500' : 'bg-emerald-500'
                          }`} />
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          {status === 'pending' ? 'Pendentes' :
                            status === 'printing' ? 'Imprimindo' : 'Concluídos'}
                        </h3>
                      </div>
                      <span className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                        {filteredRequests.filter(r => r.status === status).length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-1">
                      {/* Dotted Placeholder for Drop Target - Moved to Top */}
                      {dragOverColumn === status && (
                        <div className="h-24 border-2 border-dashed border-emerald-500/50 bg-emerald-500/5 rounded-xl flex items-center justify-center m-2 animate-pulse mb-4">
                          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Soltar Aqui</span>
                        </div>
                      )}

                      {filteredRequests.filter(r => r.status === status).map((req, index) => (
                        <div
                          key={req.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, req.id)}
                          className={`p-3 rounded-xl transition-all cursor-grab active:grabbing group relative bg-white dark:bg-slate-800 ${req.priority === 'urgent'
                            ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900 animate-pulse'
                            : 'border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <FilePdf className="text-slate-400" size={14} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[150px]" title={req.fileName}>
                                  {req.fileName}
                                </h4>
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold truncate">
                                    {req.customerName || 'Cliente sem nome'}
                                  </p>
                                  <p className={`text-[9px] font-bold uppercase tracking-wider ${req.paymentMethod === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {req.paymentMethod === 'paid' ? '• Já Pago' : '• Pagar no Balcão'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded flex-none">
                                R$ {req.totalPrice.toFixed(2)}
                              </span>
                              {status === 'pending' && (
                                <span className="text-[9px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                  #{getQueuePosition(req)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              {req.priority === 'urgent' && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 rounded-lg border border-red-500/20 mr-2">
                                  <div className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                  </div>
                                  <span className="text-[8px] font-black uppercase text-red-500 tracking-wider">Urgente</span>
                                </div>
                              )}
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                                {req.pages} pgs
                              </span>

                              {/* Icons for Request Details */}
                              <div className="flex items-center gap-1.5">
                                {/* Color/BW */}
                                <div className="relative group/icon cursor-help">
                                  <Droplets size={12} className={req.isColor ? "text-cyan-500" : "text-slate-300"} />
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-[9px] rounded opacity-0 group-hover/icon:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {req.isColor ? 'Colorido' : 'Preto & Branco'}
                                  </span>
                                </div>

                                {/* Duplex */}
                                <div className="relative group/icon cursor-help">
                                  <Layers size={12} className={req.isDuplex ? "text-indigo-400" : "text-slate-300"} />
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-[9px] rounded opacity-0 group-hover/icon:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {req.isDuplex ? 'Frente e Verso' : 'Frente Única'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-1.5">
                              {status === 'pending' && (
                                <button
                                  onClick={() => moveRequest(req.id, 'printing')}
                                  className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                  title="Iniciar Impressão"
                                >
                                  <Play size={12} />
                                </button>
                              )}
                              {status === 'printing' && (
                                <button
                                  onClick={() => moveRequest(req.id, 'ready')}
                                  className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                  title="Concluir"
                                >
                                  <CheckCircle2 size={12} />
                                </button>
                              )}
                              {status === 'ready' && (
                                <button
                                  onClick={() => { setSelectedRequest(req); setIsVerifyModalOpen(true); }}
                                  className="p-1.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-black transition-colors"
                                  title="Verificar"
                                >
                                  <ShieldCheck size={12} />
                                </button>
                              )}
                              <a
                                href={req.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-colors"
                                title="Baixar Arquivo"
                              >
                                <Download size={12} />
                              </a>
                              <button
                                onClick={() => openChat(req)}
                                className="p-1.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 transition-colors relative"
                                title="Chat com Cliente"
                              >
                                <MessageSquare size={12} />
                                {unreadCounts[req.id] > 0 && (
                                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                                    {unreadCounts[req.id]}
                                  </span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredRequests.filter(r => r.status === status).length === 0 && !dragOverColumn && (
                        <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center opacity-40 m-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest">Vazio</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section: Chat & History (Fixed Layout) */}
          <div className="xl:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
            {/* Chat Component (Flex Grow) */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col flex-[2] min-h-0">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-4">
                  <button
                    onClick={() => setActiveChatTab('support')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeChatTab === 'support' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600' : 'text-slate-500'
                      }`}
                  >
                    Suporte
                  </button>
                  <button
                    onClick={() => setActiveChatTab('clients')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeChatTab === 'clients' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600' : 'text-slate-500'
                      }`}
                  >
                    Clientes
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    {activeChatTab === 'support' ? 'Thoth Support' : activeChat ? `Chat - ${activeChat.customerName}` : 'Atendimento'}
                  </h3>
                  {activeChat && (
                    <button
                      onClick={() => setActiveChat(null)}
                      className="ml-auto p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                {activeChat && activeChatTab === 'clients' ? (
                  /* Aba de Conversa Ativa com Cliente */
                  chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                      <MessageSquare size={32} />
                      <span className="text-[10px] font-black uppercase tracking-widest mt-2">Nenhuma mensagem</span>
                    </div>
                  ) : (
                    chatMessages.map(msg => {
                      const isShop = msg.senderRole === 'shop';
                      return (
                        <div key={msg.id} className={`flex ${isShop ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${isShop
                            ? 'bg-emerald-500 text-white rounded-br-none'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none'
                            }`}>
                            <p className="break-words">{msg.text}</p>
                            <span className={`text-[9px] font-bold mt-1 block ${isShop ? 'text-emerald-100' : 'text-slate-400'
                              }`}>
                              {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )
                ) : activeChatTab === 'clients' ? (
                  /* Lista de Pedidos com Chat */
                  requests.filter(r => !r.archived).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                      <Inbox size={32} />
                      <span className="text-[10px] font-black uppercase tracking-widest mt-2">Nenhum pedido</span>
                    </div>
                  ) : (
                    requests.filter(r => !r.archived).map(req => (
                      <button
                        key={req.id}
                        onClick={() => openChat(req)}
                        className="w-full text-left p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group relative"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{req.customerName || 'Cliente'}</span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 group-hover:text-emerald-500 transition-colors">
                          {req.fileName} • {req.pages} pgs
                        </p>
                        {unreadCounts[req.id] > 0 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                            {unreadCounts[req.id]}
                          </span>
                        )}
                      </button>
                    ))
                  )
                ) : (
                  /* Suporte Messages */
                  supportMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'assistant' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none'
                        }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-6 pt-0">
                <div className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    className="w-full h-12 pl-4 pr-12 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="absolute right-2 top-2 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-90"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Section (Flex Init) */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 flex-1 min-h-0 flex flex-col">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-700 pb-2 flex-none">
                Histórico Recente
              </h3>
              <div className="space-y-3 overflow-y-auto no-scrollbar flex-1 pr-1">
                {requests.filter(r => r.status === 'ready').slice(0, 15).map(req => (
                  <div key={req.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                        <CheckCircle2 className="text-emerald-500" size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{req.fileName}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white whitespace-nowrap">R$ {req.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
                {requests.filter(r => r.status === 'ready').length === 0 && (
                  <div className="text-center py-8 opacity-40">
                    <p className="text-[10px] font-black uppercase">Sem atividade</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main >

      {/* Modals & Overlays */}
      {
        showServiceManager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Gestão de Serviços</h2>
                <button onClick={() => setShowServiceManager(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add/Edit Form */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Novo Serviço</h3>
                  <div className="space-y-4">
                    <input
                      type="text" placeholder="Nome do Serviço"
                      className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500"
                      value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })}
                    />
                    <textarea
                      placeholder="Descrição"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 h-24"
                      value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number" placeholder="Preço Base"
                        className="h-12 px-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm"
                        value={newService.basePrice} onChange={e => setNewService({ ...newService, basePrice: parseFloat(e.target.value) })}
                      />
                      <select
                        className="h-12 px-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm"
                        value={newService.type} onChange={e => setNewService({ ...newService, type: e.target.value as any })}
                      >
                        <option value="document">Documento</option>
                        <option value="photo">Foto</option>
                        <option value="poster">Pôster</option>
                      </select>
                    </div>
                    <button
                      onClick={addService}
                      className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Salvar Serviço
                    </button>
                  </div>
                </div>

                {/* Service List */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Serviços Ativos</h3>
                  <div className="space-y-3">
                    {services.map(service => (
                      <div key={service.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-between group border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all shadow-sm">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide truncate">{service.name}</h4>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${service.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                              {service.isActive ? 'Ativo' : 'Off'}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <p className="text-[10px] font-bold text-slate-500">
                              Base: R$ {service.basePrice.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              {/* Color/BW Info */}
                              <div className="relative group/icon cursor-help">
                                {service.colorPrice > 0 ? (
                                  <Droplets size={12} className="text-cyan-500" />
                                ) : (
                                  <Droplets size={12} className="text-slate-400" />
                                )}
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-[9px] rounded opacity-0 group-hover/icon:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  {service.colorPrice > 0 ? `Cor: +R$ ${service.colorPrice.toFixed(2)}` : 'Apenas P&B'}
                                </span>
                              </div>

                              {/* Duplex Info (Symbolic) */}
                              <div className="relative group/icon cursor-help">
                                <Layers size={12} className="text-indigo-400" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-[9px] rounded opacity-0 group-hover/icon:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  Frente e Verso Disponível
                                </span>
                              </div>

                              {/* Type Info */}
                              <div className="relative group/icon cursor-help">
                                <FileText size={12} className="text-emerald-500" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 text-white text-[9px] rounded opacity-0 group-hover/icon:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  Tipo: {service.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteService(service.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all ml-2"
                          title="Remover Serviço"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        showAnalytics && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Relatório de Performance</h2>
                <button onClick={() => setShowAnalytics(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="p-6 bg-emerald-500 text-white rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-80 mb-1">Ticket Médio</p>
                    <p className="text-xl font-black">R$ {analytics.avgOrderValue.toFixed(2)}</p>
                  </div>
                  <div className="p-6 bg-slate-900 text-white rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-80 mb-1">Taxa de Conclusão</p>
                    <p className="text-xl font-black">{analytics.completionRate.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-widest mb-6">Demanda por tipo de serviço</h3>
                  <div className="space-y-6">
                    {analytics.serviceTypes.map(type => (
                      <div key={type.name} className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase">
                          <span>{type.name}</span>
                          <span>{type.count} pedidos</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${(type.count / (stats.completedTotal || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        showSettings && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Configurações</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="p-6 rounded-3xl bg-slate-950 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider mb-1">Status de Operação</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Define se sua gráfica aparece para alunos</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${currentStation?.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  </div>
                  <button
                    onClick={toggleShopStatus}
                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest transition-all ${currentStation?.isOpen ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                  >
                    {currentStation?.isOpen ? 'Suspender Atividades' : 'Abrir Gráfica'}
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Preços Base</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                      <span className="text-[10px] font-black uppercase text-slate-500 block mb-2">Página P&B</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900 dark:text-white">R$</span>
                        <input
                          type="number" step="0.01"
                          value={currentStation?.prices?.pb ?? 0}
                          onChange={(e) => updatePricing('pb', parseFloat(e.target.value))}
                          className="bg-transparent text-lg font-black text-slate-900 dark:text-white focus:outline-none w-full"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                      <span className="text-[10px] font-black uppercase text-slate-500 block mb-2">Página Color</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900 dark:text-white">R$</span>
                        <input
                          type="number" step="0.01"
                          value={currentStation?.prices?.color ?? 0}
                          onChange={(e) => updatePricing('color', parseFloat(e.target.value))}
                          className="bg-transparent text-lg font-black text-slate-900 dark:text-white focus:outline-none w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Clock size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Horário de Pico Estimado</span>
                  </div>
                  <span className="text-xs font-black">12:00 - 15:00</span>
                </div>

                <button
                  onClick={() => { localStorage.removeItem('thoth_station_id'); navigate('/printers/login'); }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest py-4 border-2 border-red-500/10 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <LogOut size={16} /> Sair do Terminal
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        isVerifyModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xl p-4">
            <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsVerifyModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600 mb-6">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 underline decoration-emerald-500 decoration-4">Retirada</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Solicite o token de 4 dígitos para<br />validar a entrega do material.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <input
                    type="text" maxLength={4}
                    value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000"
                    className="w-full h-24 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl text-center text-6xl font-black tracking-[0.5em] text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <button
                  onClick={async () => {
                    if (verifyCode === selectedRequest.pickupCode) {
                      try {
                        await PrintService.toggleArchive(selectedRequest.id, true);
                        setIsVerifyModalOpen(false);
                        setVerifyCode('');
                        alert("Entrega confirmada com sucesso!");
                      } catch (e) {
                        console.error(e);
                      }
                    } else {
                      alert("Token inválido.");
                    }
                  }}
                  className="w-full h-16 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                >
                  Validar e Entregar
                </button>
              </div>
            </div>
          </div>
        )
      }
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-slate-950 border-t border-slate-800 z-50 flex items-center overflow-hidden">
        <div className="flex items-center gap-12 animate-ticker whitespace-nowrap min-w-full pl-6">
          <div className="flex items-center gap-4 text-emerald-500">
            <span className="text-xs font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">+12%</span>
            <span className="text-sm font-black">R$ {stats.dailyRevenue.toFixed(2)}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Receita Hoje</span>
          </div>

          <div className="flex items-center gap-4 text-blue-500">
            <span className="text-xs font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">+8%</span>
            <span className="text-sm font-black">R$ {stats.monthlyRevenue.toFixed(2)}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Receita Mensal</span>
          </div>

          <div className="flex items-center gap-4 text-amber-500">
            <span className="text-xs font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">{stats.pendingJobs}</span>
            <span className="text-sm font-black">{stats.pendingJobs}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Pendentes</span>
          </div>

          <div className="flex items-center gap-4 text-purple-500">
            <span className="text-xs font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">{stats.completedToday}</span>
            <span className="text-sm font-black">{stats.completedToday}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Concluídos Hoje</span>
          </div>

          {/* Duplicate for seamless infinite scroll */}
          <div className="flex items-center gap-4 text-emerald-500">
            <span className="text-xs font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">+12%</span>
            <span className="text-sm font-black">R$ {stats.dailyRevenue.toFixed(2)}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Receita Hoje</span>
          </div>

          <div className="flex items-center gap-4 text-blue-500">
            <span className="text-xs font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">+8%</span>
            <span className="text-sm font-black">R$ {stats.monthlyRevenue.toFixed(2)}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Receita Mensal</span>
          </div>

          <div className="flex items-center gap-4 text-amber-500">
            <span className="text-xs font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">{stats.pendingJobs}</span>
            <span className="text-sm font-black">{stats.pendingJobs}</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Pendentes</span>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div >
  );
};

export default PrinterDashboard;