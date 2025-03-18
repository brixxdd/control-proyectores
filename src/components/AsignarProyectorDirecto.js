import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import AsignarProyectorModal from './AsignarProyectorModal';
import { alertaError, alertaExito } from './Alert';
import { ArrowLeft } from 'lucide-react';
import { alertService } from '../services/alertService';

const AsignarProyectorDirecto = () => {
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Usar un ref para controlar si ya se mostró una alerta
  const alertaShown = useRef(false);
  // Ref para controlar si el componente está montado
  const isMounted = useRef(true);

  useEffect(() => {
    // Limpiar el estado de alertas al montar el componente
    alertaShown.current = false;
    alertService.clearRecentAlerts();
    
    const fetchSolicitud = async () => {
      try {
        if (!isMounted.current) return;
        setLoading(true);
        setError(null);
        
        // Obtener parámetros de la URL
        const params = new URLSearchParams(location.search);
        const solicitudId = params.get('solicitudId');
        
        if (!solicitudId) {
          setError('No se proporcionó un ID de solicitud válido');
          setLoading(false);
          return;
        }
        
        console.log("Buscando solicitud con ID:", solicitudId);
        
        // Intentar obtener todas las solicitudes primero (más confiable)
        try {
          const allSolicitudesResponse = await authService.api.get('/solicitudes');
          const solicitudEncontrada = allSolicitudesResponse.data.find(
            sol => sol._id === solicitudId
          );
          
          if (solicitudEncontrada && isMounted.current) {
            console.log("Solicitud encontrada en listado completo:", solicitudEncontrada);
            setSolicitud(solicitudEncontrada);
            setShowModal(true);
            setLoading(false);
            return;
          }
        } catch (listError) {
          console.error("Error al obtener listado de solicitudes:", listError);
          // Continuar con el siguiente método si este falla
        }
        
        // Si no se encontró en el listado, intentar con el endpoint específico
        try {
          const response = await authService.api.get(`/solicitudes/id/${solicitudId}`);
          
          if (response.data && isMounted.current) {
            console.log("Solicitud encontrada por ID específico:", response.data);
            setSolicitud(response.data);
            setShowModal(true);
          } else if (isMounted.current) {
            setError('No se encontró la solicitud especificada');
          }
        } catch (idError) {
          console.error("Error al obtener la solicitud por ID:", idError);
          if (isMounted.current && !alertaShown.current) {
            setError('Error al obtener la solicitud. Verifique el código QR e intente nuevamente.');
          }
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    fetchSolicitud();
    
    // Limpiar al desmontar
    return () => {
      isMounted.current = false;
      alertaShown.current = true;
    };
  }, [location]);

  const handleAsignarSuccess = () => {
    if (!alertaShown.current) {
      alertaExito('Proyector asignado correctamente');
      alertaShown.current = true;
    }
    setShowModal(false);
    // Opcional: redirigir a otra página después de asignar
    // navigate('/admin-dashboard');
  };

  const handleVolver = () => {
    navigate(-1); // Volver a la página anterior
  };

  // Mostrar alerta de error solo una vez
  useEffect(() => {
    if (error && !alertaShown.current) {
      alertaError(error);
      alertaShown.current = true;
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={handleVolver}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="mr-1" size={16} />
          Volver
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Asignación directa de proyector
          </h1>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
              <p>{error}</p>
            </div>
          ) : !solicitud ? (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg">
              <p>No se encontró información de la solicitud</p>
            </div>
          ) : (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg">
              <p>Solicitud encontrada. Abriendo modal de asignación...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de asignación */}
      {solicitud && showModal && (
        <AsignarProyectorModal
          show={showModal}
          onClose={() => setShowModal(false)}
          solicitud={solicitud}
          onAsignar={handleAsignarSuccess}
        />
      )}
    </div>
  );
};

export default AsignarProyectorDirecto; 