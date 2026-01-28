import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PrintService } from '../modules/print/print.service';
import { PrintRequest } from '../types';
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
import { PrinterService, PrinterStation } from '../modules/print/printer.service';
import * as pdfjsLib from 'pdfjs-dist';

// Configurando o worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Retiraremos o PRINTERS_CONFIG hardcoded para usar dados do Firestore

const PrintHistoryBox: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PrintRequest[]>([]);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PrintRequest | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'active' | 'archived'>('active');

  const [stations, setStations] = useState<PrinterStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');

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
    if (pageStr.toLowerCase() === 'todas') return totalDetectedPages || 1;
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
      if (newFile.type === 'application/pdf') {
        try {
          const arrayBuffer = await newFile.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          setTotalDetectedPages(pdf.numPages);
          setNewPages('Todas'); // Resetamos para 'Todas' após detecção
        } catch (error) {
          console.error("Erro ao ler PDF:", error);
        }
      } else {
        // Se não for PDF (doc/docx), deixamos o usuário informar manualmente
        setTotalDetectedPages(1);
      }
    };

    detectPages();
  }, [newFile]);

  const currentPricing = useMemo(() => {
    if (!selectedStation) return { total: 0, unitPrice: 0, pageCount: 0 };
    const unitPrice = newIsColor
      ? (selectedStation.prices?.color ?? 1.00)
      : (selectedStation.prices?.pb ?? 0.15);
    const pageCount = parsePageCount(newPages);
    let total = unitPrice * pageCount;
    if (newIsDuplex) total *= 0.95; // 5% desconto frente/verso
    if (newPriority === 'urgent') total += 2.00;
    return { total, unitPrice, pageCount };
  }, [selectedStation, newIsColor, newPages, newIsDuplex, newPriority]);

  const handleAddRequest = async () => {
    if (!newFile || !user || !selectedStation) return;
    setIsUploading(true);
    try {
      const fileUrl = await PrintService.uploadFile(newFile);
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
      console.log("[PrintBox] Order Data for Firestore:", orderData);
      console.log("[PrintBox] Current User UID:", user.uid);
      await PrintService.createRequest(orderData);
      setIsNewModalOpen(false);
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
        return { icon: <CheckCircle2 size={12} />, text: 'Pronto', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' };
      case 'printing':
        return { icon: <Loader2 size={12} className="animate-spin" />, text: 'Imprimindo', class: 'bg-blue-500/10 text-blue-600 border-blue-200' };
      case 'cancelled':
        return { icon: <XCircle size={12} />, text: 'Cancelado', class: 'bg-red-500/10 text-red-600 border-red-200' };
      default:
        return { icon: <Clock size={12} />, text: 'Fila', class: 'bg-amber-500/10 text-amber-600 border-amber-200' };
    }
  };

  const filteredRequests = requests.filter(r => viewTab === 'active' ? !r.archived : r.archived);

  return (
    <div className="w-full lg:w-[315px] h-[350px] liquid-glass rounded-[24px] p-5 flex flex-col shadow-lg relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Impressões</h3>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="p-1.5 bg-[#006c55] text-white rounded-lg hover:bg-[#005a46] transition-all active:scale-95 shadow-md shadow-[#006c55]/20"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
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
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
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
                className={`p-3 rounded-xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all group relative ${isMenuActive ? 'z-[50]' : 'z-auto'} ${req.archived ? 'opacity-70 grayscale-[0.5]' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer group-hover:bg-[#006c55]/10 group-hover:text-[#006c55]"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <FileText size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-[11px] font-black text-slate-800 truncate pr-2 cursor-pointer" onClick={() => setSelectedRequest(req)}>{req.fileName}</h4>
                      <span className="text-[11px] font-black text-slate-900">R$ {req.totalPrice.toFixed(2)}</span>
                    </div>

                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate mb-2">
                      {req.printerName} • {req.pages}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${config.class}`}>
                        {config.icon}
                        {config.text}
                      </div>

                      <button
                        onClick={() => setActiveMenu(activeMenu === req.id ? null : req.id)}
                        className="text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer do Card */}
                <div className="mt-3 pt-2 border-t border-white/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {req.status === 'pending' && (
                      <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-tighter">
                        #{requests.filter(r => !r.archived && r.status === 'pending' && r.timestamp < req.timestamp).length + 1}º Fila
                      </span>
                    )}
                    {req.priority === 'urgent' && (
                      <span className="text-[8px] font-black bg-purple-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">Urgente</span>
                    )}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${req.paymentMethod === 'paid' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {req.paymentMethod === 'paid' ? '• PAGO' : '• PAGAR NO BALCÃO'}
                  </span>
                </div>

                {isMenuActive && (
                  <>
                    <div className="fixed inset-0 z-[40]" onClick={() => setActiveMenu(null)} />
                    <div className="absolute right-2 top-10 w-40 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 z-[51] py-1.5 animate-in fade-in zoom-in-95 duration-200">
                      <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
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
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <RotateCcw size={12} /> Repetir Pedido
                      </button>
                      <div className="h-px bg-slate-50 my-1 mx-2" />
                      <button
                        onClick={() => toggleArchive(req.id, !!req.archived)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
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
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors"
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
        <div className="absolute inset-0 z-[60] bg-white/90 backdrop-blur-md p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Printer size={16} className="text-[#006c55]" />
              Configurações
            </h4>
            <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-slate-900">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
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
                  className="w-full h-14 bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:border-[#006c55] hover:bg-emerald-50/30 transition-all group"
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
                  className="w-full h-10 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500/20"
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
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  value={newPages}
                  onChange={(e) => setNewPages(e.target.value)}
                />
              </div>
            </div>

            {selectedStation && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <MapPin size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-tight text-slate-900">{selectedStation.name}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{selectedStation.workingHours}</span>
                    </div>
                  </div>
                  {!selectedStation.isOpen && (
                    <span className="text-[8px] font-black uppercase bg-red-500 text-white px-2 py-1 rounded-md">Fechada</span>
                  )}
                </div>

                {!selectedStation.isOpen && (
                  <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-in fade-in duration-300">
                    <AlertCircle size={14} className="text-amber-500 shrink-0" />
                    <span className="text-[9px] font-bold text-amber-700 uppercase leading-snug">
                      A gráfica está fechada no momento. Seu pedido ficará na fila e será impresso assim que abrirem.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pagamento</label>
                <select
                  className="w-full h-10 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                >
                  <option value="paid">Já Pago (Pix/Crédito)</option>
                  <option value="on_pickup">Pagar na Retirada</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Prioridade</label>
                <select
                  className="w-full h-10 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgente (+R$ 2.00)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-900 uppercase">Acabamento</span>
                <span className="text-[9px] text-slate-400">{newIsColor ? 'Colorido' : 'P&B'} • {newIsDuplex ? 'Frente/Verso' : 'Simples'}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewIsColor(!newIsColor)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${newIsColor ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                >
                  <Settings2 size={14} />
                </button>
                <button
                  onClick={() => setNewIsDuplex(!newIsDuplex)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${newIsDuplex ? 'bg-[#006c55] text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                >
                  <RotateCcw size={14} className="rotate-90" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#006c55]/5 border border-[#006c55]/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calculator size={12} className="text-[#006c55]" />
                <span className="text-[10px] font-black uppercase text-[#006c55]">Detalhamento de Custos</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Unitário ({selectedStation?.name})</span>
                  <span>R$ {selectedStation ? (newIsColor ? (selectedStation.prices?.color ?? 1.00) : (selectedStation.prices?.pb ?? 0.15)).toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Qtd. Páginas Detectadas</span>
                  <span>{currentPricing.pageCount} unid.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Estimado</span>
              <span className="text-sm font-black text-slate-900">R$ {currentPricing.total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleAddRequest}
              disabled={!newFile || !selectedStation || isUploading}
              className="w-full h-12 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar & Pagar'}
            </button>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="absolute inset-0 z-[65] bg-white/95 backdrop-blur-md p-6 flex flex-col animate-in fade-in zoom-in-95 duration-300 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#006c55]">Checkout de Retirada</span>
            <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center border-2 border-slate-100 shadow-xl p-2">
                <QrCode size={100} className="text-slate-900" />
              </div>
            </div>
            <h5 className="text-sm font-black text-slate-900 mb-1">{selectedRequest.fileName}</h5>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-4">{selectedRequest.printerName}</p>
          </div>

          <div className="space-y-2 flex-1">
            {[
              { label: 'Páginas', value: selectedRequest.pages },
              { label: 'Valor Pago', value: `R$ ${selectedRequest.totalPrice.toFixed(2)}`, success: true }
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-[10px] border-b border-slate-50 pb-2">
                <span className="font-bold text-slate-400">{item.label}</span>
                <span className={`font-black ${item.success ? 'text-emerald-600' : 'text-slate-800'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-white/40">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
          <div className="flex items-center gap-1.5">
            <Printer size={12} />
            <span>{requests.filter(r => !r.archived && (r.status === 'pending' || r.status === 'printing')).length} na fila</span>
          </div>
          <div className="flex items-center gap-1 text-[#006c55]">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PrintHistoryBox;