import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GradeGroupModal = ({ isOpen, onClose }) => {
  const [grade, setGrade] = useState('');
  const [group, setGroup] = useState('');
  const [shift, setShift] = useState('Matutino');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!grade || !group) {
      setAlert({
        show: true,
        message: 'Todos los campos son obligatorios',
        type: 'error'
      });
      setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem('jwtToken');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('http://localhost:3000/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ grado: grade, grupo: group, turno: shift }),
      });

      if (response.ok) {
        const data = await response.json();
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const updatedUser = {
          ...currentUser,
          grado: grade,
          grupo: group,
          turno: shift
        };
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        sessionStorage.removeItem('new');
        
        setAlert({
          show: true,
          message: 'Información actualizada correctamente',
          type: 'success'
        });
        
        setTimeout(() => {
          setAlert({ show: false, message: '', type: '' });
          window.location.reload();
        }, 2000);
      } else {
        const errorData = await response.json();
        setAlert({
          show: true,
          message: errorData.message || 'Error al actualizar la información',
          type: 'error'
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        message: error.message || 'Ocurrió un error en la solicitud',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Alerta flotante */}
      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className={`
              px-6 py-4 rounded-lg shadow-lg
              ${alert.type === 'success' 
                ? 'bg-green-50 border-l-4 border-green-500 text-green-700' 
                : 'bg-red-50 border-l-4 border-red-500 text-red-700'}
            `}>
              <div className="flex items-center">
                {alert.type === 'success' ? (
                  <svg className="w-6 h-6 mr-4 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 mr-4 text-red-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
                <p className="font-medium">{alert.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido del modal (mantener el resto igual pero eliminar el botón cancelar) */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-md" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg"
      >
        <div className="relative bg-white/95 dark:bg-gray-800/95 
                        backdrop-blur-sm rounded-2xl shadow-2xl 
                        border border-gray-100 dark:border-gray-700">
          {/* Header mejorado */}
          <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white 
                           bg-gradient-to-r from-blue-600 to-purple-600 
                           dark:from-blue-400 dark:to-purple-400 
                           bg-clip-text text-transparent">
              Información Académica
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Completa tus datos escolares
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Grado Input mejorado */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Grado Escolar
              </label>
              <input 
                type="text" 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 
                           bg-gray-50 dark:bg-gray-700 
                           border border-gray-200 dark:border-gray-600 
                           text-gray-900 dark:text-white
                           rounded-xl focus:ring-2 focus:ring-blue-500 
                           focus:border-blue-500 dark:focus:border-blue-400
                           transition-all duration-200 
                           hover:bg-gray-100 dark:hover:bg-gray-600"
                placeholder="Ejemplo: Primer grado"
                required 
              />
            </div>

            {/* Grupo Input mejorado */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Grupo
              </label>
              <input 
                type="text" 
                value={group} 
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-4 py-3 
                           bg-gray-50 dark:bg-gray-700 
                           border border-gray-200 dark:border-gray-600 
                           text-gray-900 dark:text-white
                           rounded-xl focus:ring-2 focus:ring-blue-500 
                           focus:border-blue-500 dark:focus:border-blue-400
                           transition-all duration-200 
                           hover:bg-gray-100 dark:hover:bg-gray-600"
                placeholder="Ejemplo: A"
                required 
              />
            </div>

            {/* Turno Select mejorado */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Turno
              </label>
              <select 
                value={shift} 
                onChange={(e) => setShift(e.target.value)}
                className="w-full px-4 py-3 
                           bg-gray-50 dark:bg-gray-700 
                           border border-gray-200 dark:border-gray-600 
                           text-gray-900 dark:text-white
                           rounded-xl focus:ring-2 focus:ring-blue-500 
                           focus:border-blue-500 dark:focus:border-blue-400
                           transition-all duration-200 
                           hover:bg-gray-100 dark:hover:bg-gray-600"
                required
              >
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
              </select>
            </div>

            {/* Botones (solo mantener el botón de guardar) */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 
                           text-sm font-medium text-white 
                           bg-gradient-to-r from-blue-600 to-purple-600 
                           rounded-xl hover:from-blue-700 hover:to-purple-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           transition-all duration-200
                           ${loading ? 'opacity-50 cursor-not-allowed animate-pulse' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </span>
                ) : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default GradeGroupModal;
