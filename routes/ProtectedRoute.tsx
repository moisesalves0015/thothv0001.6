
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff5f7]">
        <div className="text-[40px] font-black text-[#006c55] tracking-tighter mb-4">thoth</div>
        <Loader2 className="animate-spin text-[#006c55]" size={32} />
      </div>
    );
  }

  if (!user) {
    // Redireciona para o login salvando a intenção de navegação
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
