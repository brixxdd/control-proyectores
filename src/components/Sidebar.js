import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUserFriends, FaCog, FaTv, FaFileUpload, FaBars, FaTimes, FaHistory, FaQrcode } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

const Sidebar = ({ openGradeGroupModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const linkClasses = "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:translate-x-2";
  const iconClasses = "text-xl";

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', (!isDark).toString());
  };

  return (
    <>
      {/* Botón hamburguesa con gradiente y glow */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 
                    bg-gradient-to-r from-blue-600 to-purple-600
                    p-3 rounded-xl lg:hidden
                    shadow-[0_0_15px_rgba(59,130,246,0.5)]
                    hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]
                    transition-all duration-300"
        >
          <FaBars className="text-white w-5 h-5" />
        </button>
      )}

      {/* Overlay para cerrar el sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden 
                    transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen 
                      bg-gradient-to-b from-[#214DC5] to-blue-900 
                      dark:from-gray-800 dark:to-gray-900
                      text-white shadow-xl z-40 transition-all duration-300
                      ${isOpen ? 'w-[85vw] sm:w-72 translate-x-0' : '-translate-x-full w-[85vw] sm:w-72'} 
                      lg:translate-x-0 lg:w-72`}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 
                         dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent">
            Control de Proyectores
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <Link to="/" className={linkClasses} onClick={() => setIsOpen(false)}>
            <FaHome className={iconClasses} />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link to="/request-projector" className={linkClasses} onClick={() => setIsOpen(false)}>
            <FaTv className={iconClasses} />
            <span className="font-medium">Solicitar Proyector</span>
          </Link>
          
          <Link to="/upload-documents" className={linkClasses} onClick={() => setIsOpen(false)}>
            <FaFileUpload className={iconClasses} />
            <span className="font-medium">Subir Documentos</span>
          </Link>
          
          <Link to="/mis-solicitudes" className={linkClasses} onClick={() => setIsOpen(false)}>
            <FaHistory className={iconClasses} />
            <span className="font-medium">Mis Solicitudes</span>
          </Link>
          
          <Link to="/qr-history" className={linkClasses} onClick={() => setIsOpen(false)}>
            <FaQrcode className={iconClasses} />
            <span className="font-medium">Mis Códigos QR</span>
          </Link>
        </nav>

        {/* Footer con Theme Toggle */}
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between px-3">
            <span className="font-medium">Modo Oscuro</span>
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          </div>
          <Link to="/ajustes" className={linkClasses} onClick={() => setIsOpen(false)}>
            <FaCog className={iconClasses} />
            <span className="font-medium">Ajustes</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
