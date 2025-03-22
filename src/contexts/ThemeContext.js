import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'default';
  });

  const updateTheme = async (newTheme) => {
    try {
      // Primero actualizamos localmente
      setCurrentTheme(newTheme);
      localStorage.setItem('appTheme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Disparamos el evento para actualizar otros componentes
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
      
      // Luego actualizamos en el backend
      await authService.api.put('/update-theme', { theme: newTheme });
      
    } catch (error) {
      console.error('Error al actualizar el tema:', error);
      toast.error('Error al guardar el tema');
      // Revertir cambios si hay error
      const previousTheme = localStorage.getItem('appTheme') || 'default';
      setCurrentTheme(previousTheme);
    }
  };

  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        // Verificar si hay un token en sessionStorage
        const token = sessionStorage.getItem('jwtToken');
        if (token) {
          const response = await authService.api.get('/user-theme');
          const serverTheme = response.data.theme;
          if (serverTheme) {
            setCurrentTheme(serverTheme);
            localStorage.setItem('appTheme', serverTheme);
          }
        }
      } catch (error) {
        console.error('Error al cargar el tema del usuario:', error);
      }
    };

    loadUserTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme: updateTheme }}>
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