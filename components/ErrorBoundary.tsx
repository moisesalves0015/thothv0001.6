import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    // Declaração explícita para satisfazer compiladores estritos
    public readonly props: Props;
    public state: State;

    constructor(props: Props) {
        super(props);
        this.props = props;
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-red-50/50 rounded-2xl border border-red-100 my-4 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Ops! Algo deu errado.</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-sm">
                        Não foi possível carregar esta seção. Isso pode acontecer devido a falha de conexão ou erro no módulo.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <RefreshCw size={16} />
                        Recarregar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
