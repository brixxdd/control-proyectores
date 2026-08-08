import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Swal from 'sweetalert2';
import { AUTH_CONSTANTS } from '../constants/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    userPicture: null,
    isLoading: true,
  });

  const navigate = useNavigate();

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

  const handleLogin = useCallback(async (email, password) => {
    try {
      const authResponse = await authService.login(email, password);

      if (!authResponse?.user) {
        throw new Error(authResponse?.message || 'No se recibió información del usuario');
      }

      sessionStorage.setItem('currentUser', JSON.stringify(authResponse.user));
      sessionStorage.setItem('jwtToken', authResponse.token);

      const isAdmin = authResponse.user.isAdmin || AUTH_CONSTANTS.ADMIN_EMAILS.includes(authResponse.user.email);

      setAuthState({
        isAuthenticated: true,
        isAdmin,
        user: authResponse.user,
        userPicture: authResponse.user.picture || null,
        isLoading: false,
      });

      Swal.fire({
        icon: 'success',
        title: `Bienvenido${isAdmin ? ' Administrador' : ''}`,
        text: `Has iniciado sesión como ${authResponse.user.email}`,
        timer: 2000,
        showConfirmButton: false
      });

      const redirectPath = isAdmin ? '/admin-dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });

      return authResponse;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [navigate, handleError]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.checkSession();

      if (response.authenticated && response.user) {
        setAuthState({
          isAuthenticated: true,
          isAdmin: response.user.email && AUTH_CONSTANTS.ADMIN_EMAILS.includes(response.user.email),
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
      console.error('Logout error:', error);
      handleError(error);
    }
  }, [navigate, handleError]);

  const updateUserData = useCallback((updatedData) => {
    setAuthState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        ...updatedData
      }
    }));

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        ...updatedData
      };
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    handleLogin,
    handleLogout,
    checkAuth,
    updateUserData
  };
};
