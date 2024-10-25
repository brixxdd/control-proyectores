import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv, faUsers, faClipboardList, faBell, faCheck, faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';

function AdminDashboard() {
  const [requests, setRequests] = useState([
    { id: 1, usuario: "Juan Pérez", fecha: "2024-10-25", hora: "10:00", salon: "A101", estado: "pendiente", motivo: "Clase de Matemáticas" },
    { id: 2, usuario: "María García", fecha: "2024-10-26", hora: "14:00", salon: "B203", estado: "aprobado", motivo: "Presentación de Proyecto" },
    { id: 3, usuario: "Carlos López", fecha: "2024-10-27", hora: "11:30", salon: "C105", estado: "rechazado", motivo: "Seminario de Física" },
  ]);

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(requests.map(request => 
      request.id === requestId ? { ...request, estado: newStatus } : request
    ));
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Panel de Administración</h1>
      
      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          icon={faTv}
          title="Proyectores Totales"
          value="20"
          description="En inventario"
          color="bg-blue-500"
        />
        <DashboardCard 
          icon={faUsers}
          title="Solicitudes Pendientes"
          value={requests.filter(r => r.estado === 'pendiente').length.toString()}
          description="Por revisar"
          color="bg-yellow-500"
        />
        <DashboardCard 
          icon={faClipboardList}
          title="Préstamos Activos"
          value={requests.filter(r => r.estado === 'aprobado').length.toString()}
          description="En uso"
          color="bg-green-500"
        />
        <DashboardCard 
          icon={faBell}
          title="Alertas"
          value="3"
          description="Requieren atención"
          color="bg-red-500"
        />
      </div>
      
      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionButton to="/add-projector" label="Agregar Proyector" />
          <ActionButton to="/manage-users" label="Gestionar Usuarios" />
          <ActionButton to="/reports" label="Generar Reportes" />
        </div>
      </div>
      
      {/* Solicitudes Recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Solicitudes Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">Usuario</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Hora</th>
                <th className="p-3">Salón</th>
                <th className="p-3">Motivo</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <TableRow key={request.id} request={request} onStatusChange={handleStatusChange} />
              ))}
            </tbody>
          </table>
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

function TableRow({ request, onStatusChange }) {
  const statusColor = {
    pendiente: 'text-yellow-600',
    aprobado: 'text-green-600',
    rechazado: 'text-red-600'
  };
  
  return (
    <tr className="border-b">
      <td className="p-3">{request.usuario}</td>
      <td className="p-3">{request.fecha}</td>
      <td className="p-3">{request.hora}</td>
      <td className="p-3">{request.salon}</td>
      <td className="p-3">{request.motivo}</td>
      <td className={`p-3 font-semibold ${statusColor[request.estado]}`}>{request.estado}</td>
      <td className="p-3">
        <div className="flex space-x-2">
          <button onClick={() => onStatusChange(request.id, 'aprobado')} className="text-green-500 hover:text-green-700">
            <FontAwesomeIcon icon={faCheck} />
          </button>
          <button onClick={() => onStatusChange(request.id, 'rechazado')} className="text-red-500 hover:text-red-700">
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <button onClick={() => console.log('Editar', request.id)} className="text-blue-500 hover:text-blue-700">
            <FontAwesomeIcon icon={faEdit} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default AdminDashboard;
