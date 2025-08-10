import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload, faChartBar, faCalendarAlt, faFilter, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentThemeStyles } from '../themes/themeConfig';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

function ReportGenerator() {
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: getLastMonthDate(),
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    estado: 'todos', // 'todos', 'pendiente', 'aprobado', 'rechazado'
    turno: 'todos' // 'todos', 'matutino', 'vespertino'
  });
  const reportRef = useRef(null);

  // Función para obtener la fecha de hace un mes
  function getLastMonthDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Limpiar errores anteriores al iniciar la carga
    try {
      console.log('Solicitando datos de reporte con parámetros:', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        estado: filterOptions.estado,
        turno: filterOptions.turno
      });

      const response = await authService.api.get('/api/reports', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          estado: filterOptions.estado,
          turno: filterOptions.turno
        }
      });

      console.log('Respuesta de la API de reportes:', response.data);
      setReportData(response.data);
    } catch (error) {
      console.error('Error al obtener datos del reporte:', error);
      console.error('Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      setReportData(null); // Limpiar datos anteriores en caso de error

      // Guardar el error para mostrarlo al usuario
      if (error.response?.status === 401) {
        setError('No tienes permisos para acceder a este reporte. Verifica tu sesión.');
      } else if (error.response?.status === 403) {
        setError('Acceso denegado. Solo los administradores pueden ver este reporte.');
      } else if (error.response?.status === 500) {
        setError('Error del servidor. Intenta nuevamente más tarde.');
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        setError('Error de conexión. Verifica tu conexión a internet.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, filterOptions]);

  useEffect(() => {
    console.log('ReportGenerator: useEffect activado para obtener datos...');
    fetchReportData();
  }, [fetchReportData]);

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (e) => {
    setFilterOptions({
      ...filterOptions,
      [e.target.name]: e.target.value
    });
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;

    try {
      setIsLoading(true);
      
      // Mostrar mensaje de procesamiento
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      
      Toast.fire({
        icon: 'info',
        title: 'Generando reporte, por favor espere...'
      });
      
      // Capturar el contenido del reporte
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight,
        onclone: (document, element) => {
          // Asegurar que todos los elementos estén visibles para la captura
          element.style.height = 'auto';
          element.style.overflow = 'visible';
        }
      });
      
      // Convertir a blob y guardar
      canvas.toBlob(function(blob) {
        saveAs(blob, `reporte-proyectores-${new Date().toISOString().split('T')[0]}.png`);
        setIsLoading(false);
        
        // Mostrar mensaje de éxito
        Toast.fire({
          icon: 'success',
          title: 'Reporte generado con éxito'
        });
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      setIsLoading(false);
      
      // Mostrar mensaje de error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el reporte. Intente nuevamente.',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'aprobado': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rechazado': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen w-full p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Generador de Reportes
          </h1>
          <button
            onClick={generatePDF}
            disabled={isLoading || !reportData}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${themeStyles.button} text-white disabled:opacity-50`}
          >
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faFileDownload} />
            )}
            Descargar Reporte
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} />
            Filtros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={filterOptions.estado}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Turno
              </label>
              <select
                name="turno"
                value={filterOptions.turno}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="todos">Todos</option>
                <option value="matutino">Matutino</option>
                <option value="vespertino">Vespertino</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-gray-400" />
          </div>
        ) : reportData ? (
          <div ref={reportRef} className="space-y-6">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`bg-gradient-to-r ${themeStyles.gradient} rounded-lg shadow-md p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Total Solicitudes</h3>
                    <p className="text-3xl font-bold">{reportData.totalSolicitudes}</p>
                    <p className="text-sm opacity-80">En el período seleccionado</p>
                  </div>
                  <FontAwesomeIcon icon={faChartBar} size="3x" className="opacity-50" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Solicitudes Aprobadas</h3>
                    <p className="text-3xl font-bold">{reportData.solicitudesPorEstado.aprobado}</p>
                    <p className="text-sm opacity-80">{Math.round((reportData.solicitudesPorEstado.aprobado / reportData.totalSolicitudes) * 100)}% del total</p>
                  </div>
                  <FontAwesomeIcon icon={faChartBar} size="3x" className="opacity-50" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Solicitudes Pendientes</h3>
                    <p className="text-3xl font-bold">{reportData.solicitudesPorEstado.pendiente}</p>
                    <p className="text-sm opacity-80">{Math.round((reportData.solicitudesPorEstado.pendiente / reportData.totalSolicitudes) * 100)}% del total</p>
                  </div>
                  <FontAwesomeIcon icon={faChartBar} size="3x" className="opacity-50" />
                </div>
              </div>
            </div>

            {/* Gráficos visuales (simulados con divs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faChartBar} />
                  Solicitudes por Estado
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aprobadas</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {Math.round((reportData.solicitudesPorEstado.aprobado / reportData.totalSolicitudes) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${(reportData.solicitudesPorEstado.aprobado / reportData.totalSolicitudes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pendientes</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {Math.round((reportData.solicitudesPorEstado.pendiente / reportData.totalSolicitudes) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-500 h-2.5 rounded-full" 
                        style={{ width: `${(reportData.solicitudesPorEstado.pendiente / reportData.totalSolicitudes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rechazadas</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {Math.round((reportData.solicitudesPorEstado.rechazado / reportData.totalSolicitudes) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-red-600 h-2.5 rounded-full" 
                        style={{ width: `${(reportData.solicitudesPorEstado.rechazado / reportData.totalSolicitudes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faChartBar} />
                  Solicitudes por Turno
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Matutino</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {Math.round((reportData.solicitudesPorTurno.matutino / reportData.totalSolicitudes) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(reportData.solicitudesPorTurno.matutino / reportData.totalSolicitudes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vespertino</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {Math.round((reportData.solicitudesPorTurno.vespertino / reportData.totalSolicitudes) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        style={{ width: `${(reportData.solicitudesPorTurno.vespertino / reportData.totalSolicitudes) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de últimas solicitudes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} />
                Últimas Solicitudes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700">
                      <th className="p-3 text-gray-700 dark:text-gray-200">Usuario</th>
                      <th className="p-3 text-gray-700 dark:text-gray-200">Fecha</th>
                      <th className="p-3 text-gray-700 dark:text-gray-200">Turno</th>
                      <th className="p-3 text-gray-700 dark:text-gray-200">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="dark:text-gray-300">
                    {reportData.ultimasSolicitudes.map((solicitud) => (
                      <tr key={solicitud.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-3">{solicitud.usuario}</td>
                        <td className="p-3">{solicitud.fecha}</td>
                        <td className="p-3">{solicitud.turno}</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(solicitud.estado)}`}>
                            {solicitud.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="text-red-500 dark:text-red-400 mb-4">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Error al cargar datos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={fetchReportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No hay datos disponibles para el período seleccionado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportGenerator;
