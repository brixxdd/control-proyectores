export const AUTH_CONSTANTS = {
  ADMIN_EMAIL: 'proyectoresunach@gmail.com',
  API_BASE_URL: 'http://localhost:3000',
  GOOGLE_CLIENT_ID: '217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com',
  STORAGE_KEYS: {
    JWT_TOKEN: 'jwtToken',
    USER_DATA: 'currentUser',
    USER_PICTURE: 'userPicture',
    FIRSTLOG: 'new',
    JWT_REFRESH_TOKEN: 'jwtRefresh'
  },
  ERROR_MESSAGES: {
    NO_TOKEN: 'No token found',
    NETWORK_ERROR: 'Error de conexión al servidor',
    AUTH_ERROR: 'Error de autenticación'
  },
  CORS_SETTINGS: {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Credentials': true
    }
  }
};