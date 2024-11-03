import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv, faUsers, faClipboardList, faBell } from '@fortawesome/free-solid-svg-icons';

function Dashboard() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Control</h1>
        
        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            icon={faTv} // Cambié `faProjector` por `faTv`
            title="Proyectores Disponibles"
            value="8"
            description="Listos para usar"
            color="bg-blue-500"
          />
          <DashboardCard 
            icon={faUsers}
            title="Solicitudes Pendientes"
            value="3"
            description="Por aprobar"
            color="bg-yellow-500"
          />
          <DashboardCard 
            icon={faClipboardList}
            title="Préstamos Activos"
            value="5"
            description="En uso actualmente"
            color="bg-green-500"
          />
          <DashboardCard 
            icon={faBell}
            title="Notificaciones"
            value="2"
            description="Nuevas alertas"
            color="bg-red-500"
          />
        </div>
        
        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton to="/request-projector" label="Solicitar Proyector" />
            <ActionButton to="/return-projector" label="Devolver Proyector" />
            <ActionButton to="/view-schedule" label="Ver Horarios" />
          </div>
        </div>
        
        {/* Préstamos Recientes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Préstamos Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">ID</th>
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Proyector</th>
                  <th className="p-3">Fecha de Préstamo</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
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
    <div className={`${color} rounded-lg shadow-md p-6 text-white`}>
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
    <Link to={to} className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300 text-center">
      {label}
    </Link>
  );
}

function TableRow({ id, user, projector, date, status }) {
  const statusColor = status === 'Activo' ? 'text-green-600' : status === 'Retrasado' ? 'text-red-600' : 'text-gray-600';
  
  return (
    <tr className="border-b">
      <td className="p-3">{id}</td>
      <td className="p-3">{user}</td>
      <td className="p-3">{projector}</td>
      <td className="p-3">{date}</td>
      <td className={`p-3 font-semibold ${statusColor}`}>{status}</td>
    </tr>
  );
}

export default Dashboard;
