import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUserFriends, FaCalendarAlt, FaFileAlt, FaCog, FaTv, FaFileUpload, FaClipboardList } from 'react-icons/fa'; // Añadido ícono

function Sidebar({ openGradeGroupModal }) { // Recibimos la función como prop
  return (
    <div className="flex flex-col h-screen p-4 bg-purple-700 text-white w-64">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Control de Proyectores</h1>
      </div>
      <nav className="flex flex-col gap-4">
        <Link to="/" className="flex items-center text-lg">
          <FaHome className="mr-3" /> Dashboard
        </Link>
        <Link to="/grupos" className="flex items-center text-lg">
          <FaUserFriends className="mr-3" /> Grupos
        </Link>
        <Link to="/calendario" className="flex items-center text-lg">
          <FaCalendarAlt className="mr-3" /> Calendario
        </Link>
        <Link to="/request-projector" className="flex items-center text-lg">
          <FaTv className="mr-3" /> Solicitar Proyector
        </Link>
        <Link to="/upload-documents" className="flex items-center text-lg">
          <FaFileUpload className="mr-3" /> Subir Documentos
        </Link>
        <Link to="/view-documents" className="flex items-center text-lg">
          <FaFileAlt className="mr-3" /> Ver Documentos
        </Link>

        {/* Nuevo enlace para abrir el modal */}
        <button onClick={openGradeGroupModal} className="flex items-center text-lg">
          <FaClipboardList className="mr-3" /> Grado y Grupo
        </button>
      </nav>
      <div className="mt-auto">
        <Link to="/ajustes" className="flex items-center text-lg">
          <FaCog className="mr-3" /> Ajustes
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
