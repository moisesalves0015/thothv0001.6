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
  AlertCircle
} from 'lucide-react';
import { PrinterService, PrinterStation } from '../../modules/print/printer.service';
import { PrintService } from '../../modules/print/print.service';
import { PrintChatService } from '../../modules/print/print-chat.service';
import { PrintRequest, PrintRequestMessage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';

const ExternalOrderPage: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [station, setStation] = useState<PrinterStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 20MB.');
        return;
      }
      setFile(selectedFile);
      setCurrentStep(2);
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
    setCurrentStep(1);
    setNUp(1);
    setBinding('none');
    setFinishing([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Loader2 className="w-12 h-12 text-[#006c55] animate-spin mx-auto mb-4" />
          <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Iniciando sistema...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full liquid-glass rounded-[32px] p-8 text-center shadow-2xl">
          <AlertTriangle className="text-amber-500 w-16 h-16 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Acesso Negado</h2>
          <p className="text-sm font-bold text-slate-500 mb-8">{error || 'Esta estação de impressão não está disponível offline.'}</p>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-[#006c55] text-white rounded-2xl font-black uppercase text-xs tracking-widest">Voltar ao Início</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-[#006c55]/30">
      {/* Universal Topbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group text-slate-500 hover:text-[#006c55] transition-all"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Início</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#006c55] rounded-xl flex items-center justify-center shadow-lg shadow-[#006c55]/20">
                <Printer className="text-white" size={18} sm:size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Thoth Print</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#006c55] mt-1">Estação Universitária</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase text-slate-400">Ponto de Coleta</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{station.name}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {orderComplete ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 pb-24 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl w-full"
          >
            {/* Main Success Card - Liquid Glass */}
            <div className="liquid-glass rounded-[32px] p-8 shadow-2xl mb-8 relative overflow-hidden border border-white/40 dark:border-white/10 group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500" />
              
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="text-emerald-500" size={40} />
                </motion.div>

                <div className="flex flex-col mb-8">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Pedido Confirmado!</h2>
                  <span className="text-[11px] uppercase tracking-[0.2em] font-black text-[#006c55] mt-2">
                    seu arquivo já está na fila
                  </span>
                </div>

                {/* Status and Queue Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/40 dark:bg-slate-800/40 rounded-2xl p-4 border border-white/20">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-black">Status</span>
                    <span className="text-sm font-bold text-amber-600 flex items-center justify-center gap-1">
                      <Clock size={14} /> Fila
                    </span>
                  </div>
                  <div className="bg-white/40 dark:bg-slate-800/40 rounded-2xl p-4 border border-white/20">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1 font-black">Lugar na Fila</span>
                    <span className="text-sm font-bold text-emerald-600">
                      {getQueuePosition() > 0 ? `${getQueuePosition()}º na fila` : 'Próximo!'}
                    </span>
                  </div>
                </div>

                {/* Order Details Brief */}
                <div className="bg-white/20 dark:bg-slate-800/20 rounded-2xl p-6 mb-8 text-left space-y-3 border border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-bold">Nº do Pedido</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white">#{orderComplete.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 font-bold">Total Pago</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">R$ {completedRequest?.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={handleDownloadReceipt}
                    className="py-4 bg-[#006c55] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:bg-[#005a46] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#006c55]/20 active:scale-95"
                  >
                    <Download size={18} strokeWidth={2.5} />
                    Comprovante
                  </button>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <MessageCircle size={18} strokeWidth={2.5} />
                    Chat Online
                  </button>
                </div>
                
                <button
                  onClick={resetOrder}
                  className="w-full py-4 text-[#006c55] dark:text-emerald-400 font-black text-[11px] uppercase tracking-widest hover:bg-emerald-500/5 rounded-2xl transition-all"
                >
                  Fazer outro pedido
                </button>
              </div>
            </div>

            {/* Ad Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="liquid-glass rounded-[24px] p-6 text-slate-700 dark:text-white relative overflow-hidden group cursor-pointer shadow-xl border border-white/40">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#006c55] dark:text-emerald-400">Patrocinado</span>
                    <h3 className="text-base font-black mt-1 leading-tight">Plano Thoth Premium</h3>
                    <p className="text-[11px] font-bold opacity-60 mt-2">Impressões com desconto e frete grátis.</p>
                  </div>
                  <div className="mt-4 text-[10px] font-black uppercase text-[#006c55]">Saiba mais →</div>
                </div>
                <Sparkles className="absolute -right-4 -bottom-4 w-20 h-20 opacity-5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="liquid-glass rounded-[24px] p-6 text-slate-700 dark:text-white relative overflow-hidden group cursor-pointer shadow-xl border border-white/40">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500">Novidade</span>
                    <h3 className="text-base font-black mt-1 leading-tight">Indique um Amigo</h3>
                    <p className="text-[11px] font-bold opacity-60 mt-2">Ganhe créditos para suas próximas impressões.</p>
                  </div>
                  <div className="mt-4 text-[10px] font-black uppercase text-orange-500">Resgatar →</div>
                </div>
                <Truck className="absolute -right-4 -bottom-4 w-20 h-20 opacity-5 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Column - Form Steps */}
            <div className="lg:col-span-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                  {/* Step 1: Upload */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="liquid-glass rounded-[24px] p-8 shadow-2xl relative overflow-hidden border border-white/40 dark:border-white/10 group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex flex-col mb-8">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black sm:text-sm tracking-tight transition-all ${currentStep >= 1 ? 'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>1</div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Upload do Arquivo</h2>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#006c55] mt-2 ml-12">
                        selecione o documento para impressão
                      </span>
                    </div>

                    {!file ? (
                      <div className="relative group/upload">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={uploading}
                        />
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[20px] p-12 text-center group-hover/upload:border-[#006c55] transition-all bg-white/40 dark:bg-slate-800/20">
                          <div className="w-16 h-16 bg-[#006c55]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 transition-transform">
                            <Upload className="text-[#006c55]" size={32} />
                          </div>
                          {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="text-[#006c55] animate-spin" size={24} />
                              <p className="text-sm font-black text-slate-600">Preparando arquivo...</p>
                            </div>
                          ) : (
                            <>
                              <p className="text-base font-black text-slate-900 dark:text-white">Toque para selecionar</p>
                              <p className="text-xs font-bold text-slate-500 mt-2">PDF, Word ou Imagens (Máx. 20MB)</p>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-6 bg-[#006c55]/5 rounded-[20px] border border-[#006c55]/20">
                        <div className="w-12 h-12 bg-[#006c55] rounded-xl flex items-center justify-center text-white">
                          <FileCheck size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 dark:text-white truncate">{file.name}</p>
                          <p className="text-xs font-bold text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          onClick={() => setFile(null)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </motion.section>

                  {/* Step 2: Config */}
                  {file && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="liquid-glass rounded-[24px] p-8 shadow-2xl relative overflow-hidden border border-white/40 dark:border-white/10 group"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#006c55] to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="flex flex-col mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-[#006c55] text-white flex items-center justify-center text-xs font-black sm:text-sm shadow-lg shadow-[#006c55]/20">2</div>
                          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Configurações</h2>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#006c55] mt-2 ml-12">
                          ajuste seu pedido como desejar
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3 block">Total de Páginas</label>
                            <input
                              type="number"
                              min="1"
                              value={pages}
                              onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full h-14 px-6 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-2xl font-black text-lg focus:ring-2 focus:ring-[#006c55] transition-all outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3 block">Quantidade de Cópias</label>
                            <input
                              type="number"
                              min="1"
                              value={copies}
                              onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full h-14 px-6 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-2xl font-black text-lg focus:ring-2 focus:ring-[#006c55] transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setIsColor(!isColor)}
                              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${isColor ? 'border-[#006c55] bg-[#006c55]/5 text-[#006c55]' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                            >
                              <Palette size={20} strokeWidth={2.5} />
                              <span className="text-[10px] font-black uppercase mt-2">Colorida</span>
                            </button>
                            <button
                              onClick={() => setIsDuplex(!isDuplex)}
                              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${isDuplex ? 'border-[#006c55] bg-[#006c55]/5 text-[#006c55]' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                            >
                              <Layers size={20} strokeWidth={2.5} />
                              <span className="text-[10px] font-black uppercase mt-2">Frente/Verso</span>
                            </button>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3 block">Páginas por Folha (Eco-Print)</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[1, 2, 4].map((num) => (
                                <button
                                  key={num}
                                  onClick={() => setNUp(num as 1 | 2 | 4)}
                                  className={`py-3 rounded-xl font-black text-xs transition-all ${nUp === num ? 'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                                >
                                  {num}pg{num > 1 ? 's' : ''}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-6">Serviços Acadêmicos Extras</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="text-xs font-black text-slate-900 dark:text-white mb-3 block">Encadernação</label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'none', label: 'Sem' },
                                { id: 'spiral', label: 'Espiral' },
                                { id: 'thermal', label: 'Térmica' },
                                { id: 'hardcover', label: 'Capa Dura' }
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() => setBinding(opt.id as any)}
                                  className={`p-3 rounded-xl border text-[11px] font-black uppercase transition-all ${binding === opt.id ? 'border-[#006c55] bg-[#006c55]/10 text-[#006c55]' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-slate-900 dark:text-white mb-3 block">Acabamentos</label>
                            {[
                              { id: 'stapled', label: 'Grampeado (+R$ 0,50)' },
                              { id: 'punched', label: 'Furos para Pasta (+R$ 0,20)' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => finishing.includes(opt.id) ? setFinishing(finishing.filter(f => f !== opt.id)) : setFinishing([...finishing, opt.id])}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${finishing.includes(opt.id) ? 'border-[#006c55] bg-[#006c55]/10 text-[#006c55]' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                              >
                                <span className="text-[11px] font-black uppercase">{opt.label}</span>
                                <Check size={14} className={finishing.includes(opt.id) ? 'opacity-100 text-[#006c55]' : 'opacity-0'} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Payment */}
                      <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-9 h-9 rounded-2xl bg-[#006c55] text-white flex items-center justify-center text-xs font-black sm:text-sm shadow-lg shadow-[#006c55]/20">3</div>
                          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Pagamento</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button
                            onClick={() => setPaymentMethod('counter')}
                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${paymentMethod === 'counter' ? 'border-[#006c55] bg-[#006c55]/5 text-[#006c55]' : 'border-slate-100 dark:border-slate-800'}`}
                          >
                            <Wallet size={20} />
                            <div className="text-left">
                              <p className="text-sm font-black uppercase tracking-tight">No Balcão</p>
                              <p className="text-[10px] font-bold opacity-60">Retirada física</p>
                            </div>
                          </button>
                          <button
                            onClick={() => setPaymentMethod('online')}
                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${paymentMethod === 'online' ? 'border-[#006c55] bg-[#006c55]/5 text-[#006c55]' : 'border-slate-100 dark:border-slate-800'}`}
                          >
                            <CreditCard size={20} />
                            <div className="text-left">
                              <p className="text-sm font-black uppercase tracking-tight text-[#006c55]">Via Pix</p>
                              <p className="text-[10px] font-bold opacity-60">Liberação imediata</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.section>
                  )}
                </div>

                {/* Right Column - Summary */}
                <div className="lg:col-span-5 h-full">
                  <div className="sticky top-28">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="liquid-glass rounded-[32px] p-8 shadow-2xl relative overflow-hidden border border-white/40 dark:border-white/10"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006c55] mb-6 block">Resumo Acadêmico</span>
                      
                      {file ? (
                        <>
                          <div className="space-y-4 mb-8">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Valor Total</span>
                              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                <span className="text-sm font-bold mr-1 opacity-50">R$</span>
                                {calculatePrice().toFixed(2)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                                <span>Configuração</span>
                                <span className="text-slate-900 dark:text-white tracking-tight font-black">{isColor ? 'Colorida' : 'P&B'} • {nUp} pgs/folha</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                                <span>Documento</span>
                                <span className="text-slate-900 dark:text-white tracking-tight font-black truncate max-w-[120px]">{file.name}</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                                <span>Pagamento</span>
                                <span className="text-[#006c55] uppercase tracking-tighter font-black">{paymentMethod === 'online' ? 'Online/Fast' : 'Manual/Balcão'}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                            className="w-full py-5 bg-[#006c55] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#006c55]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Confirmar Pedido <ChevronRight size={18} strokeWidth={3} /></>}
                          </button>
                        </>
                      ) : (
                        <div className="py-20 text-center opacity-30">
                          <FileText size={48} className="mx-auto mb-4" />
                          <p className="text-[11px] font-black uppercase tracking-widest">Aguardando arquivo...</p>
                        </div>
                      )}

                      <div className="mt-8 grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <ShieldCheck size={18} className="text-[#006c55] mb-2" />
                          <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white leading-none">Total Seguro</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1">Conexão SSL Thoth</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <Info size={18} className="text-[#006c55] mb-2" />
                          <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white leading-none">Thoth Eco</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1">Sustentabilidade</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[32px] md:rounded-[32px] h-[80vh] md:h-[600px] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#006c55]/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="text-[#006c55]" size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">Suporte Thoth</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#006c55]">atendimento via chat</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-800/30">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                    <MessageCircle size={48} />
                    <p className="text-sm mt-4 font-black">Inicie sua conversa</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isCustomer = msg.senderRole === 'customer';
                    return (
                      <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-bold ${isCustomer ? 'bg-[#006c55] text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-tl-none'}`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Dúvidas sobre o pedido?"
                    className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#006c55] transition-all outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="w-14 h-14 bg-[#006c55] text-white rounded-2xl flex items-center justify-center hover:bg-[#005a46] transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Bar */}
      {file && !orderComplete && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 z-[40] pb-safe">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-500">Total do Pedido</span>
              <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">
                <span className="text-xs mr-1 text-slate-400">R$</span> {calculatePrice().toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-4 bg-[#006c55] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#006c55]/20 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <span>Enviar</span>
                  <ChevronRight size={16} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 sm:mt-20 pb-24 lg:pb-12 text-center px-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Desenvolvido por Thoth Creative Group
        </p>
      </footer>
    </div>
  );
};

export default ExternalOrderPage;