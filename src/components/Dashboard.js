import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv, faUsers, faClipboardList, faBell } from '@fortawesome/free-solid-svg-icons';
import useShowGradeGroupModal from '../hooks/useShowGradeGroupModal'; // Ajusta la ruta según tu estructura de carpetas


function Dashboard({ isAuthenticated, isAdmin, setShowGradeGroupModal }) {
 
  // Usar el custom hook
  useShowGradeGroupModal(isAuthenticated, isAdmin, setShowGradeGroupModal);
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Panel de Control</h1>
        
        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            icon={faTv}
            title="Proyectores Disponibles"
            value="8"
            description="Listos para usar"
            color="bg-blue-500 dark:bg-blue-600"
          />
          <DashboardCard 
            icon={faUsers}
            title="Solicitudes Pendientes"
            value="3"
            description="Por aprobar"
            color="bg-yellow-500 dark:bg-yellow-600"
          />
          <DashboardCard 
            icon={faClipboardList}
            title="Préstamos Activos"
            value="5"
            description="En uso actualmente"
            color="bg-green-500 dark:bg-green-600"
          />
          <DashboardCard 
            icon={faBell}
            title="Notificaciones"
            value="2"
            description="Nuevas alertas"
            color="bg-red-500 dark:bg-red-600"
          />
        </div>
        
        {/* Acciones Rápidas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700/20 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton to="/request-projector" label="Solicitar Proyector" />
            <ActionButton to="/return-projector" label="Devolver Proyector" />
            <ActionButton to="/view-schedule" label="Ver Horarios" />
          </div>
        </div>
        
        {/* Préstamos Recientes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700/20 p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Préstamos Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="p-3 text-gray-700 dark:text-gray-200">ID</th>
                  <th className="p-3 text-gray-700 dark:text-gray-200">Usuario</th>
                  <th className="p-3 text-gray-700 dark:text-gray-200">Proyector</th>
                  <th className="p-3 text-gray-700 dark:text-gray-200">Fecha de Préstamo</th>
                  <th className="p-3 text-gray-700 dark:text-gray-200">Estado</th>
                </tr>
              </thead>
              <tbody className="dark:text-gray-300">
                <TableRow id="001" user="Juan Pérez" projector="PR-001" date="2023-05-15" status="Activo" />
                <TableRow id="002" user="María García" projector="PR-003" date="2023-05-14" status="Devuelto" />
                <TableRow id="003" user="Carlos López" projector="PR-002" date="2023-05-13" status="Retrasado" />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ icon, title, value, description, color }) {
  return (
    <div className={`${color} rounded-lg shadow-md dark:shadow-gray-700/20 p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm opacity-80">{description}</p>
        </div>
        <FontAwesomeIcon icon={icon} size="3x" className="opacity-50" />
      </div>
    </div>
  );
}

function ActionButton({ to, label }) {
  return (
    <Link 
      to={to} 
      className="bg-indigo-600 dark:bg-indigo-500 text-white py-2 px-4 rounded 
                 hover:bg-indigo-700 dark:hover:bg-indigo-600 
                 transition duration-300 text-center
                 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-700"
    >
      {label}
    </Link>
  );
}

function TableRow({ id, user, projector, date, status }) {
  const statusColor = {
    Activo: 'text-green-600 dark:text-green-400',
    Retrasado: 'text-red-600 dark:text-red-400',
    Devuelto: 'text-gray-600 dark:text-gray-400'
  }[status];
  
  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="p-3">{id}</td>
      <td className="p-3">{user}</td>
      <td className="p-3">{projector}</td>
      <td className="p-3">{date}</td>
      <td className={`p-3 font-semibold ${statusColor}`}>{status}</td>
    </tr>
  );
}

export default Dashboard;
