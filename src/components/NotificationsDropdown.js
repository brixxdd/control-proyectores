import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { authService } from '../services/authService';

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await authService.api.get('/api/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await authService.api.put(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Marcar todas las notificaciones como leídas en el backend
      await Promise.all(
        notifications.map(notification => 
          authService.api.put(`/api/notifications/${notification._id}`)
        )
      );
      
      // Actualizar el estado local
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 
                   hover:text-gray-800 dark:hover:text-white 
                   focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center 
                         justify-center px-2 py-1 text-xs font-bold leading-none 
                         text-white transform translate-x-1/2 -translate-y-1/2 
                         bg-red-500 dark:bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 
                       rounded-lg shadow-xl z-50 border border-gray-200 
                       dark:border-gray-700">
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 
                           dark:text-blue-400 dark:hover:text-blue-300
                           transition-colors"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No hay notificaciones nuevas
              </p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`p-3 mb-2 rounded-lg ${
                    notification.tipo === 'success' 
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : notification.tipo === 'error'
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : notification.tipo === 'warning'
                      ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  }`}
                >
                  <p className="text-sm dark:text-gray-200">
                    {notification.mensaje}
                  </p>
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="text-xs text-gray-500 hover:text-gray-700 
                             dark:text-gray-400 dark:hover:text-gray-300 
                             mt-2 transition-colors"
                  >
                    Marcar como leída
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown; 