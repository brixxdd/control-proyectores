import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { authService } from '../services/authService';
import { AUTH_CONSTANTS } from '../constants/auth';

const AsignarProyectorModal = ({ show, onClose, solicitud, onAsignar, className }) => {
  const [nuevoProyector, setNuevoProyector] = useState({
    grado: '',
    grupo: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCrearProyector = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      console.log('Enviando datos:', nuevoProyector);
      
      const response = await authService.api.post('/api/proyectores', nuevoProyector);
      
      console.log('Respuesta:', response.data);
      onAsignar(response.data);
      onClose();
    } catch (error) {
      console.error('Error detallado:', error.response?.data || error);
      setError(
        error.response?.data?.message || 
        'Error al crear proyector. Por favor, intenta de nuevo.'
      );
    }
  };

  return (
    show && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full relative z-50">
          <h2 className="text-xl font-bold mb-4">Crear Nuevo Proyector</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleCrearProyector}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Grado</label>
              <input
                type="text"
                value={nuevoProyector.grado}
                onChange={(e) => setNuevoProyector({...nuevoProyector, grado: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Grupo</label>
              <input
                type="text"
                value={nuevoProyector.grupo}
                onChange={(e) => setNuevoProyector({...nuevoProyector, grupo: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Proyector'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default AsignarProyectorModal; 