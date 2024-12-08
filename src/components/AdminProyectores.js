import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Monitor } from 'lucide-react';

const AdminProyectores = () => {
  const [proyectores, setProyectores] = useState([]);

  useEffect(() => {
    const fetchProyectores = async () => {
      try {
        const response = await axios.get('/api/proyectores');
        setProyectores(response.data);
      } catch (error) {
        console.error('Error al obtener los proyectores:', error);
      }
    };

    fetchProyectores();
  }, []);

  const getEstadoColor = (estado) => {
    const colors = {
      'en uso': 'bg-yellow-100 text-yellow-800',
      'en espera de recolección': 'bg-blue-100 text-blue-800',
      'devuelto': 'bg-green-100 text-green-800',
      'reservado': 'bg-purple-100 text-purple-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Monitor className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Estado de Proyectores
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Observaciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {proyectores.map(proyector => (
              <tr key={proyector._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {proyector.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {proyector.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {proyector.ubicacion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(proyector.estado)}`}>
                    {proyector.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  {proyector.observaciones}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProyectores; 