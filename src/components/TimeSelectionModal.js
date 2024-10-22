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
    // Verificar que todos los timeSlots tengan valores de hora válidos
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                Seleccionar horarios
              </h3>
              <button
                onClick={handleClose}
                className="rounded-full p-1 text-white hover:bg-blue-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <div className="space-y-6">
              {selectedDates.map(date => (
                <div key={date} className="rounded-lg bg-gray-50 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700">{date}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="time"
                        className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        onChange={(e) => handleTimeChange(date, 'start', e.target.value)}
                        placeholder="Hora de inicio"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="time"
                        className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        onChange={(e) => handleTimeChange(date, 'end', e.target.value)}
                        placeholder="Hora de fin"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex flex-row-reverse gap-3">
              <button
                onClick={onConfirm}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={handleClose}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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