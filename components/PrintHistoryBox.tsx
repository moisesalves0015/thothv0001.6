
import React, { useState, useEffect } from 'react';
import { PrintRequest } from '../types';
import { 
  Plus, 
  X, 
  QrCode, 
  Archive, 
  Inbox, 
  Loader2, 
  FileText, 
  MoreHorizontal 
} from 'lucide-react';
import { PrintService } from '../modules/print/print.service';

const PrintHistoryBox: React.FC = () => {
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PrintRequest | null>(null);
  const [viewTab, setViewTab] = useState<'active' | 'archived'>('active');
  const [loading, setLoading] = useState(true);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    const unsub = PrintService.subscribeToRequests((data) => {
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddRequest = async () => {
    if (!newFileName) return;
    try {
      await PrintService.createRequest({
        fileName: newFileName,
        printerName: 'Biblioteca Central',
        totalPrice: 2.50,
        status: 'pending'
      });
      setIsNewModalOpen(false);
      setNewFileName('');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = requests.filter(r => viewTab === 'active' ? !r.archived : r.archived);

  return (
    <div className="w-full lg:w-[315px] h-[350px] glass-panel rounded-2xl p-5 flex flex-col shadow-lg relative overflow-hidden">
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 leading-none">Impressões</h3>
          <button onClick={() => setIsNewModalOpen(true)} className="p-1.5 bg-[#006c55] text-white rounded-lg"><Plus size={14}/></button>
        </div>
        <div className="flex gap-4 mt-3">
          <button onClick={() => setViewTab('active')} className={`${viewTab === 'active' ? 'text-[#006c55] border-b-2' : 'text-slate-400'}`}><Inbox size={14}/></button>
          <button onClick={() => setViewTab('archived')} className={`${viewTab === 'archived' ? 'text-[#006c55] border-b-2' : 'text-slate-400'}`}><Archive size={14}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? <Loader2 className="animate-spin mx-auto mt-10 text-[#006c55]"/> : null}
        {filteredRequests.map((req) => (
          <div key={req.id} className="p-3 bg-white/40 rounded-xl border flex items-center gap-3">
            <FileText size={18} className="text-slate-400 cursor-pointer" onClick={() => setSelectedRequest(req)}/>
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-black truncate">{req.fileName}</h4>
              <span className="text-[9px] uppercase font-bold text-[#006c55]">{req.status}</span>
            </div>
            <button onClick={() => PrintService.toggleArchive(req.id, !!req.archived)} className="text-slate-300"><MoreHorizontal size={14}/></button>
          </div>
        ))}
      </div>

      {isNewModalOpen && (
        <div className="absolute inset-0 z-50 bg-white/95 p-6 flex flex-col">
          <div className="flex justify-between mb-4"><h4 className="font-black">Nova Ordem</h4><button onClick={() => setIsNewModalOpen(false)}><X/></button></div>
          <input value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="Arquivo..." className="w-full h-10 border rounded-xl mb-4 px-3"/>
          <button onClick={handleAddRequest} className="bg-[#006c55] text-white h-10 rounded-xl font-bold">Emitir</button>
        </div>
      )}

      {selectedRequest && (
        <div className="absolute inset-0 z-50 bg-white p-6 flex flex-col items-center">
          <button className="absolute top-4 right-4" onClick={() => setSelectedRequest(null)}><X/></button>
          <div className="mt-10 p-4 border-2 rounded-2xl"><QrCode size={120}/></div>
          <h5 className="mt-4 font-black">{selectedRequest.fileName}</h5>
          <div className="mt-4 text-2xl font-black text-emerald-600">#{selectedRequest.pickupCode}</div>
        </div>
      )}
    </div>
  );
};

export default PrintHistoryBox;
