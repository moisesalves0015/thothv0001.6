
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import UtilityHeader from './components/UtilityHeader';

// Pages - Importação de todas as páginas da aplicação
import Landing from './pages/Landing/Landing';
import Home from './pages/Home/Home';
import Estudos from './pages/Estudos/Estudos';
import Disciplinas from './pages/Disciplinas/Disciplinas';
import SubjectDetail from './pages/Disciplinas/SubjectDetail';
import Conexoes from './pages/Conexoes/Conexoes';
import SearchPage from './pages/Search/SearchPage';
import Eventos from './pages/Eventos/Eventos';
import Pesquisas from './pages/Pesquisas/Pesquisas';
import Vagas from './pages/Vagas/Vagas';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import BadgeCreator from './pages/Badges/BadgeCreator';
import PrinterLogin from './pages/Printers/PrinterLogin';
import PrinterDashboard from './pages/Printers/PrinterDashboard';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Support from './pages/Support/Support';
import Mensagens from './pages/Mensagens/Mensagens';
import Notificacoes from './pages/Notificacoes/Notificacoes';
import Onboarding from './pages/Auth/Onboarding';
import AdminPortal from './pages/Admin/AdminPortal';
import AdminRoute from './routes/AdminRoute';

/**
 * MainLayout
 * Componente de layout principal que envolve as páginas autenticadas.
 * Gerencia a exibição da Sidebar e Topbar.
 * 
 * @param {children} - O conteúdo da página a ser renderizado dentro do layout.
 */
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-transparent">
      {/* Barra superior fixa */}
      <Topbar />

      {/* Menu lateral retrátil */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Área principal de conteúdo com ajuste dinâmico de margem baseado no estado da Sidebar */}
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

/**
 * AppRoutes
 * Gerencia todas as rotas da aplicação.
 * Define rotas públicas, privadas e administrativas.
 */
import AppLoadingPage from './components/AppLoadingPage';

// ... (existing imports)

/**
 * AppRoutes
 * Gerencia todas as rotas da aplicação.
 * Define rotas públicas, privadas e administrativas.
 */
const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <AppLoadingPage />;

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" replace />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/home" replace />} />

      {/* Rotas Específicas (Impressoras) */}
      <Route path="/printers/login" element={<PrinterLogin />} />
      <Route path="/printers/dashboard" element={<PrinterDashboard />} />

      {/* Rota Administrativa Secreta */}
      <Route
        path="/portal-ultra-secreto-thoth-crm"
        element={
          <AdminRoute>
            <AdminPortal />
          </AdminRoute>
        }
      />

      {/* Rotas Protegidas (Requer Autenticação) */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
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
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

/**
 * App
 * Componente raiz da aplicação.
 * Envolve a aplicação com os Providers necessários (Auth, Theme, Router).
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
