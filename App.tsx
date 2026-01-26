import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import UtilityHeader from './components/UtilityHeader';
import AppLoadingPage from './components/AppLoadingPage';
import InstallPWA from './components/InstallPWA';
import { WifiOff, Wifi, RefreshCcw } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { usePullToRefresh } from './hooks/usePullToRefresh';

// Pages - Lazy loading para otimização mobile
const Landing = lazy(() => import('./pages/Landing/Landing'));
const Home = lazy(() => import('./pages/Home/Home'));
const Estudos = lazy(() => import('./pages/Estudos/Estudos'));
const Disciplinas = lazy(() => import('./pages/Disciplinas/Disciplinas'));
const SubjectDetail = lazy(() => import('./pages/Disciplinas/SubjectDetail'));
const Conexoes = lazy(() => import('./pages/Conexoes/Conexoes'));
const SearchPage = lazy(() => import('./pages/Search/SearchPage'));
const Eventos = lazy(() => import('./pages/Eventos/Eventos'));
const Pesquisas = lazy(() => import('./pages/Pesquisas/Pesquisas'));
const Vagas = lazy(() => import('./pages/Vagas/Vagas'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Signup = lazy(() => import('./pages/Auth/Signup'));
const BadgeCreator = lazy(() => import('./pages/Badges/BadgeCreator'));
const PrinterLogin = lazy(() => import('./pages/Printers/PrinterLogin'));
const PrinterDashboard = lazy(() => import('./pages/Printers/PrinterDashboard'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Support = lazy(() => import('./pages/Support/Support'));
const Mensagens = lazy(() => import('./pages/Mensagens/Mensagens'));
const Notificacoes = lazy(() => import('./pages/Notificacoes/Notificacoes'));
const Onboarding = lazy(() => import('./pages/Auth/Onboarding'));
const AdminPortal = lazy(() => import('./pages/Admin/AdminPortal'));

const MainLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { pullDistance, isRefreshing } = usePullToRefresh(() => {
    window.location.reload();
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-transparent">
      <Topbar />
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Pull to Refresh Indicator */}
      <div
        className="fixed left-0 right-0 z-[9999] flex justify-center pointer-events-none transition-transform duration-200"
        style={{
          top: '0px',
          transform: `translateY(${pullDistance - 40}px)`,
          opacity: pullDistance > 20 ? 1 : 0
        }}
      >
        <div className={`bg-white dark:bg-slate-800 p-2 rounded-full shadow-xl border border-slate-200 dark:border-white/10 ${isRefreshing ? 'animate-spin' : ''}`}>
          <RefreshCcw size={20} className="text-[#006c55] dark:text-emerald-400" />
        </div>
      </div>

      <main className={`flex-1 transition-all duration-300 min-h-screen ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'} ml-0 flex flex-col items-center overflow-x-hidden pt-[76px] lg:pt-[24px]`} style={{ paddingTop: 'calc(var(--mobile-pt, 76px) + env(safe-area-inset-top))' }}>
        <style>{`
          @media (min-width: 1024px) {
            main { padding-top: 24px !important; }
          }
        `}</style>
        <div className="w-full px-4 md:px-6 lg:px-0 lg:w-[1005px] flex flex-col box-border pb-12">
          <UtilityHeader />
          <Suspense fallback={<AppLoadingPage />}>
            <Outlet />
          </Suspense>
          <footer className="text-center py-12 mt-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thoth Creative Suite • 2024</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <AppLoadingPage />;

  return (
    <Suspense fallback={<AppLoadingPage />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/printers/login" element={<PrinterLogin />} />
        <Route path="/printers/dashboard" element={<PrinterDashboard />} />
        <Route
          path="/portal-ultra-secreto-thoth-crm"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/estudos" element={<Estudos />} />
          <Route path="/disciplinas" element={<Disciplinas />} />
          <Route path="/disciplinas/:id" element={<SubjectDetail />} />
          <Route path="/explorar" element={<SearchPage />} />
          <Route path="/conexoes" element={<Conexoes />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/pesquisas" element={<Pesquisas />} />
          <Route path="/vagas" element={<Vagas />} />
          <Route path="/badges/create" element={<BadgeCreator />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/mensagens" element={<Mensagens />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="/suporte" element={<Support />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
  );
};

const OfflineNotification: React.FC = () => {
  useEffect(() => {
    const handleOnline = () => {
      toast.success('Conexão restabelecida', {
        icon: <Wifi size={16} />,
        description: 'Você está online novamente.'
      });
    };

    const handleOffline = () => {
      toast.error('Sem conexão com a internet', {
        icon: <WifiOff size={16} />,
        description: 'Você está navegando em modo offline.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <OfflineNotification />
          <InstallPWA />
          <Toaster richColors position="top-center" />
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
