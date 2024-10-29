import axios from 'axios';
import { AUTH_CONSTANTS } from '../constants/auth';

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
      error => {
        if (error.response?.status === 401) {
          this._clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthHeader(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  async login(googleCredential, userPicture) {
    try {
      const response = await this.api.post('/login', {
        token: googleCredential,
        picture: userPicture
      });

      if (response.data?.token) {
        this._handleAuthResponse(response.data);
        return response.data;
      } else {
        throw new Error('No se recibió token de autenticación');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw this._handleError(error);
    }
  }

  async checkSession() {
    try {
      const token = this.getStoredToken();
      if (!token) {
        return { authenticated: false };
      }

      this.setAuthHeader(token);
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
      sessionStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.JWT_TOKEN, data.token);
      this.setAuthHeader(data.token);
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
}

export const authService = new AuthService();