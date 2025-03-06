import { BACKEND_URL } from '../config/config';

/**
 * Helper para realizar peticiones fetch al backend
 * @param {string} endpoint - Ruta relativa del endpoint (sin la URL base)
 * @param {Object} options - Opciones de fetch (method, headers, body, etc)
 * @returns {Promise} - Promesa con la respuesta
 */
export const fetchFromAPI = async (endpoint, options = {}) => {
  const url = `${BACKEND_URL}${endpoint}`;
  
  try {
    // Configurar headers por defecto
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Añadir token de autenticación si existe
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      throw new Error('No token provided');
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Si devuelve directamente el objeto JSON parseado
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en la solicitud');
    }
    
    return data;
  } catch (error) {
    console.error('Error en fetchFromAPI:', error);
    throw error;
  }
}; 