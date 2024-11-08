import React, { useState } from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import { alertaExito } from './Alert';

const TimeSelectionModal = ({ show, handleClose, selectedDates, handleConfirm }) => {
  const [timeSlots, setTimeSlots] = useState({});

  const handleTimeChange = (date, field, value) => {
    setTimeSlots(prev => ({
      ...prev,
      [date]: { ...prev[date], [field]: value }
    }));
  };

  const onConfirm = () => {
    const allValid = Object.values(timeSlots).every(slot =>
      slot.start && slot.end
    );
  
    if (!allValid) {
      alert("Por favor, asegúrate de que todas las horas de inicio y fin están establecidas.");
      return;
    }
  
    handleConfirm(timeSlots);
    alertaExito();
    handleClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header mejorado */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-white" />
                <h3 className="text-xl font-semibold text-white">
                  Selección de Horarios
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-2 text-white hover:bg-blue-700/50 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body con animaciones y mejor espaciado */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {selectedDates.map(date => {
                // Crear una nueva fecha y ajustarla a la zona horaria local
                const localDate = new Date(date + 'T12:00:00');
                
                return (
                  <div 
                    key={date} 
                    className="rounded-lg bg-gray-50 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-700">
                        {localDate.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* Input de hora de inicio */}
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Clock className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                        </div>
                        <input
                          type="time"
                          className="block w-full rounded-lg border-gray-300 pl-10 
                                   focus:border-blue-500 focus:ring-blue-500 
                                   hover:border-blue-400 transition-colors duration-200
                                   text-sm shadow-sm"
                          onChange={(e) => handleTimeChange(date, 'start', e.target.value)}
                          placeholder="Hora de inicio"
                        />
                        <label className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-gray-50 text-xs font-medium text-gray-900">
                          Hora de inicio
                        </label>
                      </div>
                      
                      {/* Input de hora de fin */}
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Clock className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                        </div>
                        <input
                          type="time"
                          className="block w-full rounded-lg border-gray-300 pl-10 
                                   focus:border-blue-500 focus:ring-blue-500 
                                   hover:border-blue-400 transition-colors duration-200
                                   text-sm shadow-sm"
                          onChange={(e) => handleTimeChange(date, 'end', e.target.value)}
                          placeholder="Hora de fin"
                        />
                        <label className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-gray-50 text-xs font-medium text-gray-900">
                          Hora de fin
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer con botones mejorados */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-row-reverse gap-3">
              <button
                onClick={onConfirm}
                className="inline-flex justify-center items-center rounded-lg px-4 py-2.5
                         bg-blue-600 text-white font-medium
                         hover:bg-blue-700 focus:ring-4 focus:ring-blue-300
                         transition-all duration-200 transform hover:scale-105"
              >
                <Clock className="h-4 w-4 mr-2" />
                Confirmar Horarios
              </button>
              <button
                onClick={handleClose}
                className="inline-flex justify-center items-center rounded-lg px-4 py-2.5
                         border border-gray-300 bg-white text-gray-700 font-medium
                         hover:bg-gray-50 focus:ring-4 focus:ring-gray-200
                         transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSelectionModal;
