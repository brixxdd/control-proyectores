import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MonitorPlay,
  FileUp,
  Files,
  GraduationCap,
  Settings
} from 'lucide-react';

const AdminSidebar = ({ onNavigate, openGradeGroupModal, currentPath = '/dashboard' }) => {
  const linkClasses = "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:translate-x-2 cursor-pointer";
  const activeLinkClasses = "bg-white/10";

  const NavItem = ({ path, icon: Icon, children }) => (
    <div 
      onClick={() => onNavigate(path)} 
      className={`${linkClasses} ${currentPath === path ? activeLinkClasses : ''}`}
    >
      <Icon className="text-xl text-gray-300" />
      <span className="font-medium text-gray-300">{children}</span>
    </div>
  );

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
        <NavItem path="/admin-dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
        <NavItem path="/grupos" icon={Users}>Grupos</NavItem>
        <NavItem path="/solicitudes" icon={MonitorPlay}>Solicitudes de Proyectores</NavItem>
        <NavItem path="/view-documents" icon={Files}>Ver Documentos</NavItem>

        <button 
          onClick={openGradeGroupModal} 
          className={`${linkClasses} w-full text-left`}
        >
          <GraduationCap className="text-xl text-gray-300" />
          <span className="font-medium text-gray-300">Grado y Grupo</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <NavItem path="/ajustes" icon={Settings}>Ajustes</NavItem>
      </div>
    </div>
  );
};

export default AdminSidebar;
