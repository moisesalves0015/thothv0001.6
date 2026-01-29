import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { PrintService } from '../../../modules/print/print.service';
import { PrintRequest } from '../../../types';
import {
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  MoreHorizontal,
  Plus,
  X,
  QrCode,
  Download,
  RotateCcw,
  Settings2,
  AlertCircle,
  Archive,
  Inbox,
  Calculator,
  Info,
  MapPin,
  Upload
} from 'lucide-react';
import { PrinterService, PrinterStation } from '../../../modules/print/printer.service';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { PDFDocument, rgb } from 'pdf-lib';

// Configurando o worker do PDF.js
const PDF_WORKER_URL = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

// Retiraremos o PRINTERS_CONFIG hardcoded para usar dados do Firestore

const PrintHistoryBox: React.FC = () => {
  const { user, userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  const [requests, setRequests] = useState<PrintRequest[]>([]);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newModalStep, setNewModalStep] = useState<'config' | 'payment'>('config');
  const [selectedRequest, setSelectedRequest] = useState<PrintRequest | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'active' | 'archived'>('active');

  const [stations, setStations] = useState<PrinterStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [paymentSubMethod, setPaymentSubMethod] = useState<'pix' | 'card'>('pix');
  const [isDetectingPages, setIsDetectingPages] = useState(false);

  const handleDownloadReceipt = async (req: PrintRequest, isCover = false) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Cores e Design
    const primaryColor = [0, 108, 85]; // #006c55
    const secondaryColor = [241, 245, 249]; // slate-100

    // Cabeçalho colorido
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.text('THOTH', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('COMPROVANTE DE IMPRESSÃO', 105, 30, { align: 'center' });

    // Corpo do documento
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(14);
    doc.text('Detalhes do Pedido', 20, 55);

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, 58, 190, 58);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const details = [
      ['Arquivo:', req.fileName],
      ['Gráfica:', req.printerName],
      ['Data/Hora:', new Date(req.timestamp).toLocaleString()],
      ['Páginas:', `${req.pages} ${isCover ? '(+ Capa Thoth)' : ''}`],
      ['Valor Total:', `R$ ${req.totalPrice.toFixed(2)}`],
      ['Pagamento:', req.paymentMethod === 'paid' ? 'Pago via App' : 'Pagar na Retirada'],
      ['Status:', req.priority === 'urgent' ? 'Urgente' : 'Normal']
    ];

    let y = 70;
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, y);
      y += 8;
    });

    // Mensagem Criativa / Incentivo
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(20, 130, 170, 40, 5, 5, 'F');

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('🚀 Economize com o Thoth!', 105, 142, { align: 'center' });

    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Você sabia? Alunos que usam o Thoth economizam em média 15%', 105, 150, { align: 'center' });
    doc.text('em impressões comparado ao balcão tradicional. Indique um amigo!', 105, 155, { align: 'center' });
    doc.text('thoth.app.br', 105, 163, { align: 'center' });

    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('Este é um documento gerado automaticamente pelo sistema Thoth.', 105, 280, { align: 'center' });

    if (isCover) {
      return doc.output('arraybuffer');
    } else {
      doc.save(`comprovante_thoth_${req.id.slice(-5)}.pdf`);
    }
  };

  // Form states for new print
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newPages, setNewPages] = useState('Todas');
  const [totalDetectedPages, setTotalDetectedPages] = useState<number>(0);
  const [newIsColor, setNewIsColor] = useState(false);
  const [newIsDuplex, setNewIsDuplex] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'paid' | 'on_pickup'>('paid');
  const [newPriority, setNewPriority] = useState<'normal' | 'urgent'>('normal');

  useEffect(() => {
    if (!user) return;
    const unsubOrders = PrintService.subscribeToUserRequests(user.uid, setRequests);
    const unsubStations = PrinterService.subscribeToStations(setStations);
    return () => {
      unsubOrders();
      unsubStations();
    };
  }, [user]);

  const selectedStation = useMemo(() =>
    stations.find(s => s.stationId === selectedStationId) || null
    , [stations, selectedStationId]);

  const parsePageCount = (pageStr: string): number => {
    if (pageStr.toLowerCase().trim() === 'todas') return totalDetectedPages;
    try {
      const parts = pageStr.split(',').map(p => p.trim());
      let count = 0;
      parts.forEach(part => {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          if (!isNaN(start) && !isNaN(end)) count += (end - start + 1);
        } else {
          if (!isNaN(Number(part)) && part !== '') count += 1;
        }
      });
      return count || 1;
    } catch {
      return totalDetectedPages || 1;
    }
  };

  // Efeito para detectar páginas do PDF
  useEffect(() => {
    if (!newFile) {
      setTotalDetectedPages(0);
      return;
    }

    const detectPages = async () => {
      setIsDetectingPages(true);
      if (newFile.type === 'application/pdf') {
        try {
          console.log("[PrintBox] Detectando páginas...");
          const arrayBuffer = await newFile.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          setTotalDetectedPages(pdf.numPages);
          console.log("[PrintBox] Sucesso:", pdf.numPages, "páginas.");
        } catch (error) {
          console.error("Erro ao ler PDF:", error);
          setTotalDetectedPages(1);
        }
      } else {
        setTotalDetectedPages(1);
      }
      setIsDetectingPages(false);
    };

    detectPages();
  }, [newFile]);

  const currentPricing = useMemo(() => {
    if (!selectedStation) return { total: 0, unitPrice: 0, pageCount: 0, subtotal: 0, discount: 0, surcharge: 0 };

    const pageCount = parsePageCount(newPages);

    if (isAdmin) {
      return { total: 0, unitPrice: 0, pageCount, subtotal: 0, discount: 0, surcharge: 0 };
    }

    const unitPrice = newIsColor
      ? (selectedStation.prices?.color ?? 1.00)
      : (selectedStation.prices?.pb ?? 0.15);
    const subtotal = unitPrice * pageCount;
    let discount = 0;
    if (newIsDuplex) discount = subtotal * 0.05;
    let surcharge = 0;
    if (newPriority === 'urgent') surcharge = 2.00;
    const total = subtotal - discount + surcharge;
    return { total, unitPrice, pageCount, subtotal, discount, surcharge };
  }, [selectedStation, newIsColor, newPages, newIsDuplex, newPriority, isAdmin, totalDetectedPages]);

  const handleAddRequest = async () => {
    if (!newFile || !user || !selectedStation) return;
    setIsUploading(true);
    try {
      let finalFile: File | Blob = newFile;

      // Se for PDF, anexamos a capa
      if (newFile.type === 'application/pdf') {
        try {
          console.log("[PrintBox] Mesclando capa ao PDF...");
          const coverArrayBuffer = await handleDownloadReceipt({
            id: 'PREVIEW',
            fileName: newFile.name,
            printerName: selectedStation.name,
            timestamp: Date.now(),
            pages: newPages === 'Todas' ? `${totalDetectedPages}` : newPages,
            totalPrice: currentPricing.total,
            paymentMethod: newPaymentMethod,
            priority: newPriority,
            isColor: newIsColor,
            isDuplex: newIsDuplex,
            status: 'pending',
            archived: false,
            stationId: selectedStation.stationId,
            stationOwnerEmail: selectedStation.ownerEmail,
            customerId: user.uid
          }, true);

          if (coverArrayBuffer instanceof ArrayBuffer) {
            const pdfDoc = await PDFDocument.create();
            const coverDoc = await PDFDocument.load(coverArrayBuffer);
            const userDoc = await PDFDocument.load(await newFile.arrayBuffer());

            const [coverPage] = await pdfDoc.copyPages(coverDoc, [0]);
            pdfDoc.addPage(coverPage);

            const userPages = await pdfDoc.copyPages(userDoc, userDoc.getPageIndices());
            userPages.forEach(p => pdfDoc.addPage(p));

            const mergedPdfBytes = await pdfDoc.save();
            finalFile = new File([mergedPdfBytes.slice(0)], newFile.name, { type: 'application/pdf' });
            console.log("[PrintBox] PDF mesclado com sucesso como arquivo:", (finalFile as File).name);
          }
        } catch (mergeError) {
          console.error("Erro ao mesclar PDF, enviando original:", mergeError);
        }
      }

      const fileUrl = await PrintService.uploadFile(finalFile as File);
      const orderData = {
        fileName: newFile.name,
        fileUrl,
        printerName: selectedStation.name,
        stationId: selectedStation.stationId,
        stationOwnerEmail: selectedStation.ownerEmail.trim().toLowerCase(),
        pages: newPages === 'Todas' ? `${totalDetectedPages}` : newPages,
        isColor: newIsColor,
        isDuplex: newIsDuplex,
        paymentMethod: newPaymentMethod,
        priority: newPriority,
        totalPrice: currentPricing.total
      };

      await PrintService.createRequest(orderData);
      setIsNewModalOpen(false);
      setNewModalStep('config');
      setNewFile(null);
    } catch (error) {
      console.error("Erro ao criar pedido de impressão:", error);
      alert("Erro ao enviar pedido.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleArchive = async (id: string, currentArchived: boolean) => {
    try {
      await PrintService.toggleArchive(id, !currentArchived);
      setActiveMenu(null);
    } catch (error) {
      console.error("Erro ao arquivar/restaurar pedido:", error);
    }
  };

  const getStatusConfig = (status: PrintRequest['status']) => {
    switch (status) {
      case 'ready':
        return { icon: <CheckCircle2 size={12} />, text: 'Pronto', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' };
      case 'printing':
        return { icon: <Loader2 size={12} className="animate-spin" />, text: 'Imprimindo', class: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' };
      case 'cancelled':
        return { icon: <XCircle size={12} />, text: 'Cancelado', class: 'bg-red-500/10 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' };
      default:
        return { icon: <Clock size={12} />, text: 'Fila', class: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' };
    }
  };

  const filteredRequests = requests.filter(r => viewTab === 'active' ? !r.archived : r.archived);

  return (
    <div className="w-full lg:w-[315px] h-[437px] lg:h-[350px] liquid-glass rounded-[24px] flex flex-col shadow-lg relative overflow-hidden border border-white/40 dark:border-white/10">
      {/* Header Padronizado */}
      <div className="flex flex-col px-6 pt-6 pb-2 flex-shrink-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Impressões</h3>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#006c55] mt-1">
              gestão de arquivos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="w-9 h-9 rounded-full bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-[#006c55] dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-700 transition-all border border-white/90 dark:border-white/10 shadow-sm active:scale-95 flex items-center justify-center"
              title="Nova Impressão"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Tabs Control - Atualizado para Ícones */}
        <div className="flex items-center gap-6 mt-3 pb-1 border-b border-white/40">
          <button
            onClick={() => setViewTab('active')}
            className={`flex items-center gap-1.5 pb-1 transition-all ${viewTab === 'active' ? 'text-[#006c55] border-b-2 border-[#006c55]' : 'text-slate-400'}`}
          >
            <Inbox size={14} />
            <span className="text-[10px] font-black tracking-widest">({requests.filter(r => !r.archived).length})</span>
          </button>
          <button
            onClick={() => setViewTab('archived')}
            className={`flex items-center gap-1.5 pb-1 transition-all ${viewTab === 'archived' ? 'text-[#006c55] border-b-2 border-[#006c55]' : 'text-slate-400'}`}
          >
            <Archive size={14} />
            <span className="text-[10px] font-black tracking-widest">({requests.filter(r => r.archived).length})</span>
          </button>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 pt-2 space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            {viewTab === 'active' ? <Inbox size={32} /> : <Archive size={32} />}
            <span className="text-[10px] font-black uppercase tracking-widest mt-2">Nenhum registro</span>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const config = getStatusConfig(req.status);
            const isMenuActive = activeMenu === req.id;
            return (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`p-3 rounded-xl bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-800/60 dark:to-slate-900/40 border border-white/60 dark:border-white/10 hover:shadow-md transition-all group relative cursor-pointer ${isMenuActive ? 'z-[50]' : 'z-auto'} ${req.archived ? 'opacity-70 grayscale-[0.5]' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300 cursor-pointer group-hover:bg-[#006c55]/10 group-hover:text-[#006c55]"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <FileText size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 gap-2">
                      <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate cursor-pointer" onClick={() => setSelectedRequest(req)}>{req.fileName}</h4>
                      <span className="text-[11px] font-black text-slate-900 dark:text-white whitespace-nowrap">R$ {req.totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter truncate">
                        {req.printerName} • {req.pages}
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === req.id ? null : req.id);
                        }}
                        className="text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer do Card - Status movido para cá */}
                <div className="mt-3 pt-2 border-t border-white/40 dark:border-white/10 flex items-center justify-between gap-2 overflow-hidden">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-tight ${config.class} whitespace-nowrap`}>
                      {config.icon}
                      {config.text}
                      {req.status === 'pending' && (
                        <> - {requests.filter(r => !r.archived && r.status === 'pending' && r.timestamp < req.timestamp).length + 1}º</>
                      )}
                    </div>

                    {req.priority === 'urgent' && (
                      <span className="text-[8px] font-black bg-purple-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm whitespace-nowrap">Urgente</span>
                    )}
                  </div>

                  <span className={`text-[8px] font-black uppercase tracking-tighter whitespace-nowrap ${req.paymentMethod === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {req.paymentMethod === 'paid' ? '• PAGO' : '• NO BALCÃO'}
                  </span>
                </div>

                {isMenuActive && (
                  <>
                    <div className="fixed inset-0 z-[40]" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                    <div className="absolute right-2 top-10 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-700 z-[51] py-1.5 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadReceipt(req);
                          setActiveMenu(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Download size={12} /> Comprovante
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStationId(req.stationId);
                          setNewIsColor(req.isColor);
                          setNewIsDuplex(req.isDuplex);
                          setNewPages(req.pages);
                          setIsNewModalOpen(true);
                          setActiveMenu(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <RotateCcw size={12} /> Repetir Pedido
                      </button>
                      <div className="h-px bg-slate-50 dark:bg-slate-700 my-1 mx-2" />
                      <button
                        onClick={() => toggleArchive(req.id, !!req.archived)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Archive size={12} /> {req.archived ? 'Restaurar' : 'Arquivar'}
                      </button>
                      {req.status === 'pending' && (
                        <button
                          onClick={async () => {
                            try {
                              await PrintService.updateStatus(req.id, 'cancelled');
                              setActiveMenu(null);
                            } catch (error) {
                              console.error("Erro ao cancelar pedido:", error);
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <X size={12} /> Cancelar Fila
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modais de Impressão */}
      {isNewModalOpen && (
        <div className="absolute inset-0 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Printer size={16} className="text-[#006c55]" />
              {newModalStep === 'config' ? 'Configurações' : 'Pagamento'}
            </h4>
            <button
              onClick={() => {
                if (newModalStep === 'payment') setNewModalStep('config');
                else setIsNewModalOpen(false);
              }}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              {newModalStep === 'payment' ? <RotateCcw size={18} /> : <X size={20} />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
            {newModalStep === 'config' ? (
              <>
                {/* Seletor de Arquivo */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Documento</label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="print-upload"
                      accept=".pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="print-upload"
                      className="w-full h-14 bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:border-[#006c55] hover:bg-emerald-50/30 dark:hover:bg-emerald-900/30 transition-all group"
                    >
                      {newFile ? (
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-[#006c55]" />
                          <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{newFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={16} className="text-slate-400 group-hover:text-[#006c55]" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#006c55]">Selecionar PDF</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gráfica Parceira</label>
                    <select
                      className="w-full h-10 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold dark:text-slate-200 outline-none"
                      value={selectedStationId}
                      onChange={(e) => setSelectedStationId(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {stations.map(s => (
                        <option key={s.id} value={s.stationId}>
                          {s.name} {!s.isOpen && '(Fechada)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Páginas</label>
                    <input
                      type="text"
                      placeholder="Ex: 1-5, 7"
                      className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold dark:text-slate-200 outline-none"
                      value={newPages}
                      onChange={(e) => setNewPages(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pagamento</label>
                    <select
                      className="w-full h-10 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold dark:text-slate-200 outline-none"
                      value={newPaymentMethod}
                      onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                    >
                      <option value="paid">Pagar Agora</option>
                      <option value="on_pickup">Pagar na Retirada</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Prioridade</label>
                    <select
                      className="w-full h-10 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold dark:text-slate-200 outline-none"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgente (+R$ 2.00)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">Acabamento</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">{newIsColor ? 'Colorido' : 'P&B'} • {newIsDuplex ? 'Frente/Verso' : 'Simples'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewIsColor(!newIsColor)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${newIsColor ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                    >
                      <Settings2 size={14} />
                    </button>
                    <button
                      onClick={() => setNewIsDuplex(!newIsDuplex)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${newIsDuplex ? 'bg-[#006c55] text-white' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                    >
                      <RotateCcw size={14} className="rotate-90" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Método de Pagamento</label>
                  <div className="grid grid-cols-2 gap-2 h-12">
                    <button
                      onClick={() => setPaymentSubMethod('pix')}
                      className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${paymentSubMethod === 'pix' ? 'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}
                    >
                      <QrCode size={16} /> Pix
                    </button>
                    <button
                      onClick={() => setPaymentSubMethod('card')}
                      className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${paymentSubMethod === 'card' ? 'bg-[#006c55] text-white shadow-lg shadow-[#006c55]/20' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}`}
                    >
                      <FileText size={16} /> Cartão
                    </button>
                  </div>
                </div>

                {paymentSubMethod === 'pix' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center">
                    <div className="w-40 h-40 bg-white p-2 rounded-xl mb-3">
                      <QrCode size={144} className="text-slate-900" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Escaneie ou copie o código</p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-center truncate text-[9px] font-mono text-slate-500">
                      00020126580014br.gov.bcb.pix013689f0a2d4-1234-5678-90ab-cdef12345678
                    </div>
                  </div>
                )}

                {paymentSubMethod === 'card' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">Integração com Stripe (Futuro)</p>
                    <div className="mt-4 space-y-2 opacity-50 pointer-events-none">
                      <div className="h-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" />
                        <div className="h-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-3 bg-[#006c55]/5 dark:bg-[#006c55]/10 border border-[#006c55]/10 dark:border-[#006c55]/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calculator size={12} className="text-[#006c55] dark:text-emerald-400" />
                <span className="text-[10px] font-black uppercase text-[#006c55] dark:text-emerald-400">Detalhamento de Custos</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <span>Subtotal ({isDetectingPages ? 'Calculando...' : `${currentPricing.pageCount} pág.`})</span>
                  <span>{isDetectingPages ? '--' : `R$ ${currentPricing.subtotal.toFixed(2)}`}</span>
                </div>
                {currentPricing.discount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Desconto Frente/Verso (5%)</span>
                    <span>- R$ {currentPricing.discount.toFixed(2)}</span>
                  </div>
                )}
                {currentPricing.surcharge > 0 && (
                  <div className="flex justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <span>Taxa Prioridade Urgente</span>
                    <span>+ R$ {currentPricing.surcharge.toFixed(2)}</span>
                  </div>
                )}
                {isAdmin && (
                  <div className="pt-1 mt-1 border-t border-[#006c55]/20 flex justify-between text-[10px] font-black text-[#006c55] dark:text-emerald-400">
                    <span>Isenção Administrativa</span>
                    <span>100% OFF</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Total Estimado</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">R$ {currentPricing.total.toFixed(2)}</span>
            </div>

            {newModalStep === 'config' && newPaymentMethod === 'paid' && !isAdmin ? (
              <button
                onClick={() => setNewModalStep('payment')}
                disabled={!newFile || !selectedStation}
                className="flex-1 h-12 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                Pagar Agora
              </button>
            ) : (
              <button
                onClick={handleAddRequest}
                disabled={!newFile || !selectedStation || isUploading}
                className="flex-1 h-12 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar Pedido'}
              </button>
            )}
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="absolute inset-0 z-[65] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006c55]">Checkout de Retirada</span>
            <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 mt-2">
              <div className="text-[36px] font-black text-[#006c55] dark:text-emerald-400 tracking-[0.2em] bg-white dark:bg-slate-800 px-6 py-4 rounded-[24px] border-2 border-slate-100 dark:border-slate-700 shadow-xl flex items-center justify-center min-w-[160px]">
                {selectedRequest.id.slice(-4).toUpperCase()}
              </div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-3">Código de Retirada</p>
            </div>
          </div>

          <div className="space-y-2 flex-1 pt-2">
            {[
              { label: 'Arquivo', value: selectedRequest.fileName },
              { label: 'Data/Hora', value: new Date(selectedRequest.timestamp).toLocaleString() },
              { label: 'Valor', value: `R$ ${selectedRequest.totalPrice.toFixed(2)}`, success: true }
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-[10px] border-b border-slate-50 dark:border-slate-800/60 pb-2">
                <span className="font-bold text-slate-400 dark:text-slate-500">{item.label}</span>
                <span className={`font-black truncate max-w-[150px] ${item.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}



      <style jsx="true">{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PrintHistoryBox;