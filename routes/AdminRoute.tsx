
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, userProfile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff5f7]">
                <div className="text-[40px] font-black text-[#006c55] tracking-tighter mb-4">thoth</div>
                <Loader2 className="animate-spin text-[#006c55]" size={32} />
            </div>
        );
    }

    // Debug para identificar o problema de acesso
    console.log("AdminRoute Check:", {
        uid: user?.uid,
        role: userProfile?.role,
        isAuthorized: userProfile?.role?.toLowerCase() === 'admin'
    });

    // Se não houver usuário ou o perfil não for de admin, redireciona para a home
    if (!user || userProfile?.role?.toLowerCase() !== 'admin') {
        if (user && userProfile) {
            console.warn(`Acesso negado para o cargo: ${userProfile.role}`);
        }
        return <Navigate to="/home" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
