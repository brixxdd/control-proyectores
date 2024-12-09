import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { Projector, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProyectores = () => {
  const [proyectores, setProyectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const cargarProyectores = async () => {
    try {
      const response = await authService.api.get('/api/proyectores');
      setProyectores(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar proyectores:', error);
      setError('Error al cargar los proyectores');
      toast.error('Error al cargar los proyectores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProyectores();
  }, []);

  const handleCrearProyector = async (nuevoProyector) => {
    try {
      const response = await authService.api.post('/api/proyectores', nuevoProyector);
      setProyectores([...proyectores, response.data]);
      toast.success('Proyector creado exitosamente');
      setShowModal(false);
    } catch (error) {
      console.error('Error al crear proyector:', error);
      toast.error('Error al crear el proyector');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Gestión de Proyectores
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nuevo Proyector
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proyectores.map((proyector) => (
          <div
            key={proyector._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Projector className="text-blue-500" size={24} />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {proyector.codigo}
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                  onClick={() => {/* Implementar edición */}}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                  onClick={() => {/* Implementar eliminación */}}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>Grado: {proyector.grado}</p>
              <p>Grupo: {proyector.grupo}</p>
              <p className="flex items-center gap-2">
                Estado: 
                <span className={`px-2 py-1 rounded-full text-xs ${
                  proyector.estado === 'disponible' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {proyector.estado}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para crear/editar proyector */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Nuevo Proyector</h2>
            {/* Aquí va el formulario */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={() => {/* Implementar creación */}}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProyectores; 