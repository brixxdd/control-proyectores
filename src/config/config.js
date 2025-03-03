// Configuración centralizada para la aplicación

// URLs base
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3001';

// Configuración de autenticación
export const AUTH_CONFIG = {
  API_BASE_URL: BACKEND_URL,
  ADMIN_EMAIL: 'proyectoresunach@gmail.com',
  STORAGE_KEYS: {
    JWT_TOKEN: 'jwtToken',
    JWT_REFRESH_TOKEN: 'refreshToken',
    USER_DATA: 'userData',
    USER_PICTURE: 'userPicture',
    FIRSTLOG: 'firstLog'
  }
};

// Otras configuraciones globales
export const APP_CONFIG = {
  DEFAULT_TIMEOUT: 10000,
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
}; 