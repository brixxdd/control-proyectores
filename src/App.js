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
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showGradeGroupModal, setShowGradeGroupModal] = useState(false);
  const [events, setEvents] = useState([]); // Estado para los eventos
  const [isAdmin, setIsAdmin] = useState(false); // Nuevo estado para administrador

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

          // Comprobar si el usuario es administrador
          if (data.email === 'proyectoresunach@gmail.com') {
            setIsAdmin(true);
          }
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
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && (
        <Sidebar openGradeGroupModal={() => setShowGradeGroupModal(true)} />
      )}
      <main className={`${isAuthenticated ? 'ml-64' : ''} min-h-screen transition-all duration-300`}>
        <div className="p-4">
          <div className="flex justify-end mb-4">
            {isAuthenticated && (
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
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
        </div>
      </main>
    </div>
  );
}

export default App;
