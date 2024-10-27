import React, { useState } from 'react';
import { motion } from 'framer-motion';

const GradeGroupModal = ({ isOpen, onClose }) => {
  const [grade, setGrade] = useState('');
  const [group, setGroup] = useState('');
  const [shift, setShift] = useState('Matutino');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!grade || !group) {
      return alert('Todos los campos son obligatorios');
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ grado: grade, grupo: group, turno: shift }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Información actualizada:', data);
        alert('Información actualizada correctamente');
        onClose();
      } else {
        console.error('Error al actualizar la información');
        alert('Error al actualizar la información');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error en la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Overlay mejorado */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal content con animación mejorada */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg transform transition-all"
      >
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100">
          {/* Header mejorado */}
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Información Académica
            </h2>
            <p className="mt-2 text-gray-500">Completa tus datos escolares</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Grado Input mejorado */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Grado Escolar
              </label>
              <input 
                type="text" 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-100"
                placeholder="Ejemplo: Primer grado"
                required 
              />
            </div>

            {/* Grupo Input mejorado */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Grupo
              </label>
              <input 
                type="text" 
                value={group} 
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-100"
                placeholder="Ejemplo: A"
                required 
              />
            </div>

            {/* Turno Select mejorado */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Turno
              </label>
              <select 
                value={shift} 
                onChange={(e) => setShift(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-100"
                required
              >
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
              </select>
            </div>

            {/* Buttons mejorados */}
            <div className="flex flex-col-reverse sm:flex-row justify-end space-y-4 space-y-reverse sm:space-y-0 sm:space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  ${loading ? 'animate-pulse' : ''}
                `}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
