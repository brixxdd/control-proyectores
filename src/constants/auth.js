export const AUTH_CONSTANTS = {
  ADMIN_EMAIL: 'proyectoresunach@gmail.com',
  API_BASE_URL: 'http://localhost:3000',
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  STORAGE_KEYS: {
    JWT_TOKEN: 'jwtToken',
    USER_DATA: 'currentUser',
    USER_PICTURE: 'userPicture',
    FIRSTLOG: 'new'
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

console.log('Environment variable:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log('CLIENT_ID:', AUTH_CONSTANTS.GOOGLE_CLIENT_ID);