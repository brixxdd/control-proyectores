import React, { useState, useEffect } from 'react';
import { 
  Check,
  X,
  Edit,
  MoreVertical,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  useEffect(() => {
    console.log("AdminDashboard renderizado después de autenticación exitosa");
  }, []);

  const [requests, setRequests] = useState([
    {
      id: 1,
      usuario: "Juan Pérez",
      fecha: "2024-10-25",
      hora: "10:00",
      salon: "A101",
      estado: "pendiente",
      motivo: "Clase de Matemáticas"
    },
    // Aquí irían más solicitudes...
  ]);

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, estado: newStatus }
        : request
    ));
    setOpenDropdownId(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: "bg-yellow-100 text-yellow-800",
      aprobado: "bg-green-100 text-green-800",
      rechazado: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Componente Dropdown personalizado
  const ActionDropdown = ({ request }) => (
    <div className="relative">
      <button 
        onClick={() => toggleDropdown(request.id)}
        className="p-1 rounded-full hover:bg-gray-100"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      
      {openDropdownId === request.id && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
          <div className="py-1">
            <button
              onClick={() => handleStatusChange(request.id, 'aprobado')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Check className="w-4 h-4 mr-2" />
              Aprobar
            </button>
            <button
              onClick={() => handleStatusChange(request.id, 'rechazado')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <X className="w-4 h-4 mr-2" />
              Rechazar
            </button>
            <button
              onClick={() => console.log('Editar', request.id)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      {/* Card principal */}
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Panel de Administración</h2>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Pendientes</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {requests.filter(r => r.estado === 'pendiente').length}
              </p>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-600">Usuario</th>
                  <th className="text-left p-4 font-medium text-gray-600">Fecha</th>
                  <th className="text-left p-4 font-medium text-gray-600">Hora</th>
                  <th className="text-left p-4 font-medium text-gray-600">Salón</th>
                  <th className="text-left p-4 font-medium text-gray-600">Motivo</th>
                  <th className="text-left p-4 font-medium text-gray-600">Estado</th>
                  <th className="text-left p-4 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{request.usuario}</td>
                    <td className="p-4">{request.fecha}</td>
                    <td className="p-4">{request.hora}</td>
                    <td className="p-4">{request.salon}</td>
                    <td className="p-4">{request.motivo}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.estado)}`}>
                        {request.estado}
                      </span>
                    </td>   
                    <td className="p-4">
                      <ActionDropdown request={request} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;