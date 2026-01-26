import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import UtilityHeader from './components/UtilityHeader';
import AppLoadingPage from './components/AppLoadingPage';
import InstallPWA from './components/InstallPWA';
import { WifiOff, Wifi } from 'lucide-react';
import { Toaster, toast } from 'sonner';

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

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-transparent">
      <Topbar />
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 min-h-screen pt-[72px] lg:pt-[24px] ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'} ml-0 flex flex-col items-center overflow-x-hidden`}>
        <div className="w-full px-4 md:px-6 lg:px-0 lg:w-[1005px] flex flex-col box-border pb-12">
          <UtilityHeader />
          {children}
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
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" replace />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/home" replace />} />
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
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Suspense fallback={<AppLoadingPage />}>
                  <Routes>
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
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </Suspense>
              </MainLayout>
            </ProtectedRoute>
          }
        />
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
