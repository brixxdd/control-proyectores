import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { Projector, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProyectores = () => {
  const [proyectores, setProyectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [proyectorEditar, setProyectorEditar] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    grado: '',
    grupo: '',
    estado: 'disponible',
    turno: 'Matutino'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [proyectorToDelete, setProyectorToDelete] = useState(null);
  const [turnoFilter, setTurnoFilter] = useState('todos');

  const cargarProyectores = async () => {
    try {
      console.log("Intentando cargar proyectores...");
      const response = await authService.api.get('/api/proyectores');
      console.log("Respuesta recibida:", response.data);
      
      const proyectoresOrdenados = response.data.sort((a, b) => {
        if (a.grado === b.grado) {
          return a.grupo.localeCompare(b.grupo);
        }
        return a.grado - b.grado;
      });
      
      setProyectores(proyectoresOrdenados);
      setError(null);
    } catch (error) {
      console.error('Error al cargar proyectores:', error);
      
      // Mostrar información más detallada sobre el error
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Código de estado:', error.response.status);
        setError(`Error ${error.response.status}: ${error.response.data.message || 'Error al cargar los proyectores'}`);
      } else if (error.request) {
        // La solicitud se realizó pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor');
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        // Algo ocurrió al configurar la solicitud
        console.error('Error de configuración:', error.message);
        setError(`Error: ${error.message}`);
      }
      
      toast.error('Error al cargar los proyectores. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProyectores();
  }, []);

  const handleEditar = (proyector) => {
    setProyectorEditar(proyector);
    setFormData({
      codigo: proyector.codigo,
      grado: proyector.grado,
      grupo: proyector.grupo,
      estado: proyector.estado,
      turno: proyector.turno
    });
    setShowModal(true);
  };

  const handleBorrar = (proyector) => {
    setProyectorToDelete(proyector);
    setShowDeleteModal(true);
  };

  const confirmarBorrado = async () => {
    try {
      await authService.api.delete(`/api/proyectores/${proyectorToDelete._id}`);
      setProyectores(proyectores.filter(p => p._id !== proyectorToDelete._id));
      toast.success('Proyector eliminado exitosamente');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error al eliminar proyector:', error);
      toast.error('Error al eliminar el proyector');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones en el frontend
    const gradoNum = parseInt(formData.grado);
    if (isNaN(gradoNum) || gradoNum < 1 || gradoNum > 7) {
      toast.error('El grado debe ser un número entre 1 y 7');
      return;
    }

    const grupoUpper = formData.grupo.toUpperCase();
    if (!/^[A-F]$/.test(grupoUpper)) {
      toast.error('El grupo debe ser una letra entre A y F');
      return;
    }

    try {
      const dataToSend = {
        grado: gradoNum,
        grupo: grupoUpper,
        turno: formData.turno,
        estado: formData.estado
      };

      if (proyectorEditar) {
        const response = await authService.api.put(
          `/api/proyectores/${proyectorEditar._id}`, 
          dataToSend
        );
        setProyectores(proyectores.map(p => 
          p._id === proyectorEditar._id ? response.data : p
        ));
        toast.success('Proyector actualizado exitosamente');
      } else {
        const response = await authService.api.post('/api/proyectores', dataToSend);
        // Ordenar los proyectores después de agregar uno nuevo
        const nuevosProyectores = [...proyectores, response.data].sort((a, b) => {
          if (a.grado === b.grado) {
            return a.grupo.localeCompare(b.grupo);
          }
          return a.grado - b.grado;
        });
        setProyectores(nuevosProyectores);
        toast.success('Proyector creado exitosamente');
      }
      setShowModal(false);
      setProyectorEditar(null);
      setFormData({ 
        codigo: '', 
        grado: '', 
        grupo: '', 
        estado: 'disponible', 
        turno: 'Matutino' 
      });
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al guardar el proyector');
      }
    }
  };

  // Función para filtrar proyectores
  const filteredProyectores = proyectores
    .filter(p => 
      // Filtro de búsqueda
      (p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.grado.toString().includes(searchTerm) ||
       p.grupo.toLowerCase().includes(searchTerm.toLowerCase()))
      && 
      // Filtro por turno
      (turnoFilter === 'todos' || p.turno === turnoFilter)
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              Gestión de Proyectores
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Administra los proyectores del sistema
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => {
                setShowModal(true);
                setProyectorEditar(null);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Proyector
            </button>
          </div>
        </div>

        {/* Barra de filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Búsqueda existente */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Buscar proyector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro por turno */}
          <div className="md:w-48">
            <select
              value={turnoFilter}
              onChange={(e) => setTurnoFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="todos">Todos los turnos</option>
              <option value="Matutino">Matutino</option>
              <option value="Vespertino">Vespertino</option>
            </select>
          </div>
        </div>

        {/* Grid de Proyectores */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProyectores.map((proyector) => (
            <div
              key={proyector._id}
              className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Projector className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {proyector.codigo}
                      </h3>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditar(proyector)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit2 className="h-5 w-5 text-gray-500 hover:text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleBorrar(proyector)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Trash2 className="h-5 w-5 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Grado: {proyector.grado}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Grupo: {proyector.grupo}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Turno: {proyector.turno}
                  </p>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      proyector.estado === 'disponible'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : proyector.estado === 'en uso'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {proyector.estado}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal mejorado */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm animate-fade-in"></div>
            </div>

            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all w-full max-w-md p-6 animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {proyectorEditar ? 'Editar Proyector' : 'Nuevo Proyector'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setProyectorEditar(null);
                  }}
                  className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Campo Código */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Projector className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.codigo}
                        onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                        required
                        placeholder="Ej: PRY-5e-9786"
                      />
                    </div>
                  </div>

                  {/* Campo Grado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Grado
                    </label>
                    <input
                      type="text"
                      value={formData.grado}
                      onChange={(e) => setFormData({...formData, grado: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                      placeholder="Ej: 5"
                    />
                  </div>

                  {/* Campo Grupo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Grupo
                    </label>
                    <input
                      type="text"
                      value={formData.grupo}
                      onChange={(e) => setFormData({...formData, grupo: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                      placeholder="Ej: E"
                    />
                  </div>

                  {/* Campo Turno */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Turno
                    </label>
                    <select
                      value={formData.turno}
                      onChange={(e) => setFormData({...formData, turno: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                    >
                      <option value="Matutino">Matutino</option>
                      <option value="Vespertino">Vespertino</option>
                    </select>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="en uso">En uso</option>
                      <option value="devuelto">Devuelto</option>
                    </select>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setProyectorEditar(null);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    {proyectorEditar ? 'Guardar Cambios' : 'Crear Proyector'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              onClick={() => setShowDeleteModal(false)}
            ></div>

            {/* Modal */}
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  {/* Ícono de advertencia */}
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                    <svg 
                      className="w-6 h-6 text-red-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                      />
                    </svg>
                  </div>

                  {/* Contenido */}
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Eliminar Proyector
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas eliminar el proyector{' '}
                        <span className="font-semibold text-gray-700">
                          {proyectorToDelete?.codigo}
                        </span>
                        ? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmarBorrado}
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProyectores; 