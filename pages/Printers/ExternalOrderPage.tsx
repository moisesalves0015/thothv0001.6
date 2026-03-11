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
  Copy as CopyIcon
} from 'lucide-react';
import { PrinterService, PrinterStation } from '../../modules/print/printer.service';
import { PrintService } from '../../modules/print/print.service';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 20MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const calculatePrice = () => {
    if (!station) return 0;
    const pricePerPage = isColor ? station.prices?.color || 1.00 : station.prices?.pb || 0.15;
    return pages * copies * pricePerPage;
  };

  const handleSubmit = async () => {
    if (!file || !station) {
      toast.error('Por favor, selecione um arquivo.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload File
      setUploading(true);
      const uploadedUrl = await PrintService.uploadFile(file);
      setFileUrl(uploadedUrl);
      setUploading(false);

      // 2. Create Request
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
      };

      const docRef = await PrintService.createRequest(orderData);
      setOrderComplete(docRef.id);
      toast.success('Pedido enviado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-[#006c55]" size={40} />
          <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Carregando Gráfica...</p>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ops! Alguma coisa deu errado.</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error || 'Esta gráfica não está recebendo pedidos no momento.'}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-500" size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Pedido Enviado!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Seu pedido foi recebido pela <strong>{station.name}</strong>. Agora é só aguardar a impressão começar!
          </p>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-8 text-left border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Número do Pedido</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{orderComplete.substring(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase">Status Inicial</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-bold">Pendente</span>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-[#006c55] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#005544] transition-all shadow-lg shadow-emerald-500/20"
          >
            Fazer Outro Pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 px-6 py-12 flex flex-col items-center">
      {/* Header / Branding */}
      <div className="w-full max-w-2xl mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
            <Printer className="text-[#006c55]" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{station.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Aberta Agora
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                <Clock size={10} />
                {station.workingHours}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Form */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. File Upload */}
          <section className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 font-black text-xs">1</div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Enviar Arquivo</h2>
            </div>

            <label className={`
              relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl cursor-pointer transition-all group
              ${file ? 'border-[#006c55] bg-emerald-500/5' : 'border-slate-200 dark:border-slate-700 hover:border-[#006c55] hover:bg-slate-50 dark:hover:bg-white/5'}
            `}>
              <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.doc,.jpg,.png" />
              
              {file ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-white/5">
                    <FileText className="text-[#006c55]" size={32} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">{file.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Clique para trocar</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-slate-400" size={32} />
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Clique ou arraste seu arquivo</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">PDF, DOCX, JPG ou PNG (Máx 20MB)</p>
                </div>
              )}
            </label>
          </section>

          {/* 2. Configuration */}
          <section className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 font-black text-xs">2</div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Personalize sua Impressão</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pages & Copies */}
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Total de Páginas</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      min="1" 
                      value={pages}
                      onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-lg focus:ring-2 focus:ring-[#006c55]/50 outline-none" 
                    />
                    <div className="text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                      <FileText size={20} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Número de Cópias</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      min="1" 
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-lg focus:ring-2 focus:ring-[#006c55]/50 outline-none" 
                    />
                    <div className="text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                      <CopyIcon size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <button 
                  onClick={() => setIsColor(!isColor)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isColor ? 'border-[#006c55] bg-emerald-500/5' : 'border-slate-100 dark:border-slate-800 bg-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isColor ? 'bg-[#006c55] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Droplets size={18} />
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">Impressão Colorida</span>
                  </div>
                  {isColor && <CheckCircle2 className="text-[#006c55]" size={20} />}
                </button>

                <button 
                  onClick={() => setIsDuplex(!isDuplex)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isDuplex ? 'border-[#006c55] bg-emerald-500/5' : 'border-slate-100 dark:border-slate-800 bg-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isDuplex ? 'bg-[#006c55] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Layers size={18} />
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">Frente e Verso</span>
                  </div>
                  {isDuplex && <CheckCircle2 className="text-[#006c55]" size={20} />}
                </button>
              </div>
            </div>
          </section>

          {/* 3. Payment */}
          <section className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] p-8 border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 font-black text-xs">3</div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Forma de Pagamento</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setPaymentMethod('counter')}
                className={`flex flex-col items-start p-6 rounded-3xl border-2 transition-all gap-4 ${paymentMethod === 'counter' ? 'border-[#006c55] bg-emerald-500/5' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <div className={`p-3 rounded-2xl ${paymentMethod === 'counter' ? 'bg-[#006c55] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <CreditCard size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Pagar no Balcão</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 italic">Pague ao retirar seu pedido</p>
                </div>
              </button>

              <button 
                onClick={() => setPaymentMethod('online')}
                className={`flex flex-col items-start p-6 rounded-3xl border-2 transition-all gap-4 ${paymentMethod === 'online' ? 'border-[#006c55] bg-emerald-500/5' : 'border-slate-100 dark:border-slate-800'}`}
              >
                <div className={`p-3 rounded-2xl ${paymentMethod === 'online' ? 'bg-[#006c55] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <ShieldCheck size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Pagamento Online</h3>
                  <p className="text-[10px] font-bold text-[#006c55] uppercase mt-1">Prevenção de Fila • Via Pix</p>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Right Side: Resume & Checkout */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-12">
          <div className="bg-slate-900 text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full" />

            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-8">Resumo do Pedido</h2>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Gráfica</span>
                <span className="font-bold text-sm tracking-tight">{station.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Configuração</span>
                <span className="font-bold text-sm tracking-tight">{isColor ? 'Colorida' : 'Preto & Branco'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-medium">Quantidade</span>
                <span className="font-bold text-sm tracking-tight">{pages} pgs x {copies} cópias</span>
              </div>
              <div className="h-px bg-white/10 w-full" />
              <div className="flex items-end justify-between">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total a Pagar</span>
                <span className="text-4xl font-black text-emerald-400 tracking-tighter">
                  R$ {calculatePrice().toFixed(2)}
                </span>
              </div>
            </div>

            <button 
              disabled={!file || isSubmitting}
              onClick={handleSubmit}
              className={`
                w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all
                ${!file || isSubmitting 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/30 active:scale-[0.98]'}
              `}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>Enviar Pedido</span>
                  <ChevronRight size={20} />
                </>
              )}
            </button>

            <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <Info className="text-emerald-500 flex-none" size={16} />
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                Ao clicar em enviar, seu arquivo será processado pela gráfica selecionada. Verifique as configurações antes de confirmar.
              </p>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
            <ShieldCheck size={20} className="text-[#006c55]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plataforma Segura via Thoth SSL</span>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <footer className="mt-20 text-center">
        <p className="text-[10px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.3em] flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-slate-200 dark:bg-slate-800" />
          Desenvolvido por Thoth Creative Group
          <span className="h-px w-12 bg-slate-200 dark:bg-slate-800" />
        </p>
      </footer>
    </div>
  );
};

export default ExternalOrderPage;
