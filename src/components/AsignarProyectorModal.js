import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { X, Search } from 'lucide-react';

const AsignarProyectorModal = ({ show, onClose, solicitud, onAsignar }) => {
  const [proyectoresDisponibles, setProyectoresDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const cargarProyectoresDisponibles = async () => {
      try {
        const response = await authService.api.get('/api/proyectores?estado=disponible');
        setProyectoresDisponibles(response.data);
      } catch (error) {
        console.error('Error al cargar proyectores:', error);
        setError('Error al cargar los proyectores disponibles');
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      cargarProyectoresDisponibles();
    }
  }, [show]);

  const handleAsignarProyector = async (proyector) => {
    try {
      // Actualizar estado de la solicitud a aprobado
      await authService.api.put(`/api/solicitudes/${solicitud._id}`, {
        estado: 'aprobado',
        proyectorId: proyector._id
      });

      // Actualizar estado del proyector a "en uso"
      await authService.api.put(`/api/proyectores/${proyector._id}`, {
        estado: 'en uso'
      });

      onAsignar(proyector);
      onClose();
    } catch (error) {
      console.error('Error al asignar proyector:', error);
      setError('Error al asignar el proyector. Por favor, intenta de nuevo.');
    }
  };

  return show && (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Asignar Proyector</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar proyector..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {proyectoresDisponibles
              .filter(p => 
                p.estado === 'disponible' && (
                  p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  `${p.grado}${p.grupo}`.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map(proyector => (
                <div
                  key={proyector._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAsignarProyector(proyector)}
                >
                  <h3 className="font-semibold text-lg">{proyector.codigo}</h3>
                  <p className="text-sm text-gray-600">Grado: {proyector.grado}</p>
                  <p className="text-sm text-gray-600">Grupo: {proyector.grupo}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                    proyector.estado === 'disponible'
                      ? 'bg-green-100 text-green-800'
                      : proyector.estado === 'en uso'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {proyector.estado}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AsignarProyectorModal; 