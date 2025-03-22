import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken');
        if (token) {
          // Si hay sesión, cargar desde el backend
          const response = await authService.api.get('/user-theme');
          if (response.data) {
            setCurrentTheme(response.data.theme || 'default');
            setDarkMode(response.data.darkMode || false);
          }
        } else {
          // Si no hay sesión, cargar último tema usado
          const lastTheme = await authService.api.get('/last-theme');
          if (lastTheme.data) {
            setCurrentTheme(lastTheme.data.theme || 'default');
            setDarkMode(lastTheme.data.darkMode || false);
          }
        }
        
        // Aplicar tema y modo oscuro inmediatamente
        document.documentElement.setAttribute('data-theme', currentTheme);
        document.documentElement.classList.toggle('dark', darkMode);
      } catch (error) {
        console.error('Error al cargar el tema:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserTheme();
  }, [currentTheme, darkMode]);

  const changeTheme = async (newTheme) => {
    try {
      const token = sessionStorage.getItem('jwtToken');
      if (token) {
        await authService.api.put('/update-theme', { 
          theme: newTheme,
          darkMode // Incluir el modo oscuro en la actualización
        });
      }
      
      setCurrentTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      toast.success('Tema actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el tema:', error);
      toast.error('Error al actualizar el tema');
    }
  };

  const toggleDarkMode = async (isDark) => {
    try {
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
      
      const token = sessionStorage.getItem('jwtToken');
      if (token) {
        await authService.api.put('/update-theme', {
          theme: currentTheme,
          darkMode: isDark
        });
      }
    } catch (error) {
      console.error('Error al cambiar modo oscuro:', error);
      toast.error('Error al cambiar modo oscuro');
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      changeTheme,
      darkMode,
      toggleDarkMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 