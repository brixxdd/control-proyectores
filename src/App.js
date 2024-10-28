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
  const [authState, setAuthState] = useState({
    isAuthenticated: undefined,
    isAdmin: false,
    user: null,
    userPicture: null,
    isLoading: true
  });
  const [showGradeGroupModal, setShowGradeGroupModal] = useState(false);
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(false);

  const navigate = useNavigate();

  const MemoizedSidebar = React.memo(Sidebar);
  const MemoizedAdminSidebar = React.memo(AdminSidebar);

  // Actualiza el estado en batch
  const updateAuthState = (updates) => {
    setAuthState(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Función para manejar usuarios no autenticados
  const handleUnauthenticated = () => {
    updateAuthState({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      userPicture: null,
      isLoading: false
    });
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
      updateAuthState({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        userPicture: null,
        isLoading: false
      });
      
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
        updateAuthState({
          user: prevUser => ({
            ...prevUser,
            ...data
          }),
          showGradeGroupModal: false
        });
      }
    } catch (error) {
      console.error('Error al actualizar información:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      updateAuthState({
        isLoading: true
      });
  
      try {
        const token = sessionStorage.getItem('jwtToken');
        
        if (!token) {
          handleUnauthenticated();
          return;
        }
  
        const response = await axios.get('http://localhost:3000/check-session', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.user) {
          // Actualiza todos los estados en batch
          const updates = {
            isAuthenticated: true,
            isAdmin: response.data.user.email === 'proyectoresunach@gmail.com',
            user: response.data.user,
            userPicture: sessionStorage.getItem('userPicture') || response.data.user.picture,
            isLoading: false
          };
  
          updateAuthState(updates);
  
          // Muestra la alerta de bienvenida para usuarios nuevos
          if (!response.data.user.grado || !response.data.user.grupo || !response.data.user.turno) {
            setShowWelcomeAlert(window.location.pathname === '/dashboard');
          }
        } else {
          handleUnauthenticated();
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
        handleUnauthenticated();
      } finally {
        updateAuthState({
          isLoading: false
        });
      }
    };
  
    checkAuth();
  }, []); // Solo se ejecuta una vez al montar el componente
   // Asegúrate de que las dependencias estén vacías si solo quieres que se ejecute una vez

  // Mostramos el loader mientras isAuthenticated es undefined o isLoading es true
  if (authState.isLoading) {
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
      {/* Sidebar condicional */}
      {authState.isAuthenticated && (
        authState.isAdmin ? (
          <MemoizedAdminSidebar 
            onNavigate={handleNavigate}
            openGradeGroupModal={() => setShowGradeGroupModal(true)}
            currentPath={currentPath}
          />
        ) : (
          <MemoizedSidebar openGradeGroupModal={() => setShowGradeGroupModal(true)} />
        )
      )}

      {/* Contenido principal */}
      <main className={`flex-1 ${authState.isAuthenticated ? 'ml-64' : ''} min-h-screen transition-all duration-300`}>
        <div className="p-4">
          {/* Header del usuario (solo se muestra si está autenticado) */}
          {authState.isAuthenticated && (
            <div className="flex justify-end items-center mb-4 space-x-4 bg-gray-200 p-2 rounded">
              {authState.user && (
                <>
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    {authState.userPicture && (
                      <img 
                        src={authState.userPicture}
                        alt="Perfil" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Error al cargar la imagen:', e);
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <span className="text-gray-700">{authState.user.nombre}</span>
                  <button 
                    onClick={handleLogout} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
            </div>
          )}

          {/* Rutas unificadas */}
          <Routes>
            {/* Ruta raíz con redirección condicional */}
            <Route 
              path="/" 
              element={
                <Navigate 
                  to={
                    authState.isAuthenticated 
                      ? (authState.isAdmin ? "/admin-dashboard" : "/dashboard") 
                      : "/signin"
                  } 
                />
              } 
            />

            {/* Ruta de inicio de sesión */}
            <Route 
              path="/signin" 
              element={
                authState.isAuthenticated 
                  ? <Navigate to="/dashboard" />
                  : <SignIn setIsAuthenticated={updateAuthState} setIsAdmin={updateAuthState} />
              } 
            />

            {/* Rutas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                authState.isAuthenticated && !authState.isAdmin 
                  ? <Dashboard /> 
                  : <Navigate to={authState.isAdmin ? "/admin-dashboard" : "/signin"} />
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                authState.isAuthenticated && authState.isAdmin 
                  ? <AdminDashboard /> 
                  : <Navigate to="/signin" />
              } 
            />
            <Route 
              path="/grupos" 
              element={
                authState.isAuthenticated 
                  ? <Grupos /> 
                  : <Navigate to="/signin" />
              } 
            />
            <Route 
              path="/calendario" 
              element={
                authState.isAuthenticated 
                  ? <MiniCalendar /> 
                  : <Navigate to="/signin" />
              } 
            />
            <Route 
              path="/request-projector" 
              element={
                authState.isAuthenticated 
                  ? <RequestProjector /> 
                  : <Navigate to="/signin" />
              } 
            />
            <Route 
              path="/upload-documents" 
              element={
                authState.isAuthenticated 
                  ? <UploadDocuments /> 
                  : <Navigate to="/signin" />
              } 
            />
            <Route 
              path="/view-documents" 
              element={
                authState.isAuthenticated 
                  ? <ViewDocuments /> 
                  : <Navigate to="/signin" />
              } 
            />

            {/* Ruta para manejar URLs no encontradas */}
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
              onSubmit={handleGradeGroupSubmit}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
