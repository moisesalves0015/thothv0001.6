
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  backgroundImage: string | null;
  setAppBackground: (url: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => { },
  backgroundImage: null,
  setAppBackground: () => { },
});

/**
 * ThemeProvider
 * Gerencia o tema da aplicação (Claro/Escuro) e imagem de fundo customizada.
 * Persiste as preferências do usuário no localStorage com uma chave única por usuário.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  // Helper to apply background to root
  const applyBackground = (url: string | null) => {
    const root = window.document.documentElement;
    if (url) {
      root.style.setProperty('--bg-image', `url("${url}")`);
    } else {
      root.style.removeProperty('--bg-image');
    }
  };

  // Efeito 1: Sincroniza o estado inicial (Tema + Background) quando o usuário loga
  useEffect(() => {
    const root = window.document.documentElement;

    if (user) {
      // Carregar TEMA (LocalStorage é suficiente para tema por enquanto, ou podemos migrar também)
      const themeKey = `thoth-theme-${user.uid}`;
      const savedTheme = localStorage.getItem(themeKey);
      const shouldBeDark = savedTheme === 'dark';

      setIsDarkMode(shouldBeDark);
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Escutar mudanças no BACKGROUND do Firestore
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Verifica se existe preferência salva no perfil
          const bgUrl = data.preferences?.background || null;
          setBackgroundImage(bgUrl);
          applyBackground(bgUrl);
        }
      });

      return () => unsubscribe();

    } else {
      // Logout: Limpa tudo e restaura padrões
      setIsDarkMode(false);
      root.classList.remove('dark');
      setBackgroundImage(null);
      applyBackground(null);
    }
  }, [user]);

  // Função para alternar tema
  const toggleTheme = () => {
    if (!user) return;

    const root = window.document.documentElement;
    const newMode = !isDarkMode;
    const themeKey = `thoth-theme-${user.uid}`;

    setIsDarkMode(newMode);
    if (newMode) {
      root.classList.add('dark');
      localStorage.setItem(themeKey, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(themeKey, 'light');
    }
  };

  // Função para setar background
  const setAppBackground = async (url: string | null) => {
    if (!user) return;

    // Atualização Otimista
    setBackgroundImage(url);
    applyBackground(url);

    try {
      // Salva no Firestore para persistência entre dispositivos
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'preferences.background': url
      });
    } catch (error) {
      console.error("Erro ao salvar fundo personalizado:", error);
      // Opcional: Reverter em caso de erro
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, backgroundImage, setAppBackground }}>
      {children}
    </ThemeContext.Provider>
  );
};


// Hook para acessar o tema
export const useTheme = () => useContext(ThemeContext);
