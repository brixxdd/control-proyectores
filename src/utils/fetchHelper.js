import { BACKEND_URL } from '../config/config';

/**
 * Helper para realizar peticiones fetch al backend
 * @param {string} endpoint - Ruta relativa del endpoint (sin la URL base)
 * @param {Object} options - Opciones de fetch (method, headers, body, etc)
 * @returns {Promise} - Promesa con la respuesta
 */
export const fetchFromAPI = async (endpoint, options = {}) => {
  try {
    const baseURL = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000'
      : BACKEND_URL;
    
    const url = `${baseURL}${endpoint}`;
    console.log('Realizando petición a:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en fetchFromAPI:', error);
    throw error;
  }
}; 