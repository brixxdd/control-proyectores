import axios from 'axios';
import { AUTH_CONSTANTS } from '../constants/auth';
import { gapi } from 'gapi-script';
import Swal from 'sweetalert2';

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

        // Condiciones para intentar renovar el token
        const is401Error = error.response?.status === 401;
        const isNotRefreshTokenEndpoint = originalRequest.url !== '/refresh-token';
        const hasNotExceededRetries = !originalRequest._retryCount || originalRequest._retryCount < 2;

        if (is401Error && isNotRefreshTokenEndpoint && hasNotExceededRetries) {
          // Incrementar el contador de reintentos
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          try {
            // Intentar renovar el token
            const response = await this.refreshToken();
            
            if (response?.data?.token) {
              // Actualizar token en sesión y encabezados
              this._handleAuthResponse(response.data);
              
              // Clonar y actualizar la configuración original
              const updatedConfig = {
                ...originalRequest,
                headers: {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${response.data.token}`
                }
              };

              // Reintentar la solicitud original
              return this.api(updatedConfig);
            }
          } catch (refreshError) {
            console.error('Error al renovar token:', refreshError);
            // Limpiar autenticación y redirigir
            this._clearAuth();
            // Mostrar la alerta personalizada
            Swal.fire({
              icon: 'error',
              title: 'Es necesario volver a iniciar sesión',
              text:  'Token expirado',
              timer: 3000,
              showConfirmButton: false,
            }).then(() => {
              // Redirigir al usuario después de cerrar la alerta
              window.location.href = '/login';
            });
            // Rechazar la promesa para detener cualquier reintento adicional
            return Promise.reject(refreshError);
          }
        }

        // Para cualquier otro caso de error, rechazar la promesa
        return Promise.reject(error);
      }
    );


    this.api.interceptors.request.use(config => {
      const token = sessionStorage.getItem('jwtToken');
      // Evitar configurar encabezados globales en solicitudes de refresh
      if (token && config.url !== '/refresh-token') {
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

  getAuthHeaderWithRefreshToken() {
      const token = sessionStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.JWT_REFRESH_TOKEN);
      if (!token) {
          throw new Error('No refresh token found in session storage');
      }

      return { Authorization: `Bearer ${token}` };
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
      if(data.refreshToken) {sessionStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.JWT_REFRESH_TOKEN,data.refreshToken)}
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
        const headers = this.getAuthHeaderWithRefreshToken(); // Obtiene los encabezados
        return this.api.post('/refresh-token', {}, { headers }); // Usa los encabezados en esta solicitud
    } catch (error) {
        console.error('Error al obtener el refresh token:', error);
        throw error;
    }
  }

  getToken() {
    return sessionStorage.getItem('jwtToken');
  }
}

export const authService = new AuthService();