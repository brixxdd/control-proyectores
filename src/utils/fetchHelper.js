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
    
    // Obtener el token de sessionStorage
    const token = sessionStorage.getItem('jwtToken');
    
    const url = `${baseURL}${endpoint}`;
    console.log('Realizando petición a:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      // Si el token expiró o es inválido
      if (response.status === 401) {
        console.error('Error de autenticación - Token inválido o expirado');
        // Opcionalmente, redirigir al login o refrescar el token
      }
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en fetchFromAPI:', error);
    throw error;
  }
}; 