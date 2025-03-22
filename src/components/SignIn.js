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

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden
                    bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 
                    dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
      {/* Burbujas animadas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full 
                     bg-gradient-to-br from-blue-400/30 to-transparent 
                     dark:from-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full 
                     bg-gradient-to-tl from-purple-400/30 to-transparent 
                     dark:from-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Card principal con efecto glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md mx-6"
      >
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/50 
                      rounded-3xl shadow-2xl overflow-hidden
                      border border-white/20 dark:border-gray-700/30">
          {/* Contenido interior */}
          <div className="p-8 space-y-8">
            {/* Logo animado circular */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2 
              }}
              className="relative w-24 h-24 mx-auto"
            >
              {/* Efecto de brillo/glow circular */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-600 
                            rounded-full opacity-70 blur-xl"></div>
              
              {/* Círculo principal con gradiente */}
              <div className="relative bg-gradient-to-tr from-blue-500 to-purple-600 
                            rounded-full w-full h-full flex items-center justify-center
                            shadow-lg shadow-purple-500/30">
                <FaGoogle className="text-white text-3xl transform hover:scale-110 
                                  transition-transform duration-300" />
              </div>
            </motion.div>

            {/* Título con gradiente */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 
                           dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Bienvenido
              </h2>
              <p className="text-gray-600/90 dark:text-gray-300/90">
                Inicia sesión con tu cuenta de Google
              </p>
            </div>

            {/* Botón de Google con efecto hover */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="transform transition-all duration-300"
            >
              <button
                onClick={handleGoogleLogin}
                className="w-full group relative overflow-hidden rounded-xl 
                         bg-gradient-to-r from-blue-500 to-purple-600 p-[2px]"
              >
                <div className="relative bg-white dark:bg-gray-900 rounded-[10px] p-4
                              flex items-center justify-center space-x-4
                              transition-all duration-300
                              group-hover:bg-opacity-90 dark:group-hover:bg-opacity-90">
                  <FaGoogle className="text-2xl text-gray-700 dark:text-gray-200" />
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    Iniciar sesión con Google
                  </span>
                </div>
              </button>
            </motion.div>

            {/* Footer con efecto de desvanecimiento */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center space-y-2 text-sm text-gray-500/80 dark:text-gray-400/80"
            >
              <p>Sistema de Control de Proyectores</p>
              <p>© {new Date().getFullYear()} Todos los derechos reservados</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;