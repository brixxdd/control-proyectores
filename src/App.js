import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar'; 
import AdminSidebar from './components/AdminSidebar';
import Dashboard from './components/Dashboard'; 
import Grupos from './components/Grupos'; 
import MiniCalendar from './components/MiniCalendar'; 
import RequestProjector from './components/RequestProjector'; 
import UploadDocuments from './components/UploadDocuments'; 
import ViewDocuments from './components/ViewDocuments'; 
import SignIn from './components/SignIn'; 
import GradeGroupModal from './components/GradeGroupModal'; 
import { googleLogout } from '@react-oauth/google';
import axios from 'axios';
import AdminDashboard from './components/AdminDashboard';
import WelcomeAlert from './components/WelcomeAlert';

function App() {
  // Modificamos el estado inicial de isAuthenticated a undefined
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [showGradeGroupModal, setShowGradeGroupModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userPicture, setUserPicture] = useState(null);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(false);

  const navigate = useNavigate();

  // Función para manejar usuarios no autenticados
  const handleUnauthenticated = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    setUserPicture(null);
    setShowWelcomeAlert(false);
    navigate('/signin');
  };

  // Función para manejar la navegación
  const handleNavigate = (path) => {
    setCurrentPath(path);
    navigate(path);
  };

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/logout', {}, { 
        withCredentials: true 
      });
      
      // Limpiar todos los estados
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      setUserPicture(null);
      setShowWelcomeAlert(false);
      
      // Limpiar storage
      sessionStorage.clear();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('jwtToken');
      
      // Cerrar sesión de Google
      googleLogout();
      
      // Redirigir a signin
      navigate('/signin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para manejar el envío del formulario de grado y grupo
  const handleGradeGroupSubmit = async (data) => {
    try {
      const response = await axios.put(
        'http://localhost:3000/update-user',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
          },
          withCredentials: true
        }
      );

      if (response.data) {
        setUser(prevUser => ({
          ...prevUser,
          ...data
        }));
        setShowGradeGroupModal(false);
      }
    } catch (error) {
      console.error('Error al actualizar información:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken');
        const storedPicture = sessionStorage.getItem('userPicture');
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        
        if (!token) {
          handleUnauthenticated();
          return;
        }

        const response = await axios.get('http://localhost:3000/check-session', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.user) {
          // Actualizamos todos los estados juntos
          setIsAuthenticated(true);
          setIsAdmin(response.data.user.email === 'proyectoresunach@gmail.com');
          setUser(response.data.user);
          setUserPicture(storedPicture || response.data.user.picture);

          const isNewUser = !response.data.user.grado || 
                          !response.data.user.grupo || 
                          !response.data.user.turno;
          
          if (isNewUser && window.location.pathname === '/dashboard') {
            setShowWelcomeAlert(true);
          }
        } else {
          handleUnauthenticated();
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
        handleUnauthenticated();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Mostramos el loader mientras isAuthenticated es undefined o isLoading es true
  if (isAuthenticated === undefined || isLoading) {
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
    <div className="min-h-screen bg-gray-50 flex">
      {isAuthenticated === true ? (
        <>
          {/* Contenido autenticado */}
          {isAdmin ? (
            <AdminSidebar 
              onNavigate={handleNavigate}
              openGradeGroupModal={() => setShowGradeGroupModal(true)}
              currentPath={currentPath}
            />
          ) : (
            <Sidebar openGradeGroupModal={() => setShowGradeGroupModal(true)} />
          )}
          <main className="flex-1 ml-64 min-h-screen transition-all duration-300">
            <div className="p-4">
              {/* Header con información del usuario */}
              <div className="flex justify-end items-center mb-4 space-x-4 bg-gray-200 p-2 rounded">
                {user && (
                  <>
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      {userPicture && (
                        <img 
                          src={userPicture}
                          alt="Perfil" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Error al cargar la imagen:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <span className="text-gray-700">{user.nombre}</span>
                    <button 
                      onClick={handleLogout} 
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                )}
              </div>

              {/* Rutas */}
              <Routes>
                <Route path="/" element={<Navigate to={isAuthenticated ? (isAdmin ? "/admin-dashboard" : "/dashboard") : "/signin"} />} />
                <Route path="/signin" element={<SignIn setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} />} />
                <Route path="/dashboard" element={isAuthenticated && !isAdmin ? <Dashboard /> : <Navigate to={isAdmin ? "/admin-dashboard" : "/signin"} />} />
                <Route path="/admin-dashboard" element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/signin" />} />
                <Route path="/grupos" element={isAuthenticated ? <Grupos /> : <Navigate to="/signin" />} />
                <Route path="/calendario" element={isAuthenticated ? <MiniCalendar /> : <Navigate to="/signin" />} />
                <Route path="/request-projector" element={isAuthenticated ? <RequestProjector /> : <Navigate to="/signin" />} />
                <Route path="/upload-documents" element={isAuthenticated ? <UploadDocuments /> : <Navigate to="/signin" />} />
                <Route path="/view-documents" element={isAuthenticated ? <ViewDocuments /> : <Navigate to="/signin" />} />
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
                  onSubmit={handleGradeGroupSubmit}
                />
              )}
            </div>
          </main>
        </>
      ) : (
        // Contenido no autenticado
        <div className="w-full">
          <Routes>
            <Route 
              path="/signin" 
              element={
                <SignIn 
                  setIsAuthenticated={setIsAuthenticated} 
                  setIsAdmin={setIsAdmin} 
                />
              } 
            />
            <Route path="*" element={<Navigate to="/signin" />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

export default App;
