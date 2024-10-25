import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUserFriends, FaCalendarAlt, FaFileAlt, FaCog, FaTv, FaFileUpload, FaClipboardList } from 'react-icons/fa';

const Sidebar = ({ openGradeGroupModal }) => {
  const linkClasses = "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:translate-x-2";
  const iconClasses = "text-xl";

  return (
    <div className="fixed top-0 left-0 flex flex-col h-screen bg-gradient-to-b from-[#214DC5] to-blue-900 text-white w-64 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
          Control de Proyectores
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link to="/" className={linkClasses}>
          <FaHome className={iconClasses} />
          <span className="font-medium">Dashboard</span>
        </Link>
        
        <Link to="/request-projector" className={linkClasses}>
          <FaTv className={iconClasses} />
          <span className="font-medium">Solicitar Proyector</span>
        </Link>
        
        <Link to="/upload-documents" className={linkClasses}>
          <FaFileUpload className={iconClasses} />
          <span className="font-medium">Subir Documentos</span>
        </Link>
        
        <Link to="/view-documents" className={linkClasses}>
          <FaFileAlt className={iconClasses} />
          <span className="font-medium">Ver Documentos</span>
        </Link>

        <button 
          onClick={openGradeGroupModal} 
          className={`${linkClasses} w-full text-left`}
        >
          <FaClipboardList className={iconClasses} />
          <span className="font-medium">Grado y Grupo</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link to="/ajustes" className={linkClasses}>
          <FaCog className={iconClasses} />
          <span className="font-medium">Ajustes</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
