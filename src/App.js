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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showGradeGroupModal, setShowGradeGroupModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userPicture, setUserPicture] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken');
        const storedPicture = sessionStorage.getItem('userPicture');
        console.log('Token:', token ? 'Existe' : 'No existe');
        console.log('Imagen almacenada:', storedPicture);
        
        if (token) {
          const response = await axios.get('http://localhost:3000/check-session', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('Respuesta del servidor:', response.data);
          
          if (response.data.user) {
            setIsAuthenticated(true);
            setIsAdmin(response.data.user.email === 'proyectoresunach@gmail.com');
            setUser(response.data.user);
            setUserPicture(storedPicture || response.data.user.picture);
            console.log('Usuario autenticado:', response.data.user);
            console.log('Imagen de perfil establecida:', storedPicture || response.data.user.picture);
          } else {
            console.log('No se encontró información del usuario en la respuesta');
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUser(null);
          }
        } else {
          console.log('No se encontró token JWT');
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    axios.post('http://localhost:3000/logout', {}, { withCredentials: true })
      .then((res) => {
        console.log('Sesión cerrada correctamente:', res.data);
        setIsAuthenticated(false);
        setIsAdmin(false);
        googleLogout();
        navigate('/');
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

  const handleNavigate = (path) => {
    setCurrentPath(path);
    navigate(path);
  };

  if (isLoading) {
    return <div>Cargando...</div>; // O un componente de carga más elaborado
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isAuthenticated && (
        isAdmin ? (
          <AdminSidebar 
            onNavigate={handleNavigate}
            openGradeGroupModal={() => setShowGradeGroupModal(true)}
            currentPath={currentPath}
          />
        ) : (
          <Sidebar openGradeGroupModal={() => setShowGradeGroupModal(true)} />
        )
      )}
      <main className={`flex-1 ${isAuthenticated ? 'ml-64' : ''} min-h-screen transition-all duration-300`}>
        <div className="p-4">
          <div className="flex justify-end items-center mb-4 space-x-4 bg-gray-200 p-2 rounded">
            {isAuthenticated && user ? (
              <>
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {userPicture ? (
                    <img 
                      src={userPicture}
                      alt="Perfil" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error al cargar la imagen:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-gray-500">No img</span>
                  )}
                </div>
                <span className="text-gray-700">{user.nombre || 'Usuario'}</span>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <span>No autenticado</span>
            )}
          </div>
  
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
