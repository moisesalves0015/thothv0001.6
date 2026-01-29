
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../firebase/index';
import { onSnapshot, doc } from 'firebase/firestore';
import { UserService } from '../modules/user/user.service';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

// Criação do contexto com valores iniciais
const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshUser: async () => { }
});

/**
 * AuthProvider
 * Provedor de autenticação que envolve a aplicação.
 * Monitora o estado de autenticação do Firebase e sincroniza o perfil do usuário do Firestore.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    // Escuta mudanças no estado de autenticação (login/logout do Firebase)
    // Escuta mudanças no estado de autenticação (login/logout do Firebase)
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // Se tivermos um listener anterior de perfil, cancelamos
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        // Define persistência explícita para garantir
        // (Opcional, mas ajuda se algo estiver resetando)

        // Se o usuário estiver logado, escuta mudanças no documento de perfil
        try {
          unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data());
            } else {
              // Se não tiver perfil, tenta buscar ou define null mas mantém user logado
              console.warn("Perfil de usuário não encontrado no Firestore.");
              setUserProfile(null);
            }
            setLoading(false);
          }, (error) => {
            console.error("Erro ao escutar perfil do usuário:", error);
            // Mesmo com erro no perfil, o usuário está autenticado
            setLoading(false);
          });
        } catch (err) {
          console.error("Erro setup profile listener:", err);
          setLoading(false);
        }
      } else {
        // Usuário deslogado
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Cleanup function para limpar os listeners quando o componente desmontar
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  /**
   * refreshUser
   * Função auxiliar para recarregar manualmente os dados do usuário e perfil.
   * Útil após atualizações de perfil que não são refletidas automaticamente.
   */
  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const profile = await UserService.getUserProfile(auth.currentUser.uid);
      setUser({ ...auth.currentUser }); // Spreadeamos para garantir nova referência e re-render do React
      setUserProfile(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para fácil acesso ao contexto de autenticação
export const useAuth = () => useContext(AuthContext);
