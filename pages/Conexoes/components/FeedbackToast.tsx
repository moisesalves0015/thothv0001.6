import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const FeedbackToast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 ${type === 'success'
                ? 'bg-white border-[#006c55]/20 text-slate-800'
                : 'bg-white border-red-200 text-slate-800'
            }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-[#006c55]/10 text-[#006c55]' : 'bg-red-100 text-red-500'
                }`}>
                {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </div>
            <p className="font-bold text-sm">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={14} />
            </button>
        </div>
    );
};

export default FeedbackToast;
