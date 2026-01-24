
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => { },
});

/**
 * ThemeProvider
 * Gerencia o tema da aplicação (Claro/Escuro).
 * Persiste a preferência do usuário no localStorage com uma chave única por usuário.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Efeito 1: Sincroniza o estado inicial quando o usuário loga ou desloga
  // Recupera a preferência salva se o usuário estiver logado
  useEffect(() => {
    const root = window.document.documentElement;

    if (user) {
      const themeKey = `thoth-theme-${user.uid}`;
      const saved = localStorage.getItem(themeKey);
      const shouldBeDark = saved === 'dark';

      setIsDarkMode(shouldBeDark);
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else {
      // Logout: Limpa tudo e força modo claro como padrão
      setIsDarkMode(false);
      root.classList.remove('dark');
    }
  }, [user]);

  // Efeito 2: Salva a preferência quando o toggle é acionado
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

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para acessar o tema
export const useTheme = () => useContext(ThemeContext);
