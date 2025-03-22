import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUserFriends, FaCog, FaTv, FaFileUpload, FaBars, FaTimes, FaHistory, FaQrcode } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import ThemeSelector from './ThemeSelector';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = ({ openGradeGroupModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const linkClasses = "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 hover:translate-x-2";
  const iconClasses = "text-xl";

  const handleDarkModeToggle = async () => {
    try {
      await toggleDarkMode(!darkMode);
    } catch (error) {
      console.error('Error al cambiar modo oscuro:', error);
    }
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

      {/* Sidebar más delgado */}
      <div className={`fixed top-0 left-0 h-screen 
                      bg-gradient-to-b from-[#214DC5] to-blue-900 
                      dark:from-gray-800 dark:to-gray-900
                      text-white shadow-xl z-40 transition-all duration-300
                      ${isOpen ? 'w-[65vw] sm:w-56 translate-x-0' : '-translate-x-full w-[65vw] sm:w-56'} 
                      lg:translate-x-0 lg:w-56`}>
        {/* Header más compacto */}
        <div className="p-3 border-b border-white/10">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 
                         dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent">
            Control de Proyectores
          </h1>
        </div>

        {/* Navigation con espaciado reducido */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto 
                       scrollbar-thin scrollbar-thumb-blue-400 
                       dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <Link to="/" className={linkClasses} onClick={() => setIsOpen(false)}>
            <FaHome className="text-xl" />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link to="/request-projector" className={linkClasses} onClick={() => setIsOpen(false)}>
            <FaTv className="text-xl" />
            <span className="font-medium">Solicitar Proyector</span>
          </Link>
          
          <Link to="/upload-documents" className={linkClasses} onClick={() => setIsOpen(false)}>
            <FaFileUpload className="text-xl" />
            <span className="font-medium">Subir Documentos</span>
          </Link>
          
          <Link to="/mis-solicitudes" className={linkClasses} onClick={() => setIsOpen(false)}>
            <FaHistory className="text-xl" />
            <span className="font-medium">Mis Solicitudes</span>
          </Link>
          
          <Link to="/qr-history" className={linkClasses} onClick={() => setIsOpen(false)}>
            <FaQrcode className="text-xl" />
            <span className="font-medium">Mis Códigos QR</span>
          </Link>
        </nav>

        {/* Footer más compacto */}
        <div className="p-2 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="font-medium">Modo Oscuro</span>
            <ThemeToggle 
              isDark={darkMode} 
              toggleTheme={handleDarkModeToggle}
            />
          </div>
          <button 
            onClick={() => setShowThemeSelector(!showThemeSelector)}
            className={linkClasses}
          >
            <FaCog className="text-xl" />
            <span className="font-medium">Personalización</span>
          </button>
          
          {/* Selector de Temas */}
          {showThemeSelector && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              <ThemeSelector />
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
