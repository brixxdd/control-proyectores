import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar'; 
import Dashboard from './components/Dashboard'; 
import Grupos from './components/Grupos'; 
import MiniCalendar from './components/MiniCalendar'; 
import RequestProjector from './components/RequestProjector'; 
import UploadDocuments from './components/UploadDocuments'; 
import ViewDocuments from './components/ViewDocuments'; 
import SignIn from './components/SignIn'; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const navigate = useNavigate();

  // Verificar si el usuario tiene una sesión activa
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/check-session', {
          credentials: 'include', // Incluye cookies en la solicitud
        });
        if (response.ok) {
          setIsAuthenticated(true); // Usuario autenticado
        } else {
          setIsAuthenticated(false); // No autenticado
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      navigate('/signin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="flex">
      {isAuthenticated && <Sidebar />} {/* Mostrar Sidebar si está autenticado */}
      <div className="content flex-1 p-4">
        {isAuthenticated && (
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#f00', color: '#fff' }}>
              Cerrar sesión
            </button>
          </div>
        )}
        <Routes>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />} />
          <Route path="/signin" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/grupos" element={isAuthenticated ? <Grupos /> : <Navigate to="/signin" />} />
          <Route path="/calendario" element={isAuthenticated ? <MiniCalendar /> : <Navigate to="/signin" />} />
          <Route path="/request-projector" element={isAuthenticated ? <RequestProjector /> : <Navigate to="/signin" />} />
          <Route path="/upload-documents" element={isAuthenticated ? <UploadDocuments /> : <Navigate to="/signin" />} />
          <Route path="/view-documents" element={isAuthenticated ? <ViewDocuments /> : <Navigate to="/signin" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
