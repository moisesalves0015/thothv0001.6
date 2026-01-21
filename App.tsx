
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import UtilityHeader from './components/UtilityHeader';

// Pages
import Landing from './pages/Landing/Landing';
import Home from './pages/Home/Home';
import Estudos from './pages/Estudos/Estudos';
import Disciplinas from './pages/Disciplinas/Disciplinas';
import SubjectDetail from './pages/Disciplinas/SubjectDetail';
import Conexoes from './pages/Conexoes/Conexoes';
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

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/home" replace />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/home" replace />} />
      <Route path="/printers/login" element={<PrinterLogin />} />
      <Route path="/printers/dashboard" element={<PrinterDashboard />} />

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
                <Route path="/conexoes" element={<Conexoes />} />
                <Route path="/eventos" element={<Eventos />} />
                <Route path="/pesquisas" element={<Pesquisas />} />
                <Route path="/vagas" element={<Vagas />} />
                <Route path="/badges/create" element={<BadgeCreator />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/mensagens" element={<Mensagens />} />
                <Route path="/notificacoes" element={<Notificacoes />} />
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
