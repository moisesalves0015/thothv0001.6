import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Printer,
  Upload,
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Info,
  RefreshCw,
  AlertTriangle,
  X,
  CreditCard,
  Droplets,
  Layers,
  Copy as CopyIcon,
  ArrowLeft,
  Check,
  Sparkles,
  Palette,
  FileCheck,
  Wallet,
  Truck,
  Download,
  MessageCircle,
  Send,
  QrCode,
  RotateCcw,
  Loader2,
  AlertCircle,
  Phone,
  MapPin,
  ExternalLink,
  Instagram,
  Zap,
  BookOpen,
  ScanLine
} from 'lucide-react';
import { PrinterService, PrinterStation } from '../../modules/print/printer.service';
import { PrintService } from '../../modules/print/print.service';
import { PrintChatService } from '../../modules/print/print-chat.service';
import { PrintRequest, PrintRequestMessage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';

const ExternalOrderPage: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [station, setStation] = useState<PrinterStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flow State
  const [selectedService, setSelectedService] = useState<'print' | 'bind' | 'digitize' | null>(null);

  // Order States
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pages, setPages] = useState(1);
  const [copies, setCopies] = useState(1);
  const [isColor, setIsColor] = useState(false);
  const [isDuplex, setIsDuplex] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'counter' | 'online'>('counter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);
  const [completedRequest, setCompletedRequest] = useState<PrintRequest | null>(null);
  const [stationQueue, setStationQueue] = useState<PrintRequest[]>([]);
  
  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<PrintRequestMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatMessagesEndRef = React.useRef<HTMLDivElement>(null);

  // New Config States
  const [nUp, setNUp] = useState<1 | 2 | 4>(1);
  const [binding, setBinding] = useState<'none' | 'spiral' | 'thermal' | 'hardcover'>('none');
  const [finishing, setFinishing] = useState<string[]>([]);

  useEffect(() => {
    const fetchStation = async () => {
      if (!stationId) return;
      try {
        const data = await PrinterService.getStationByExternalId(stationId);
        if (data) {
          setStation(data);
        } else {
          setError('Gráfica não encontrada ou inativa.');
        }
      } catch (err) {
        setError('Erro ao carregar dados da gráfica.');
      } finally {
        setLoading(false);
      }
    };
    fetchStation();
  }, [stationId]);

  // Subscribe to station queue when order is complete
  useEffect(() => {
    if (!orderComplete || !station) return;
    const unsub = PrintService.subscribeToStationPendingRequests(station.stationId, setStationQueue);
    return () => unsub();
  }, [orderComplete, station]);

  // Subscribe to chat messages when chat is open
  useEffect(() => {
    if (!orderComplete || !isChatOpen) return;
    const unsub = PrintChatService.subscribeToMessages(orderComplete, setChatMessages);
    return () => unsub();
  }, [orderComplete, isChatOpen]);

  // Auto-scroll chat
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const getQueuePosition = () => {
    if (!completedRequest) return 0;
    return PrintService.calculateQueuePosition(stationQueue, completedRequest);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !orderComplete) return;
    try {
      await PrintChatService.sendMessage(orderComplete, chatInput, 'customer');
      setChatInput('');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar mensagem.');
    }
  };

  const handleDownloadReceipt = () => {
    if (!station || !completedRequest) return;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const thothGreen = [0, 108, 85];
    const darkText = [30, 41, 59];

    // Header
    doc.setFillColor(thothGreen[0], thothGreen[1], thothGreen[2]);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(48);
    doc.text('thoth', 105, 32, { align: 'center', charSpace: 1 });

    // Title
    doc.setTextColor(thothGreen[0], thothGreen[1], thothGreen[2]);
    doc.setFontSize(24);
    doc.text('Comprovante de Pedido', 105, 70, { align: 'center' });

    // Details Box
    const boxX = 25;
    const boxTop = 85;
    const boxWidth = 160;
    const boxHeight = 75;

    doc.setDrawColor(thothGreen[0], thothGreen[1], thothGreen[2]);
    doc.setLineWidth(0.5);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(boxX, boxTop, boxWidth, boxHeight, 3, 3, 'FD');

    const drawRow = (label: string, value: string, y: number) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(thothGreen[0], thothGreen[1], thothGreen[2]);
      doc.text(label, boxX + 15, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(value, boxX + 55, y);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(boxX + 15, y + 2, boxX + boxWidth - 15, y + 2);
    };

    drawRow('Pedido:', `#${completedRequest.id?.slice(-8).toUpperCase()}`, boxTop + 15);
    drawRow('Arquivo:', completedRequest.fileName, boxTop + 25);
    drawRow('Gráfica:', station.name, boxTop + 35);
    drawRow('Valor:', `R$ ${completedRequest.totalPrice.toFixed(2)}`, boxTop + 45);
    drawRow('Data:', new Date(completedRequest.timestamp).toLocaleDateString(), boxTop + 55);
    drawRow('Pagamento:', completedRequest.paymentMethod === 'paid' ? 'Pago Online' : 'No Balcão', boxTop + 65);

    // Footer Box
    const fTop = 200;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(boxX, fTop, boxWidth, 55, 3, 3, 'FD');
    
    doc.setTextColor(thothGreen[0], thothGreen[1], thothGreen[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Retire seu pedido no Thoth Print', boxX + 50, fTop + 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Apresente este comprovante se necessário.', boxX + 50, fTop + 32);

    // Bottom Bar
    doc.setFillColor(thothGreen[0], thothGreen[1], thothGreen[2]);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('thoth creative group', 105, 292, { align: 'center' });

    doc.save(`comprovante_${completedRequest.id?.slice(-8)}.pdf`);
    toast.success('Comprovante baixado!');
  };

  const countPages = async (file: File) => {
    if (file.type !== 'application/pdf') return;
    const loadingToast = toast.loading('Lendo páginas do documento...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const numPages = pdfDoc.getPageCount();
      setPages(numPages);
      toast.dismiss(loadingToast);
      toast.success(`${numPages} páginas detectadas automaticamente!`);
    } catch (err) {
      console.error('Error counting pages:', err);
      toast.dismiss(loadingToast);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 20MB.');
        return;
      }
      setFile(selectedFile);
      countPages(selectedFile);
    }
  };

  const calculatePrice = () => {
    if (!station) return 0;
    const pricePerPage = isColor ? station.prices?.color || 1.00 : station.prices?.pb || 0.15;

    const sheetsUsed = Math.ceil(pages / nUp);
    let baseTotal = sheetsUsed * copies * pricePerPage;

    const bindingPrices = {
      none: 0,
      spiral: 5.00,
      thermal: 12.00,
      hardcover: 25.00
    };
    baseTotal += bindingPrices[binding] * copies;

    if (finishing.includes('stapled')) baseTotal += 0.50 * copies;
    if (finishing.includes('punched')) baseTotal += 0.20 * copies;

    return baseTotal;
  };

  const handleSubmit = async () => {
    if (!file || !station) {
      toast.error('Por favor, selecione um arquivo.');
      return;
    }

    setIsSubmitting(true);
    try {
      setUploading(true);
      const uploadedUrl = await PrintService.uploadFile(file);
      setFileUrl(uploadedUrl);
      setUploading(false);

      const orderData = {
        fileName: file.name,
        fileUrl: uploadedUrl,
        pages,
        copies,
        isColor,
        isDuplex,
        totalPrice: calculatePrice(),
        status: 'pending' as any,
        stationId: station.stationId,
        printerName: station.name,
        stationOwnerEmail: station.ownerEmail,
        paymentMethod: (paymentMethod === 'online' ? 'paid' : 'on_pickup') as 'paid' | 'on_pickup',
        priority: 'normal' as any,
        customerName: user?.displayName || 'Cliente Externo',
        customerId: user?.uid || 'anonymous',
        nUp,
        binding,
        finishing
      };

      const docRef = await PrintService.createRequest(orderData);
      const fullRequest = {
        id: docRef.id,
        ...orderData,
        timestamp: Date.now(),
        archived: false,
        pickupCode: Math.floor(1000 + Math.random() * 9000).toString()
      } as PrintRequest;
      
      setCompletedRequest(fullRequest);
      setOrderComplete(docRef.id);
      toast.success('Pedido enviado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetOrder = () => {
    setFile(null);
    setFileUrl(null);
    setPages(1);
    setCopies(1);
    setIsColor(false);
    setIsDuplex(false);
    setPaymentMethod('counter');
    setOrderComplete(null);
    setNUp(1);
    setBinding('none');
    setFinishing([]);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Loader2 className="w-12 h-12 text-[#006c55] animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Iniciando sistema...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full liquid-glass rounded-[32px] p-8 text-center shadow-2xl">
          <AlertTriangle className="text-amber-500 w-16 h-16 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Acesso Negado</h2>
          <p className="text-sm font-medium text-slate-500 mb-8">{error || 'Esta estação de impressão não está disponível offline.'}</p>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-[#006c55] text-white rounded-2xl font-bold uppercase text-xs tracking-widest">Voltar ao Início</button>
        </motion.div>
      </div>
    );
  }

  const handleWhatsAppClick = () => {
    if (station?.phone) {
      const cleanPhone = station.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-[#006c55]/30">
      {/* Universal Topbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 pt-[env(safe-area-inset-top)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={18} className="text-slate-500" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#006c55] rounded-lg flex items-center justify-center shadow-lg shadow-[#006c55]/20">
                <Printer className="text-white" size={16} />
              </div>
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">Thoth Print</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_auto] gap-6 lg:gap-8 items-start">
          
          {/* No left column — profile is now in right sidebar */}

          {/* Column 1: Main Content (Scrollable) */}
          <div className={`${orderComplete ? 'lg:col-span-12' : 'lg:col-span-8 lg:row-span-2 lg:row-start-1'} space-y-8 order-2 lg:order-1`}>
            {orderComplete ? (
              <div className="flex flex-col items-center justify-center py-10 w-full">
                 <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-2xl w-full"
                >
                  <div className="liquid-glass rounded-[40px] p-10 shadow-2xl mb-8 relative border border-white/40 dark:border-white/10 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500" />
                    
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8"
                      >
                        <CheckCircle2 className="text-emerald-500" size={48} />
                      </motion.div>

                      <div className="space-y-2 mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pedido Confirmado!</h2>
                        <p className="text-sm font-semibold text-[#006c55] uppercase tracking-[0.2em]">Seu arquivo já está na fila de impressão</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-2 font-bold">Lugar na Fila</span>
                          <span className="text-xl font-bold text-emerald-600">
                            {getQueuePosition() > 0 ? `${getQueuePosition()}º lugar` : 'É a sua vez!'}
                          </span>
                        </div>
                        <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-2 font-bold">Previsão</span>
                          <span className="text-xl font-bold text-amber-600 flex items-center justify-center gap-2">
                             <Clock size={20} /> ~5 min
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/40 dark:bg-slate-800/40 rounded-3xl p-8 mb-10 text-left border border-white/20">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-700/50 mb-4">
                          <span className="text-xs font-bold text-slate-400 uppercase">Número do Pedido</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white tracking-wider text-base">#{orderComplete.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase">Valor do Serviço</span>
                          <span className="text-2xl font-bold text-slate-900 dark:text-white">R$ {completedRequest?.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                         <button
                          onClick={handleDownloadReceipt}
                          className="py-3 bg-[#006c55] text-white rounded-2xl font-medium text-[11px] uppercase tracking-[0.15em] hover:bg-[#005a46] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#006c55]/20"
                        >
                          <Download size={15} strokeWidth={1.5} />
                          Baixar Comprovante
                        </button>
                        <button
                          onClick={() => setIsChatOpen(true)}
                          className="py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-medium text-[11px] uppercase tracking-[0.15em] hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          <MessageCircle size={15} strokeWidth={1.5} />
                          Abrir Chat Online
                        </button>
                      </div>
                      
                      <button
                        onClick={resetOrder}
                        className="w-full py-3 text-slate-400 hover:text-[#006c55] font-medium text-[11px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={13} strokeWidth={1.5} /> Realizar Novo Pedido
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-80">
                    <div className="liquid-glass rounded-[24px] p-6 text-slate-700 dark:text-white relative overflow-hidden cursor-pointer border border-white/40">
                      <div className="relative z-10">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#006c55]">Thoth Ads</span>
                        <h3 className="text-sm font-bold mt-1">Plano Premium</h3>
                        <p className="text-[10px] opacity-60 mt-1">Impressões ilimitadas com descontos exclusivos.</p>
                      </div>
                      <Zap className="absolute -right-4 -bottom-4 w-16 h-16 opacity-5" />
                    </div>
                    <div className="liquid-glass rounded-[24px] p-6 text-slate-700 dark:text-white relative overflow-hidden cursor-pointer border border-white/40">
                      <div className="relative z-10">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500">Reward</span>
                        <h3 className="text-sm font-bold mt-1">Indique Amigos</h3>
                        <p className="text-[10px] opacity-60 mt-1">Ganhe cashback para sua próxima impressão.</p>
                      </div>
                      <Truck className="absolute -right-4 -bottom-4 w-16 h-16 opacity-5" />
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Step Selector: Services */}
                <section className="space-y-5">
                  <AnimatePresence mode="popLayout">
                    {!selectedService && (
                      <motion.div
                        key="service-header"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col"
                      >
                        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">O que deseja fazer hoje?</h3>
                        <p className="text-xs font-normal text-slate-400 mt-1">Selecione o serviço para sua estação {station.name}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    {[
                      { id: 'print', icon: Printer, label: 'Impressão Simples', desc: 'Rápido e prático' },
                      { id: 'bind', icon: BookOpen, label: 'Encadernação', desc: 'Acabamento profissional' },
                      { id: 'digitize', icon: ScanLine, label: 'Digitalização', desc: 'Direto para seu email' }
                    ].map((svc) => {
                      const isSelected = selectedService === svc.id;
                      const isHidden = selectedService !== null && !isSelected;
                      if (isHidden) return null;
                      return (
                        <motion.button
                          key={svc.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => isSelected ? setSelectedService(null) : setSelectedService(svc.id as any)}
                          className={`w-full relative group transition-all ${
                            isSelected
                              ? 'flex items-center gap-4 px-6 py-4 rounded-[20px] border-2 border-[#006c55] bg-[#006c55]/5'
                              : 'flex items-center gap-5 p-6 rounded-[28px] border-2 border-white/60 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 hover:border-[#006c55]/30'
                          }`}
                        >
                          <div className={`flex items-center justify-center rounded-xl shrink-0 transition-all ${
                            isSelected ? 'w-8 h-8 bg-[#006c55] text-white' : 'w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-[#006c55]/10 group-hover:text-[#006c55]'
                          }`}>
                            <svc.icon size={isSelected ? 15 : 18} strokeWidth={1.5} />
                          </div>
                          <div className="text-left flex-1">
                            <h4 className={`font-medium tracking-tight ${
                              isSelected ? 'text-sm text-[#006c55]' : 'text-sm text-slate-900 dark:text-white'
                            }`}>{svc.label}</h4>
                            {!isSelected && <p className="text-[11px] font-normal text-slate-400 mt-0.5">{svc.desc}</p>}
                          </div>
                          {isSelected ? (
                            <span className="text-[9px] font-medium tracking-widest text-[#006c55] bg-[#006c55]/10 px-2.5 py-1 rounded-full">Selecionado · Trocar</span>
                          ) : (
                            <ChevronRight size={15} strokeWidth={1.5} className="text-slate-300 group-hover:text-[#006c55] transition-colors" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </section>

                <AnimatePresence mode="wait">
                  {selectedService === 'print' && (
                    <motion.div
                      key="print-flow"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-8"
                    >
                      {/* Upload Section */}
                      <section className="liquid-glass rounded-[32px] p-8 border border-white/40 dark:border-white/10 shadow-xl group">
                        <div className="flex items-center gap-3 mb-5">
                           <div className="w-7 h-7 rounded-xl bg-[#006c55] text-white flex items-center justify-center text-xs font-medium shadow-md shadow-[#006c55]/20">1</div>
                           <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Arquivos para Impressão</h3>
                        </div>

                        {!file ? (
                          <div className="relative group/drag">
                            <input
                              type="file"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.jpg,.png"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-[20px] p-8 text-center group-hover/drag:border-[#006c55] transition-all bg-white/30 dark:bg-slate-900/10">
                              <div className="w-12 h-12 bg-[#006c55]/8 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover/drag:scale-110 transition-transform">
                                <Upload className="text-[#006c55]" size={22} strokeWidth={1.5} />
                              </div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">Clique ou arraste seus arquivos</p>
                              <p className="text-[10px] font-normal text-slate-400 uppercase tracking-wider mt-1.5">Formatos: PDF, Word, Imagens (Máx 20MB)</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-4 bg-[#006c55]/5 rounded-[20px] border border-[#006c55]/20">
                            <div className="w-10 h-10 bg-[#006c55] rounded-xl flex items-center justify-center text-white shadow">
                              <FileCheck size={18} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-normal text-slate-400 uppercase tracking-tight">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span className="text-[9px] font-medium text-[#006c55] uppercase tracking-widest bg-[#006c55]/10 px-2 py-0.5 rounded-full">Pronto</span>
                              </div>
                            </div>
                            <button
                              onClick={() => { setFile(null); setPages(1); }}
                              className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                            >
                              <X size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                        )}
                      </section>

                      {/* Config Section */}
                      {file && (
                        <section className="liquid-glass rounded-[32px] p-8 border border-white/40 dark:border-white/10 shadow-xl">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-7 h-7 rounded-xl bg-[#006c55] text-white flex items-center justify-center text-xs font-medium shadow-md shadow-[#006c55]/20">2</div>
                             <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Preferências de Impressão</h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-slate-400 block">Número de Páginas</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="1"
                                    value={pages}
                                    onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full h-11 px-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl font-medium text-base focus:ring-1 focus:ring-[#006c55] transition-all outline-none"
                                  />
                                  <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} strokeWidth={1.5} />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-slate-400 block">Número de Cópias</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="1"
                                    value={copies}
                                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full h-11 px-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl font-medium text-base focus:ring-1 focus:ring-[#006c55] transition-all outline-none"
                                  />
                                  <CopyIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} strokeWidth={1.5} />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-8">
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => setIsColor(!isColor)}
                                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 ${
                                    isColor ? 'border-[#006c55] bg-[#006c55]/5 text-[#006c55]' : 'border-slate-100 dark:border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <Palette size={18} strokeWidth={1.5} />
                                  <span className="text-[10px] font-medium uppercase mt-2 tracking-wider">Colorida</span>
                                </button>
                                <button
                                  onClick={() => setIsDuplex(!isDuplex)}
                                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 ${
                                    isDuplex ? 'border-[#006c55] bg-[#006c55]/5 text-[#006c55]' : 'border-slate-100 dark:border-slate-800 text-slate-400'
                                  }`}
                                >
                                  <Layers size={18} strokeWidth={1.5} />
                                  <span className="text-[10px] font-medium uppercase mt-2 tracking-wider">Frente/Verso</span>
                                </button>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-slate-400 block">Economy Mode (Pgs/Folha)</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {[1, 2, 4].map((num) => (
                                    <button
                                      key={num}
                                      onClick={() => setNUp(num as 1 | 2 | 4)}
                                      className={`py-2.5 rounded-xl font-medium text-xs transition-all ${
                                        nUp === num 
                                          ? 'bg-[#006c55] text-white shadow shadow-[#006c55]/20' 
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                      }`}
                                    >
                                      {num} pg{num > 1 ? 's' : ''}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Extra Services */}
                          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                             <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Acabamentos Acadêmicos</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div className="space-y-3">
                                 <label className="text-[9px] uppercase tracking-widest font-semibold text-slate-400">Encadernação</label>
                                 <div className="grid grid-cols-2 gap-2">
                                 {[{id:'none',label:'Sem',icon:X},{id:'spiral',label:'Espiral',icon:RotateCcw},{id:'thermal',label:'Térmica',icon:Layers},{id:'hardcover',label:'Capa Dura',icon:BookOpen}].map(opt => (
                                   <button
                                     key={opt.id}
                                     onClick={() => setBinding(opt.id as any)}
                                     className={`p-2.5 rounded-xl border text-[10px] font-medium flex flex-col items-center gap-1 transition-all ${
                                       binding === opt.id ? 'border-[#006c55] bg-[#006c55]/10 text-[#006c55]' : 'border-slate-100 dark:border-slate-800 text-slate-500'
                                     }`}
                                   >
                                     <opt.icon size={14} strokeWidth={1.5} />
                                     {opt.label}
                                   </button>
                                 ))}
                                 </div>
                               </div>
                               <div className="space-y-2">
                                 <label className="text-[9px] uppercase tracking-widest font-semibold text-slate-400">Extras</label>
                                 {[
                                   { id: 'stapled', label: 'Grampeado (+R$ 0,50)' },
                                   { id: 'punched', label: 'Furos p/ Pasta (+R$ 0,20)' }
                                 ].map(opt => (
                                    <button
                                      key={opt.id}
                                      onClick={() => finishing.includes(opt.id) ? setFinishing(finishing.filter(f => f !== opt.id)) : setFinishing([...finishing, opt.id])}
                                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                                        finishing.includes(opt.id) ? 'border-[#006c55] bg-[#006c55]/10 text-[#006c55]' : 'border-slate-100 dark:border-slate-800 text-slate-500'
                                      }`}
                                    >
                                      <span className="text-[10px] font-medium">{opt.label}</span>
                                      <Check size={12} strokeWidth={1.5} className={finishing.includes(opt.id) ? 'opacity-100' : 'opacity-0'} />
                                    </button>
                                 ))}
                               </div>
                             </div>
                          </div>
                        </section>
                      )}

                      {/* Payment Selection */}
                      {file && (
                        <section className="liquid-glass rounded-[32px] p-8 border border-white/40 dark:border-white/10 shadow-xl">
                          <div className="flex items-center gap-3 mb-5">
                             <div className="w-7 h-7 rounded-xl bg-[#006c55] text-white flex items-center justify-center text-xs font-medium shadow-md shadow-[#006c55]/20">3</div>
                             <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">Forma de Pagamento</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              onClick={() => setPaymentMethod('counter')}
                              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                paymentMethod === 'counter' ? 'border-[#006c55] bg-[#006c55]/5 text-[#006c55]' : 'border-slate-100 dark:border-slate-800'
                              }`}
                            >
                              <div className={`p-2.5 rounded-xl ${paymentMethod === 'counter' ? 'bg-[#006c55] text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                                <Wallet size={18} strokeWidth={1.5} />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-medium tracking-tight">No Balcão</p>
                                <p className="text-[10px] font-normal opacity-60">Retirada física</p>
                              </div>
                            </button>
                            <button
                              onClick={() => setPaymentMethod('online')}
                              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                                paymentMethod === 'online' ? 'border-[#006c55] bg-[#006c55]/5 text-[#006c55]' : 'border-slate-100 dark:border-slate-800'
                              }`}
                            >
                              <div className={`p-2.5 rounded-xl ${paymentMethod === 'online' ? 'bg-[#006c55] text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                                <Zap size={18} strokeWidth={1.5} />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-medium tracking-tight">Pagamento Pix</p>
                                <p className="text-[10px] font-medium text-[#006c55] uppercase tracking-widest">Liberação Fast</p>
                              </div>
                            </button>
                          </div>
                        </section>
                      )}
                    </motion.div>
                  )}

                  {selectedService && selectedService !== 'print' && (
                    <motion.div
                      key="other-svcs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="liquid-glass rounded-[32px] p-20 text-center border border-white/40 dark:border-white/10"
                    >
                      <Loader2 className="w-10 h-10 text-[#006c55] animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Serviço em Breve</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-2">Estamos integrando este serviço acadêmico ao Thoth Print.</p>
                      <button onClick={() => setSelectedService(null)} className="mt-8 text-xs font-bold text-[#006c55] uppercase tracking-widest">Voltar</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Profile Card — order: 1st on mobile, top-right on desktop */}
          {!orderComplete && (
            <aside className="lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:sticky lg:top-28 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="liquid-glass rounded-[32px] p-6 border border-white/40 dark:border-white/10 shadow-xl"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-[24px] overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-[#006c55]/20 shadow-inner">
                    {station.logoUrl ? (
                      <img src={station.logoUrl} alt={station.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Printer size={28} className="text-[#006c55]/40" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{station.name}</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#006c55] mt-1">Gráfica Parceira</p>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    {station.description || "Serviços gráficos universitários com qualidade e rapidez Thoth Print."}
                  </p>
                  <div className="w-full pt-3 space-y-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-2 text-left">
                      <MapPin size={14} className="text-[#006c55] shrink-0 mt-0.5" />
                      <span className="text-[11px] font-semibold text-slate-500 leading-snug">{station.address || 'Local não informado'}</span>
                    </div>
                    {station.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-[#006c55] shrink-0" />
                        <span className="text-[11px] font-bold text-slate-500">{station.phone}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full py-3.5 bg-[#006c55] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#005a46] transition-all shadow-lg shadow-[#006c55]/10 active:scale-95"
                  >
                    <MessageCircle size={14} fill="currentColor" />
                    Chamar no WhatsApp
                  </button>
                  <div className="flex gap-2 w-full">
                    <button className="flex-1 p-2.5 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-white/20 text-slate-400 hover:text-[#006c55] transition-colors flex justify-center">
                      <Instagram size={16} />
                    </button>
                    <button className="flex-1 p-2.5 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-white/20 text-slate-400 hover:text-[#006c55] transition-colors flex justify-center">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </aside>
          )}

          {/* Summary Card — order: last on mobile, bottom-right on desktop */}
          {!orderComplete && (
            <aside className="lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:sticky lg:top-28 order-3 lg:order-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="liquid-glass rounded-[32px] p-8 border border-white/40 dark:border-white/10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#006c55]/5 blur-3xl rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#006c55] mb-8 block">Resumo Acadêmico</span>
                {file ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Valor do Pedido</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-slate-400">R$</span>
                          <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">
                            {calculatePrice().toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                           <span>Configuração</span>
                           <span className="text-slate-900 dark:text-white text-right font-bold">
                             {isColor ? 'Colorida' : 'P&B'} • {nUp} pg/fl
                           </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                           <span>Documento</span>
                           <span className="text-slate-900 dark:text-white text-right font-bold truncate max-w-[100px]">
                             {file.name}
                           </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                           <span>Pagamento</span>
                           <span className="text-[#006c55] font-bold uppercase tracking-tighter">
                             {paymentMethod === 'online' ? 'Online / Fast' : 'No Balcão'}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 space-y-3">
                      <button
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="w-full py-5 bg-[#006c55] text-white rounded-[20px] font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#006c55]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Finalizar Pedido <ChevronRight size={18} strokeWidth={3} /></>}
                      </button>
                      <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-60">Garantia Thoth Safe</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center">
                    <div className="w-16 h-16 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                      <FileText size={28} className="text-slate-300" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Aguardando upload<br/>para resumir
                    </p>
                  </div>
                )}
                <div className="mt-8 grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/20 text-center">
                    <ShieldCheck size={16} className="text-[#006c55] mx-auto mb-2" />
                    <span className="text-[8px] font-bold uppercase text-slate-500">Secure</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/20 text-center">
                    <Zap size={16} className="text-[#006c55] mx-auto mb-2" />
                    <span className="text-[8px] font-bold uppercase text-slate-500">Express</span>
                  </div>
                </div>
              </motion.div>
            </aside>
          )}

        </div>
      </main>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[32px] md:rounded-[32px] h-[80vh] md:h-[600px] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#006c55]/10 rounded-full flex items-center justify-center"><MessageCircle className="text-[#006c55]" size={20} /></div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Suporte Próprio</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#006c55]">Chat ao vivo</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-40">
                    <MessageCircle size={48} />
                    <p className="text-sm mt-4 font-bold">Inicie sua conversa</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isCustomer = msg.senderRole === 'customer';
                    return (
                      <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-semibold ${isCustomer ? 'bg-[#006c55] text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'}`}>{msg.text}</div>
                      </div>
                    );
                  })
                )}
                <div ref={chatMessagesEndRef} />
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Tire sua dúvida..." className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#006c55] transition-all outline-none" />
                  <button onClick={handleSendMessage} disabled={!chatInput.trim()} className="w-14 h-14 bg-[#006c55] text-white rounded-2xl flex items-center justify-center hover:bg-[#005a46] transition-all disabled:opacity-50"><Send size={20} /></button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-12 text-center mt-12 bg-slate-100/30 dark:bg-slate-900/10 border-t border-slate-200/50 dark:border-slate-800/50">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-50">Thoth Print • Parceiro {station.name}</p>
        <p className="text-[9px] font-semibold text-slate-400 mt-2">© 2026 Thoth Group • Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default ExternalOrderPage;