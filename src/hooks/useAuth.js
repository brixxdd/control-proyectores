import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { AUTH_CONSTANTS } from '../constants/auth';

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

      if (decoded.email !== AUTH_CONSTANTS.ADMIN_EMAIL && !decoded.email.endsWith('@unach.mx')) {
        throw new Error('Solo se permiten correos institucionales (@unach.mx) o administradores autorizados');
      }

      const authResponse = await authService.login(response.credential, decoded.picture);
      
      if (!authResponse?.user) {
        throw new Error('No se recibió información del usuario');
      }

      const isAdmin = decoded.email === AUTH_CONSTANTS.ADMIN_EMAIL;
      
      setAuthState({
        isAuthenticated: true,
        isAdmin,
        user: authResponse.user,
        userPicture: decoded.picture,
        isLoading: false
      });

      Swal.fire({
        icon: 'success',
        title: `Bienvenido${isAdmin ? ' Administrador' : ''}`,
        text: `Has iniciado sesión como ${decoded.email}`,
        timer: 2000,
        showConfirmButton: false
      });

      const redirectPath = isAdmin ? '/admin-dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });

    } catch (error) {
      console.error('Login error:', error);
      handleError(error);
    }
  }, [navigate, handleError]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.checkSession();
      
      if (response.authenticated && response.user) {
        setAuthState({
          isAuthenticated: true,
          isAdmin: authService.isAdmin(response.user.email),
          user: response.user,
          userPicture: response.user.picture,
          isLoading: false
        });
      } else {
        setAuthState({
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
  }, [handleError]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      setAuthState({
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
  }, [navigate, handleError]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    handleLoginSuccess,
    handleLogout,
    checkAuth
  };
};