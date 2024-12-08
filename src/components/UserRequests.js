import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Check, Edit, AlertCircle, Eye, Trash2, Minus, Plus } from 'lucide-react';
import { authService } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi'; // Importar icono de recarga

const UserRequests = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [pdfPreviewModal, setPdfPreviewModal] = useState({
    show: false,
    url: ''
  });
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshStatus, setRefreshStatus] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [solicitudesResponse, documentosResponse] = await Promise.all([
          authService.api.get('/solicitudes'),
          authService.api.get('/documentos')
        ]);

        console.log('Documentos recibidos:', documentosResponse.data); // Para debugging

        const userMap = solicitudesResponse.data.reduce((acc, solicitud) => {
          if (!solicitud.usuarioId) return acc;
          
          if (!acc[solicitud.usuarioId._id]) {
            acc[solicitud.usuarioId._id] = {
              userData: solicitud.usuarioId,
              solicitudes: [],
              documentos: []
            };
          }
          acc[solicitud.usuarioId._id].solicitudes.push(solicitud);
          return acc;
        }, {});

        // Asegurarse de que los documentos se asignen correctamente
        documentosResponse.data.forEach(documento => {
          if (documento.usuarioId && userMap[documento.usuarioId._id]) {
            userMap[documento.usuarioId._id].documentos.push(documento);
          }
        });

        console.log('UserMap después de procesar:', userMap); // Para debugging
        
        setUsers(Object.values(userMap));
      } catch (error) {
        console.error('Error al obtener usuarios y documentos:', error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.userData.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userData.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleStatusChange = async (id, newStatus, type = 'solicitud') => {
    try {
      const endpoint = type === 'solicitud' ? `/solicituds/${id}` : `/documentos/${id}`;
      const response = await authService.api.put(endpoint, { 
        estado: newStatus 
      });
      
      if (response.data) {
        setUsers(prevUsers => 
          prevUsers.map(user => ({
            ...user,
            [type === 'solicitud' ? 'solicitudes' : 'documentos']: 
              user[type === 'solicitud' ? 'solicitudes' : 'documentos'].map(item => 
                item._id === id 
                  ? { ...item, estado: newStatus }
                  : item
              )
          }))
        );

        setAlert({
          show: true,
          message: `${type === 'solicitud' ? 'Solicitud' : 'Documento'} ${newStatus} exitosamente`,
          type: newStatus === 'aprobado' ? 'success' : 'warning'
        });

        setTimeout(() => {
          setAlert({ show: false, message: '', type: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setAlert({
        show: true,
        message: `Error al actualizar estado`,
        type: 'error'
      });
    }
  };

  const handleViewPdf = (filePath) => {
    if (!filePath) {
      setAlert({
        show: true,
        message: 'No hay documento disponible',
        type: 'warning'
      });
      return;
    }
    
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    const fullPath = `${baseUrl}/${filePath}`;
    
    console.log('Intentando abrir PDF:', fullPath);
    
    setPdfPreviewModal({
      show: true,
      url: fullPath
    });
  };

  const updateDocumentList = (newDocument) => {
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.userData._id === newDocument.usuarioId) {
          return {
            ...user,
            documentos: [...user.documentos, newDocument]
          };
        }
        return user;
      })
    );
  };

  useEffect(() => {
    const handleNewDocument = (event) => {
      const newDocument = event.detail;
      updateDocumentList(newDocument);
    };

    window.addEventListener('newDocument', handleNewDocument);

    return () => {
      window.removeEventListener('newDocument', handleNewDocument);
    };
  }, []);

  const handleDeleteDocument = async (documentId, usuarioId) => {
    try {
      await authService.api.delete(`/documentos/${documentId}`);
      
      // Actualizar el estado local eliminando el documento
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.userData._id === usuarioId) {
            return {
              ...user,
              documentos: user.documentos.filter(doc => doc._id !== documentId)
            };
          }
          return user;
        })
      );

      setAlert({
        show: true,
        message: 'Documento eliminado exitosamente',
        type: 'success'
      });

      setTimeout(() => {
        setAlert({ show: false, message: '', type: '' });
      }, 3000);

    } catch (error) {
      console.error('Error al eliminar documento:', error);
      setAlert({
        show: true,
        message: 'Error al eliminar el documento',
        type: 'error'
      });
    }
  };

  const handleViewError = (error) => {
    console.error('Error al cargar PDF:', error);
    setAlert({
      show: true,
      message: 'Error al cargar el PDF',
      type: 'error'
    });
  };

  // Función para recargar los documentos
  const refreshDocuments = useCallback(async () => {
    try {
      if (selectedUser) {
        const response = await fetch(`/api/users/${selectedUser._id}/documents`, {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        const data = await response.json();
        
        // Actualizar solo los documentos del usuario seleccionado
        setSelectedUser(prev => ({
          ...prev,
          documentos: data.documentos
        }));

        // Actualizar la lista completa de usuarios si es necesario
        setUsers(prev => prev.map(user => 
          user._id === selectedUser._id 
            ? { ...user, documentos: data.documentos }
            : user
        ));
      }
    } catch (error) {
      console.error('Error al actualizar documentos:', error);
    }
  }, [selectedUser]);

  // Función para manejar la subida exitosa
  const handleUploadSuccess = useCallback(async (newDocument) => {
    setAlert({
      show: true,
      message: 'Documento subido exitosamente',
      type: 'success'
    });

    // Actualizar la interfaz inmediatamente
    if (selectedUser) {
      setSelectedUser(prev => ({
        ...prev,
        documentos: [...prev.documentos, newDocument]
      }));
    }

    // Recargar los documentos del servidor
    await refreshDocuments();
  }, [selectedUser, refreshDocuments]);

  // Función para recargar los datos
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setRefreshStatus(null);
    try {
      const [solicitudesResponse, documentosResponse] = await Promise.all([
        authService.api.get('/solicitudes'),
        authService.api.get('/documentos')
      ]);

      const userMap = solicitudesResponse.data.reduce((acc, solicitud) => {
        if (!solicitud.usuarioId) return acc;
        
        if (!acc[solicitud.usuarioId._id]) {
          acc[solicitud.usuarioId._id] = {
            userData: solicitud.usuarioId,
            solicitudes: [],
            documentos: []
          };
        }
        acc[solicitud.usuarioId._id].solicitudes.push(solicitud);
        return acc;
      }, {});

      // Asignar documentos
      documentosResponse.data.forEach(documento => {
        if (documento.usuarioId && userMap[documento.usuarioId._id]) {
          userMap[documento.usuarioId._id].documentos.push(documento);
        }
      });

      setUsers(Object.values(userMap));
      setRefreshStatus('success');
    } catch (error) {
      console.error('Error al recargar datos:', error);
      setRefreshStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setRefreshStatus(null), 3000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* Alerta flotante mejorada */}
      {alert.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down w-full max-w-md mx-auto">
          <div className={`
            shadow-2xl rounded-lg pointer-events-auto
            border-l-4 mx-4
            ${alert.type === 'success' ? 'bg-green-50 border-green-500' : 
              alert.type === 'error' ? 'bg-red-50 border-red-500' : 
              'bg-yellow-50 border-yellow-500'}
          `}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {alert.type === 'success' && (
                    <Check className={`h-8 w-8 text-green-500`} />
                  )}
                  {alert.type === 'error' && (
                    <X className={`h-8 w-8 text-red-500`} />
                  )}
                  {alert.type === 'warning' && (
                    <AlertCircle className={`h-8 w-8 text-yellow-500`} />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <p className={`
                    text-lg font-semibold
                    ${alert.type === 'success' ? 'text-green-800' : 
                      alert.type === 'error' ? 'text-red-800' : 
                      'text-yellow-800'}
                  `}>
                    {alert.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => setAlert({ show: false, message: '', type: '' })}
                    className={`
                      rounded-full p-1.5
                      transition-colors duration-200
                      ${alert.type === 'success' ? 'hover:bg-green-100 text-green-500' : 
                        alert.type === 'error' ? 'hover:bg-red-100 text-red-500' : 
                        'hover:bg-yellow-100 text-yellow-500'}
                    `}
                  >
                    <span className="sr-only">Cerrar</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Barra de búsqueda */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Solicitudes por Usuario
            </h2>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 
                transition-all duration-200 ${isLoading ? 'opacity-50' : ''}`}
              title="Recargar solicitudes"
            >
              <FiRefreshCw 
                className={`w-5 h-5 text-gray-600 dark:text-gray-300
                  ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Proyectores Unach</span>
            <button className="bg-red-500 text-white px-4 py-2 rounded">
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.userData._id}
              onClick={() => handleUserClick(user)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer 
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {user.userData.nombre}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.userData.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Grado: {user.userData.grado || 'N/A'}
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Grupo: {user.userData.grupo || 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Solicitudes: {user.solicitudes.length}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Solicitudes */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black bg-opacity-50">
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow">
              {/* Header del Modal */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-t-lg">
                <h3 className="text-xl font-semibold text-blue-800">
                  Solicitudes de {selectedUser.userData.nombre}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 ml-auto bg-transparent hover:bg-blue-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-blue-800" />
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6">
                {/* Pestañas para alternar entre solicitudes y documentos */}
                <div className="mb-4 border-b border-gray-200">
                  <ul className="flex flex-wrap -mb-px">
                    <li className="mr-2">
                      <button
                        onClick={() => setActiveTab('solicitudes')}
                        className={`inline-block p-4 ${
                          activeTab === 'solicitudes'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-600'
                        }`}
                      >
                        Solicitudes
                      </button>
                    </li>
                    <li className="mr-2">
                      <button
                        onClick={() => setActiveTab('documentos')}
                        className={`inline-block p-4 ${
                          activeTab === 'documentos'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-600'
                        }`}
                      >
                        Documentos
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="max-h-96 overflow-auto">
                  {activeTab === 'solicitudes' ? (
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            ID
                          </th>
                          <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Motivo
                          </th>
                          <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Fecha Inicio
                          </th>
                          <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Fecha Fin
                          </th>
                          <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Estado
                          </th>
                          <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedUser.solicitudes.map((solicitud) => (
                          <tr key={solicitud._id} className="hover:bg-gray-50">
                            <td className="p-3 text-sm">{solicitud._id.slice(-4)}</td>
                            <td className="p-3 text-sm">{solicitud.motivo}</td>
                            <td className="p-3 text-sm">{formatDate(solicitud.fechaInicio)}</td>
                            <td className="p-3 text-sm">{formatDate(solicitud.fechaFin)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                                  solicitud.estado === 'aprobado' ? 'bg-green-100 text-green-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {solicitud.estado}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                {solicitud.estado === 'pendiente' ? (
                                  <>
                                    <button
                                      onClick={() => handleStatusChange(solicitud._id, 'aprobado')}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                      title="Aprobar solicitud"
                                    >
                                      <Check className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(solicitud._id, 'rechazado')}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                      title="Rechazar solicitud"
                                    >
                                      <X className="w-5 h-5" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleStatusChange(solicitud._id, 'pendiente')}
                                    className="p-1 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                                    title="Marcar como pendiente"
                                  >
                                    <AlertCircle className="w-5 h-5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    // Aquí puedes agregar la lógica para editar
                                    console.log('Editar solicitud:', solicitud._id);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                  title="Editar solicitud"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Nombre del Archivo
                          </th>
                          <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Fecha de Subida
                          </th>
                          <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Estado
                          </th>
                          <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedUser.documentos.map((documento) => (
                          <tr key={documento._id} className="hover:bg-gray-50">
                            <td className="p-3 text-sm">
                              {documento.filePath.split('/').pop()}
                            </td>
                            <td className="p-3 text-sm">
                              {formatDate(documento.createdAt)}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${documento.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                                  documento.estado === 'aprobado' ? 'bg-green-100 text-green-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {documento.estado}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewPdf(documento.filePath)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                  title="Ver PDF"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(documento._id, documento.usuarioId)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                  title="Eliminar documento"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Footer del Modal */}
              <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 rounded-b-lg">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de previsualización de PDF */}
      {pdfPreviewModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-11/12 h-5/6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Previsualización del documento</h3>
              <button
                onClick={() => setPdfPreviewModal({ show: false, url: '' })}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="w-full h-[calc(100%-4rem)] relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              )}
              <embed
                src={pdfPreviewModal.url}
                type="application/pdf"
                className="w-full h-full"
                onLoad={() => setIsLoading(false)}
                onError={handleViewError}
              />
              
              {/* Fallback si embed no funciona */}
              <object
                data={pdfPreviewModal.url}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                  <p className="text-gray-600 mb-4">No se puede mostrar el PDF en el navegador</p>
                  <a 
                    href={pdfPreviewModal.url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Descargar PDF
                  </a>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}

      {refreshStatus && (
        <div 
          className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg
            transition-all duration-300 transform translate-y-0
            ${refreshStatus === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'}`}
        >
          <div className="flex items-center gap-2">
            {refreshStatus === 'success' 
              ? '✓ Solicitudes actualizadas correctamente'
              : '✕ Error al actualizar las solicitudes'}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRequests;