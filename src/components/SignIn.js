import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { FaGoogle, FaProjectDiagram, FaTv, FaUserGraduate } from 'react-icons/fa';
import { AUTH_CONSTANTS } from '../constants/auth';

const SignIn = () => {
  const { handleGoogleLogin, isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} replace />;
  }

  // Animación para los iconos flotantes
  const floatingIcons = [
    { icon: <FaTv />, delay: 0 },
    { icon: <FaProjectDiagram />, delay: 0.2 },
    { icon: <FaUserGraduate />, delay: 0.4 }
  ];


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 dark:bg-none p-4 relative overflow-hidden">
      {/* Fondo oscuro con patrón sutil */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
      {/* Círculos animados de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Card de inicio de sesión */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl 
                      border border-white/20 dark:border-gray-700/30 p-6 sm:p-8 space-y-6 sm:space-y-8 w-full max-w-[90vw] sm:max-w-md mx-auto">
          {/* Logo animado */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 
            }}
            className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 
                       rounded-full flex items-center justify-center shadow-lg"
          >
            <FaGoogle className="text-white text-3xl" />
          </motion.div>

          {/* Título con gradiente */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                         dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Bienvenido
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Inicia sesión con tu cuenta de Google
            </p>
          </div>

          {/* Contenedor del botón de Google */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="google-button-wrapper transform hover:scale-105 transition-transform duration-300 hover:shadow-lg">
            <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center px-6 py-3 
                     bg-white dark:bg-gray-800 text-gray-700 dark:text-white
                     rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300
                     relative overflow-hidden group"
          >
            {/* Rectángulo sobresaliente */}
            <div className="absolute left-0 top-0 bottom-0 w-14 
                          bg-blue-300 dark:bg-blue-600 
                          flex items-center justify-center">
              <FaGoogle className="text-white text-xl" />
            </div>
            
            {/* Texto del botón */}
            <span className="ml-10 font-medium">
              Iniciar sesión
            </span>
          </button>
            </div>
          </motion.div>

            {/* Footer con información adicional */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-gray-500 dark:text-gray-400"
            >
              <p>Sistema de Control de Proyectores</p>
              <p>© {new Date().getFullYear()} Todos los derechos reservados</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    
  );
};

export default SignIn;