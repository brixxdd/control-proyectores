import { BACKEND_URL } from '../config/config';

/**
 * Helper para realizar peticiones fetch al backend
 * @param {string} endpoint - Ruta relativa del endpoint (sin la URL base)
 * @param {Object} options - Opciones de fetch (method, headers, body, etc)
 * @returns {Promise} - Promesa con la respuesta
 */
export const fetchFromAPI = async (endpoint, options = {}) => {
  try {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const url = `${baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Añadir token de autenticación si existe
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const fetchOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
    
    console.log(`Realizando petición a: ${url}`, fetchOptions);
    
    const response = await fetch(url, fetchOptions);
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error en la petición (${response.status}): ${errorText}`);
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }
    
    // Verificar si la respuesta está vacía
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('La respuesta no es JSON. Content-Type:', contentType);
      const text = await response.text();
      
      // Si el texto está vacío, devolver un objeto vacío
      if (!text.trim()) {
        console.log('Respuesta vacía, devolviendo objeto vacío');
        return {};
      }
      
      // Intentar parsear como JSON de todas formas (por si el Content-Type es incorrecto)
      try {
        return JSON.parse(text);
      } catch (e) {
        console.warn('No se pudo parsear la respuesta como JSON:', text);
        // Devolver el texto como está
        return { text };
      }
    }
    
    // Parsear la respuesta como JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en fetchFromAPI:', error);
    throw error;
  }
}; 