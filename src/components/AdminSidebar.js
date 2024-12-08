import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Files,
  FolderKanban,
  Menu,
  X,
  Monitor,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  console.log('AdminSidebar - Renderizando');
  
  const NavItem = ({ path, icon: Icon, children }) => {
    return (
      <div 
        onClick={() => {
          navigate(path);
          setIsOpen(false);
        }} 
        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
                   hover:bg-white/10 hover:translate-x-2 cursor-pointer
                   ${currentPath === path ? 'bg-white/10' : ''}`}
      >
        {Icon && <Icon className="text-xl text-gray-300" />}
        <span className="font-medium text-gray-300">{children}</span>
      </div>
    );
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`fixed top-0 left-0 h-screen 
                      bg-gradient-to-b from-[#214DC5] to-blue-900 
                      dark:from-gray-800 dark:to-gray-900
                      text-white shadow-xl z-40 transition-all duration-300 
                      ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64'} 
                      lg:translate-x-0 lg:w-64`}>
        
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold">Control de Proyectores</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem path="/admin-dashboard" icon={LayoutDashboard}>
            Dashboard
          </NavItem>
          
          <NavItem path="/user-requests" icon={FolderKanban}>
            Solicitudes por Usuario
          </NavItem>
          
          <NavItem path="/view-documents" icon={Files}>
            Ver Documentos
          </NavItem>
          
          <NavItem path="/admin-proyectores" icon={Monitor}>
            Estado de Proyectores
          </NavItem>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between px-3">
            <span className="font-medium text-gray-300">Modo Oscuro</span>
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
