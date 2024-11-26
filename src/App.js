<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar'; 
import Dashboard from './components/Dashboard'; 
import Grupos from './components/Grupos'; 
import MiniCalendar from './components/MiniCalendar'; 
import RequestProjector from './components/RequestProjector'; 
import UploadDocuments from './components/UploadDocuments'; 
import ViewDocuments from './components/ViewDocuments'; 
import SignIn from './components/SignIn'; 
import GradeGroupModal from './components/GradeGroupModal'; 
import { googleLogout } from '@react-oauth/google'; // Asegúrate de importar esto
import axios from 'axios';
import EventManager from './components/EventManager';
=======
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

import UserRequests from './components/UserRequests';
import MySolicitudes from './components/MySolicitudes';
import AdminProyectores from './components/AdminProyectores';
>>>>>>> Stashed changes

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showGradeGroupModal, setShowGradeGroupModal] = useState(false);
  const [events, setEvents] = useState([]); // Estado para los eventos

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/check-session', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    axios.post('http://localhost:3000/logout', {}, { withCredentials: true })
  .then((res) => {
    console.log('Sesión cerrada correctamente:', res.data);
    setIsAuthenticated(false); // Reiniciar el estado de autenticación
    googleLogout(); // Cerrar sesión de Google OAuth en el cliente
    navigate('/'); // Redirigir a la página de inicio o donde desees
  })
  .catch((error) => {
    console.error('Error al cerrar sesión:', error);
  });
  };

  const handleGradeGroupSubmit = async (name, grade, shift) => {
    try {
      await fetch('http://localhost:3000/set-grade-group', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, grade, shift }),
      });
      setShowGradeGroupModal(false);
    } catch (error) {
      console.error('Error al guardar la información:', error);
    }
  };

  return (
    <div className="flex">
      {isAuthenticated && (
        <Sidebar openGradeGroupModal={() => setShowGradeGroupModal(true)} />
      )}
      <div className="content flex-1 p-4">
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          {isAuthenticated && (
            <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#f00', color: '#fff' }}>
              Cerrar 
            </button>
          )}
        </div>

        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/signin"} />} />
          <Route path="/signin" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />} />
          <Route path="/grupos" element={isAuthenticated ? <Grupos /> : <Navigate to="/signin" />} />
          <Route path="/calendario" element={isAuthenticated ? <MiniCalendar /> : <Navigate to="/signin" />} />
          <Route path="/request-projector" element={isAuthenticated ? <RequestProjector /> : <Navigate to="/signin" />} />
          <Route path="/upload-documents" element={isAuthenticated ? <UploadDocuments /> : <Navigate to="/signin" />} />
          <Route path="/view-documents" element={isAuthenticated ? <ViewDocuments /> : <Navigate to="/signin" />} />
        </Routes>

        {showGradeGroupModal && (
          <GradeGroupModal 
            isOpen={showGradeGroupModal}
            onClose={() => setShowGradeGroupModal(false)}
            onSubmit={handleGradeGroupSubmit}
          />
        )}
<<<<<<< Updated upstream
=======

        {/* Contenido principal */}
        <main className={`flex-1 transition-all duration-300
                         ${isAuthenticated ? 'lg:ml-64' : ''}`}>
          <div className="p-4 mt-16 lg:mt-0">
            {/* Header del usuario */}
            {isAuthenticated && user && (
              <div className="flex justify-end items-center mb-4 space-x-4 
                            bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                <div className="flex items-center gap-2">
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
                  <span className="text-gray-900 dark:text-white font-medium">{user.nombre}</span>
                  <button 
                    onClick={handleLogout} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg 
                             hover:bg-red-700 transition-colors duration-200"
                  >
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
>>>>>>> Stashed changes
      </div>
    </div>
  );
}

export default App;
