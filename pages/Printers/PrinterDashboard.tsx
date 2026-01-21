
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Printer, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  LogOut,
  ShieldCheck,
  Search,
  X
} from 'lucide-react';
import { PrintService } from '../../modules/print/print.service';
import { PrintRequest } from '../../types';

const PrinterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [selectedReq, setSelectedReq] = useState<PrintRequest | null>(null);

  useEffect(() => {
    return PrintService.subscribeToRequests(setRequests);
  }, []);

  const filtered = useMemo(() => 
    requests.filter(r => !r.archived && r.fileName.toLowerCase().includes(searchQuery.toLowerCase())), 
  [requests, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="h-16 bg-white border-b flex items-center justify-between px-8">
        <h1 className="font-black text-xl">Terminal Thoth <span className="text-[#006c55]">Print</span></h1>
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar ordem..." className="w-full h-10 pl-10 pr-4 border rounded-xl"/>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-red-500 font-bold"><LogOut size={18}/> Sair</button>
      </header>

      <main className="flex-1 p-8 grid grid-cols-3 gap-8">
        {['pending', 'printing', 'ready'].map(status => (
          <div key={status} className="bg-white/50 rounded-2xl p-6 flex flex-col gap-4 border">
            <h3 className="font-black uppercase text-xs tracking-widest text-slate-500 mb-2 border-b pb-2">{status}</h3>
            <div className="space-y-4">
              {filtered.filter(r => r.status === status).map(req => (
                <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border">
                  <div className="flex justify-between mb-2">
                    <FileText size={20} className="text-[#006c55]"/>
                    <span className="font-bold">R$ {req.totalPrice.toFixed(2)}</span>
                  </div>
                  <h4 className="font-black text-sm truncate">{req.fileName}</h4>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{req.customerName}</p>
                  
                  <div className="mt-4 flex gap-2">
                    {status === 'pending' && <button onClick={() => PrintService.updateStatus(req.id, 'printing')} className="flex-1 bg-[#006c55] text-white py-1.5 rounded-lg text-xs font-bold">Iniciar</button>}
                    {status === 'printing' && <button onClick={() => PrintService.updateStatus(req.id, 'ready')} className="flex-1 bg-slate-900 text-white py-1.5 rounded-lg text-xs font-bold">Finalizar</button>}
                    {status === 'ready' && <button onClick={() => setSelectedReq(req)} className="flex-1 bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><ShieldCheck size={14}/> Validar</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {selectedReq && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-2xl max-w-sm w-full relative">
            <button className="absolute top-4 right-4" onClick={() => { setSelectedReq(null); setVerifyCode(''); }}><X/></button>
            <h2 className="text-xl font-black text-center mb-6">Entrega de Ativo</h2>
            <input 
              maxLength={4} 
              value={verifyCode} 
              onChange={e => setVerifyCode(e.target.value)} 
              placeholder="Código" 
              className="w-full h-20 text-center text-4xl font-black border-2 rounded-2xl mb-6"
            />
            <button 
              onClick={async () => {
                if (verifyCode === selectedReq.pickupCode) {
                  await PrintService.deleteRequest(selectedReq.id);
                  setSelectedReq(null);
                  setVerifyCode('');
                  alert("Pedido concluído!");
                } else alert("Código inválido.");
              }}
              className="w-full h-14 bg-[#006c55] text-white rounded-xl font-bold"
            >
              Confirmar Entrega
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterDashboard;
