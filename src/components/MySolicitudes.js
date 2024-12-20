import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';
import { Check, X, Clock, Calendar, User, BookOpen } from 'lucide-react';
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const MySolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const obtenerSolicitudesSemanaActual = (solicitudes) => {
    const hoy = new Date();
    const inicioDeSemana = startOfWeek(hoy, { weekStartsOn: 1 });
    const finDeSemana = endOfWeek(hoy, { weekStartsOn: 1 });

    // Crear un mapa para agrupar por día
    const solicitudesPorDia = new Map();

    // Filtrar y agrupar por día
    solicitudes
      .filter(solicitud => {
        const fechaSolicitud = new Date(solicitud.fechaInicio);
        return isWithinInterval(fechaSolicitud, {
          start: inicioDeSemana,
          end: finDeSemana
        }) && fechaSolicitud.getDay() !== 0 && fechaSolicitud.getDay() !== 6;
      })
      .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
      .forEach(solicitud => {
        const fecha = new Date(solicitud.fechaInicio);
        const dia = fecha.getDay(); // 1-5 (Lunes-Viernes)
        
        // Solo guardar la primera solicitud de cada día
        if (!solicitudesPorDia.has(dia)) {
          solicitudesPorDia.set(dia, solicitud);
        }
      });

    // Convertir el mapa a array y ordenar por día
    const solicitudesFinales = Array.from(solicitudesPorDia.values())
      .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));

    return solicitudesFinales;
  };

  useEffect(() => {
    const fetchMySolicitudes = async () => {
      try {
        console.log('Iniciando fetch de solicitudes...');
        const response = await authService.api.get('/mis-solicitudes');
        
        if (!response.data || response.data.length === 0) {
          console.log('No se recibieron solicitudes del servidor');
          setSolicitudes([]);
        } else {
          console.log('Solicitudes recibidas:', response.data);
          const solicitudesFiltradas = obtenerSolicitudesSemanaActual(response.data);
          console.log('Solicitudes filtradas:', solicitudesFiltradas);
          setSolicitudes(solicitudesFiltradas);
        }
      } catch (error) {
        console.error('Error completo:', error);
        setError('Error al cargar tus solicitudes: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchMySolicitudes();
  }, []);

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'aprobado':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'rechazado':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusStyle = (estado) => {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Mis Solicitudes de la Semana
      </h2>
      
      {/* Indicador mejorado de semana actual */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          <h3 className="font-semibold text-blue-800 dark:text-blue-100">
            Semana Actual
          </h3>
        </div>
        <p className="text-blue-800 dark:text-blue-100">
          Del {startOfWeek(new Date(), { weekStartsOn: 1 }).toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })} al {endOfWeek(new Date(), { weekStartsOn: 1 }).toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-200 mt-2">
          Mostrando máximo una solicitud por día (Lunes a Viernes)
        </p>
      </div>

      {solicitudes.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-400">
            No hay solicitudes para esta semana
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Motivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Inicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {solicitudes.map((solicitud) => (
                <tr key={solicitud._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {solicitud._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {solicitud.motivo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(solicitud.fechaInicio).toLocaleString('es-MX', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(solicitud.fechaFin).toLocaleString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      solicitud.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                      solicitud.estado === 'rechazado' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {solicitud.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MySolicitudes; 