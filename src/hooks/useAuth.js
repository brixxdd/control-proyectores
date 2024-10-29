import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    userPicture: null,
    isLoading: true
  });
  
  const navigate = useNavigate();

  const updateAuthState = useCallback((updates) => {
    setAuthState(prev => ({
      ...prev,
      ...updates,
      isLoading: false
    }));
  }, []);

  const handleError = useCallback((error) => {
    console.error('Auth Error:', error);
    
    setAuthState({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      userPicture: null,
      isLoading: false
    });

    Swal.fire({
      icon: 'error',
      title: 'Error de autenticación',
      text: error.message || 'Ha ocurrido un error inesperado'
    });

    if (window.location.pathname !== '/signin') {
      navigate('/signin', { replace: true });
    }
  }, [navigate]);

  const handleLoginSuccess = useCallback(async (response) => {
    try {
      if (!response?.credential) {
        throw new Error('No se recibió credencial de Google');
      }

      const decoded = jwtDecode(response.credential);
      console.log('Google credential decoded:', decoded);

      const authResponse = await authService.login(response.credential, decoded.picture);
      console.log('Auth response:', authResponse);
      
      if (!authResponse?.user) {
        throw new Error('No se recibió información del usuario');
      }

      const isAdmin = authService.isAdmin(decoded.email);
      
      // Primero actualizamos el estado
      await setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        isAdmin,
        user: authResponse.user,
        userPicture: decoded.picture,
        isLoading: false
      }));

      // Después de actualizar el estado, navegamos
      const redirectPath = isAdmin ? '/admin-dashboard' : '/dashboard';
      console.log('Redirigiendo a:', redirectPath);
      navigate(redirectPath, { replace: true });

    } catch (error) {
      console.error('Login error:', error);
      handleError(error);
      Swal.fire({
        icon: 'error',
        title: 'Error de inicio de sesión',
        text: error.message || 'Error al iniciar sesión'
      });
    }
  }, [navigate, handleError]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.checkSession();
      
      if (response.authenticated && response.user) {
        updateAuthState({
          isAuthenticated: true,
          isAdmin: authService.isAdmin(response.user.email),
          user: response.user,
          userPicture: response.user.picture,
          isLoading: false
        });
      } else {
        updateAuthState({
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          userPicture: null,
          isLoading: false
        });
      }
    } catch (error) {
      handleError(error);
    }
  }, [updateAuthState, handleError]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      updateAuthState({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        userPicture: null,
        isLoading: false
      });
      navigate('/signin', { replace: true });
    } catch (error) {
      handleError(error);
    }
  }, [navigate, updateAuthState, handleError]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    updateAuthState,
    handleLoginSuccess,
    handleLogout,
    checkAuth
  };
};