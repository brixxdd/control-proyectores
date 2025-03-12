import React from 'react';
import { X } from 'lucide-react';
import { alertaEliminacion, alertaError } from './Alert';

const DeleteEventModal = ({ show, handleClose, handleDelete, events, toggleEventSelection }) => {
    if (!show) return null;

    const selectedEvents = events.filter(event => event.selected);

    const handleMultipleDelete = () => {
        try {
            if (selectedEvents.length === 0) {
                alertaError('No hay eventos seleccionados para eliminar');
                return;
            }
            
            const selectedEventIds = selectedEvents.map(event => event.id);
            handleDelete(selectedEventIds);
            // La alerta de éxito se mostrará en handleDeleteEvents después de confirmar que todo salió bien
        } catch (error) {
            console.error('Error al procesar la eliminación:', error);
            alertaError('Hubo un error al procesar la eliminación');
        }
    };

    const toggleAllEvents = () => {
        const allSelected = events.every(event => event.selected);
        events.forEach(event => {
            toggleEventSelection(event.id);
        });
    };

    const formatDate = (date) => {
        if (!(date instanceof Date) || isNaN(date)) {
            return 'Fecha no válida';
        }

        try {
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error al formatear la fecha:', error);
            return 'Error en formato de fecha';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-black bg-opacity-50">
            <div className="relative w-full max-w-2xl mx-auto">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-t-lg dark:bg-red-900/30">
                        <h3 className="text-xl font-semibold text-red-800 dark:text-red-300">
                            Eliminar eventos
                        </h3>
                        <button
                            onClick={handleClose}
                            className="p-1 ml-auto bg-transparent hover:bg-red-100 dark:hover:bg-red-800/30 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-red-800 dark:text-red-300" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        {events.length > 0 ? (
                            <>
                                <button
                                    onClick={toggleAllEvents}
                                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-md transition-colors"
                                >
                                    {events.every(event => event.selected) ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                </button>
                                
                                <div className="max-h-64 overflow-auto">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">Seleccionar</th>
                                                <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">Título</th>
                                                <th className="p-3 text-left font-medium text-gray-600 dark:text-gray-300">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                            {events.map(event => (
                                                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="p-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={event.selected}
                                                            onChange={() => toggleEventSelection(event.id)}
                                                            className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700"
                                                        />
                                                    </td>
                                                    <td className="p-3 dark:text-gray-300">{event.summary}</td>
                                                    <td className="p-3 dark:text-gray-300">{formatDate(event.start)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">No hay eventos disponibles.</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 rounded-b-lg dark:bg-gray-700">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleMultipleDelete}
                            disabled={selectedEvents.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-600"
                        >
                            Eliminar ({selectedEvents.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteEventModal;