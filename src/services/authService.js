import axios from 'axios';
import { AUTH_CONSTANTS } from '../constants/auth';
import { gapi } from 'gapi-script';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: AUTH_CONSTANTS.API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': true
      }
    });

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // Si el error es 401 y no es un intento de renovación
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Intentar renovar el token
            const response = await this.refreshToken();
            if (response?.data?.token) {
              this._handleAuthResponse(response.data);
              originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this._clearAuth();
            window.location.href = '/login'; // Redirigir al login
          }
        }
        return Promise.reject(error);
      }
    );

    this.api.interceptors.request.use(config => {
      const token = sessionStorage.getItem('jwtToken');
      if (token) {
        console.log('Token encontrado:', token.substring(0, 20) + '...'); // Para debugging
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  setAuthHeader(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Header de autorización configurado');
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  async login(googleCredential, userPicture) {
    try {
      console.log('Iniciando login con credencial:', googleCredential ? 'presente' : 'ausente');

      const response = await this.api.post('/login', {
        token: googleCredential,
        picture: userPicture,
        gapiToken: gapi.client.getToken()?.access_token
      });

      console.log('Respuesta del servidor:', response.data);

      if (!response.data?.token) {
        throw new Error('No se recibió token del servidor');
      }

      this._handleAuthResponse(response.data);
      return response.data;
    } catch (error) {
      console.error('Error detallado en login:', error.response?.data || error.message);
      throw this._handleError(error);
    }
  }

  async checkSession() {
    try {
      const token = this.getStoredToken();
      console.log('Token recuperado:', token);
      if (!token) {
        console.log('check session - no token - authServices')
        return { authenticated: false };
      }

      this.setAuthHeader(token);
      console.log('check session - authServices')
      const response = await this.api.get('/check-session');
      return { ...response.data, authenticated: true };
    } catch (error) {
      return { authenticated: false, error };
    }
  }

  async logout() {
    try {
      await this.api.post('/logout');
      this._clearAuth();
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async updateUserProfile(data) {
    try {
      const token = this.getStoredToken();
      this.setAuthHeader(token);
      const response = await this.api.put('/update-user', data);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  isAdmin(email) {
    return email === AUTH_CONSTANTS.ADMIN_EMAIL;
  }

  getStoredToken() {
    return sessionStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.JWT_TOKEN);
  }

  _handleAuthResponse(data) {
    if (data.token) {
      //comprobacion si el servidor devolvio si el usuario normal no tiene grado, grupo y turno
      if (data.pvez) {
        console.log('Eres nuevo por aqui? ', data.pvez)
        sessionStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.FIRSTLOG, data.pvez);
      }
      sessionStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.JWT_TOKEN, data.token);
      console.log('Token almacenado:', sessionStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.JWT_TOKEN));
      this.setAuthHeader(data.token);
      console.log('Token guardado y configurado');
    }

    if (data.user) {
      const userData = {
        ...data.user,
        picture: data.user.picture || sessionStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.USER_PICTURE)
      };
      sessionStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
  }

  _clearAuth() {
    sessionStorage.clear();
    localStorage.clear();
    this.setAuthHeader(null);
  }

  _handleError(error) {
    if (error.response) {
      console.error('Server Error:', error.response.data);
      return error.response.data;
    } else if (error.request) {
      console.error('Network Error:', error.request);
      return { message: 'Error de conexión al servidor' };
    } else {
      console.error('Auth Error:', error.message);
      return { message: error.message };
    }
  }

  // Agregar método para renovar token
  async refreshToken() {
    try {
      const response = await this.api.post('/refresh-token');
      return response;
    } catch (error) {
      throw error;
    }
  }

  getToken() {
    return sessionStorage.getItem('jwtToken');
  }
}

export const authService = new AuthService();