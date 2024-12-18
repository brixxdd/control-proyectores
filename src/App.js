import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Grupos from './components/Grupos';
import MiniCalendar from './components/MiniCalendar';
import RequestProjector from './components/RequestProjector';
import UploadDocuments from './components/UploadDocuments';
import ViewDocuments from './components/ViewDocuments';
import SignIn from './components/SignIn';
import GradeGroupModal from './components/GradeGroupModal';
import WelcomeAlert from './components/WelcomeAlert';
import { authService } from './services/authService';
import { useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

import UserRequests from './components/UserRequests';
import MySolicitudes from './components/MySolicitudes';
import AdminProyectores from './components/AdminProyectores';
import useInactivityTimer from "./hooks/useInactivityTimer";
import NotificationsDropdown from './components/NotificationsDropdown';


const App = () => {
  const { 
    isAuthenticated, 
    isAdmin, 
    isLoading, 
    user, 
    userPicture,
    handleLogout 
  } = useAuth();

  useInactivityTimer(handleLogout, 10 * 60 * 1000); // 10 minutos

  const [showGradeGroupModal, setShowGradeGroupModal] = React.useState(false);
  const [showWelcomeAlert, setShowWelcomeAlert] = React.useState(false);
  const [tokenTimeLeft, setTokenTimeLeft] = React.useState(15 * 60); // 15 minutos en segundos
  const [showWarning, setShowWarning] = React.useState(false);

  const handleProfileUpdate = useCallback(async (data) => {
    try {
      const response = await authService.updateUserProfile(data);
      setShowGradeGroupModal(false);
      return response;
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      throw error;
    }
  }, []);

  React.useEffect(() => {
    let timer;
    if (isAuthenticated) {
      setTokenTimeLeft(15 * 60); // 15 minutos en segundos
      timer = setInterval(() => {
        setTokenTimeLeft(prev => {
          // Mostrar advertencia cuando queden 2 minutos
          if (prev === 120) {
            Swal.fire({
              title: '¡Advertencia!',
              text: 'Tu sesión expirará en 2 minutos',
              icon: 'warning',
              timer: 5000,
              timerProgressBar: true,
              showConfirmButton: false
            });
          }

          if (prev <= 1) {
            clearInterval(timer);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAuthenticated]);

  // Función para formatear el tiempo restante
  const formatTimeLeft = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Mostrar loader mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {isAuthenticated && (
          <>
            {isAdmin ? (
              <AdminSidebar 
                openGradeGroupModal={() => setShowGradeGroupModal(true)}
              />
            ) : (
              <Sidebar 
                openGradeGroupModal={() => setShowGradeGroupModal(true)}
              />
            )}
          </>
        )}

        {/* Contenido principal */}
        <main className={`flex-1 transition-all duration-300
                         ${isAuthenticated ? 'lg:ml-64' : ''}`}>
          <div className="p-4 mt-16 lg:mt-0">
            {/* Header del usuario */}
            {isAuthenticated && user && (
              <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                {/* Temporizador y Notificaciones en la izquierda */}
                <div className="flex items-center gap-4">
                  <div className={`
                    px-4 py-2 rounded-full font-medium text-sm
                    flex items-center gap-2
                    ${tokenTimeLeft <= 120 
                      ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300' 
                      : tokenTimeLeft <= 300 
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300' 
                        : 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300'
                    }
                  `}>
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span>Sesión: {formatTimeLeft(tokenTimeLeft)}</span>
                  </div>
                  {/* Componente de Notificaciones */}
                  <NotificationsDropdown />
                </div>

                {/* Información del usuario en la derecha */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full 
                                      flex items-center justify-center overflow-hidden">
                      {userPicture && (
                        <img 
                          src={userPicture}
                          alt="Perfil" 
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {user.nombre}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="px-4 py-2 bg-red-500 text-white rounded-full
                             hover:bg-red-600 transition-all duration-200 ease-in-out
                             shadow-sm hover:shadow-md
                             flex items-center gap-2"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                      />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}

            {/* Rutas */}
            <Routes>
              <Route 
                path="/" 
                element={
                  isAuthenticated 
                    ? <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} replace /> 
                    : <Navigate to="/signin" replace />
                } 
              />

              <Route 
                path="/signin" 
                element={
                  isLoading ? (
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                    </div>
                  ) : isAuthenticated ? (
                    <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} replace />
                  ) : (
                    <SignIn />
                  )
                } 
              />

              {/* Rutas protegidas */}
              <Route 
                path="/dashboard" 
                element={
                  isAuthenticated && !isAdmin 
                    ? <Dashboard isAuthenticated={isAuthenticated} isAdmin={isAdmin} setShowGradeGroupModal={setShowGradeGroupModal}/> 
                    : <Navigate to={isAdmin ? "/admin-dashboard" : "/signin"} />
                } 
              />
              <Route 
                path="/admin-dashboard" 
                element={
                  isAuthenticated && isAdmin 
                    ? <AdminDashboard /> 
                    : <Navigate to="/signin" />
                } 
              />
              <Route 
                path="/grupos" 
                element={
                  isAuthenticated ? <Grupos /> : <Navigate to="/signin" />
                } 
              />
              <Route 
                path="/calendario" 
                element={
                  isAuthenticated ? <MiniCalendar /> : <Navigate to="/signin" />
                } 
              />
              <Route 
                path="/request-projector" 
                element={
                  isAuthenticated ? <RequestProjector /> : <Navigate to="/signin" />
                } 
              />
              <Route 
                path="/upload-documents" 
                element={
                  isAuthenticated ? <UploadDocuments /> : <Navigate to="/signin" />
                } 
              />
              <Route 
                path="/view-documents" 
                element={
                  isAuthenticated ? <ViewDocuments /> : <Navigate to="/signin" />
                } 
              />
              <Route 
                path="/user-requests" 
                element={
                  isAuthenticated && isAdmin 
                    ? <UserRequests /> 
                    : <Navigate to="/signin" />
                } 
              />
              <Route 
                path="/mis-solicitudes" 
                element={
                  isAuthenticated 
                    ? <MySolicitudes /> 
                    : <Navigate to="/signin" />
                } 
              />
              <Route 
                path="/admin-proyectores" 
                element={
                  isAuthenticated && isAdmin 
                    ? <AdminProyectores /> 
                    : <Navigate to="/signin" />
                } 
              />

              <Route path="*" element={<Navigate to="/signin" />} />
            </Routes>

            {/* Modales */}
            <WelcomeAlert 
              isOpen={showWelcomeAlert} 
              onClose={() => setShowWelcomeAlert(false)}
              openGradeGroupModal={() => setShowGradeGroupModal(true)}
            />

            {showGradeGroupModal && (
              <GradeGroupModal 
                isOpen={showGradeGroupModal}
                onClose={() => setShowGradeGroupModal(false)}
                onSubmit={handleProfileUpdate}
              />
            )}
          </div>
        </main>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      />
    </>
  );
}

export default App;
