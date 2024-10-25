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
  const linkClasses = "flex items-center gap-3 p-3 text-gray-300 rounded-lg transition-all duration-200 hover:bg-white/10 cursor-pointer";
  const activeLinkClasses = "bg-white/10";

  const NavItem = ({ path, icon: Icon, children }) => (
    <div 
      onClick={() => onNavigate(path)}
      className={`${linkClasses} ${currentPath === path ? activeLinkClasses : ''}`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-900 w-64 p-4">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">Control de Proyectores</h2>
        <div className="h-0.5 bg-gray-700 w-full"></div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <NavItem path="/dashboard" icon={LayoutDashboard}>
          Dashboard
        </NavItem>

        <NavItem path="/grupos" icon={Users}>
          Grupos
        </NavItem>

        <NavItem path="/calendario" icon={Calendar}>
          Calendario
        </NavItem>

        <NavItem path="/solicitar" icon={MonitorPlay}>
          Solicitar Proyector
        </NavItem>

        <NavItem path="/subir-documentos" icon={FileUp}>
          Subir Documentos
        </NavItem>

        <NavItem path="/ver-documentos" icon={Files}>
          Ver Documentos
        </NavItem>

        <div 
          onClick={openGradeGroupModal}
          className={linkClasses}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Grado y Grupo</span>
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-700">
        <NavItem path="/ajustes" icon={Settings}>
          Ajustes
        </NavItem>
      </div>
    </div>
  );
};

export default AdminSidebar;