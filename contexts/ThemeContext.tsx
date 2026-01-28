
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

  // Efeito 1: Sincroniza o estado inicial (Tema + Background) quando o usuário loga
  useEffect(() => {
    const root = window.document.documentElement;

    if (user) {
      // Carregar TEMA
      const themeKey = `thoth-theme-${user.uid}`;
      const savedTheme = localStorage.getItem(themeKey);
      const shouldBeDark = savedTheme === 'dark';

      setIsDarkMode(shouldBeDark);
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Carregar BACKGROUND
      const bgKey = `thoth-bg-${user.uid}`;
      const savedBg = localStorage.getItem(bgKey);

      if (savedBg) {
        setBackgroundImage(savedBg);
        root.style.setProperty('--bg-image', `url("${savedBg}")`);
      } else {
        setBackgroundImage(null);
        root.style.removeProperty('--bg-image');
      }

    } else {
      // Logout: Limpa tudo e restaura padrões
      setIsDarkMode(false);
      root.classList.remove('dark');
      setBackgroundImage(null);
      root.style.removeProperty('--bg-image');
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
  const setAppBackground = (url: string | null) => {
    if (!user) return;

    const root = window.document.documentElement;
    const bgKey = `thoth-bg-${user.uid}`;

    if (url) {
      setBackgroundImage(url);
      localStorage.setItem(bgKey, url);
      root.style.setProperty('--bg-image', `url("${url}")`);
    } else {
      setBackgroundImage(null);
      localStorage.removeItem(bgKey);
      root.style.removeProperty('--bg-image');
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
