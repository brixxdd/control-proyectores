import { BACKEND_URL } from '../config/config';

/**
 * Helper para realizar peticiones fetch al backend
 * @param {string} endpoint - Ruta relativa del endpoint (sin la URL base)
 * @param {Object} options - Opciones de fetch (method, headers, body, etc)
 * @returns {Promise} - Promesa con la respuesta
 */
export const fetchFromAPI = async (endpoint, options = {}) => {
  const url = `${BACKEND_URL}${endpoint}`;
  
  // Configurar headers por defecto
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Añadir token de autenticación si existe
  const token = sessionStorage.getItem('jwtToken');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Manejar errores HTTP
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `Error HTTP: ${response.status} ${response.statusText}`
    }));
    throw error;
  }
  
  return response.json();
}; 