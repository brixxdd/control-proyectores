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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGradeGroupModal, setShowGradeGroupModal] = useState(false); // Estado para el modal
  const navigate = useNavigate();

  // Verificar si el usuario tiene una sesión activa
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/check-session', {
          credentials: 'include',
        });
        if (response.ok) {
          setIsAuthenticated(true);
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
      setShowGradeGroupModal(false); // Cierra el modal después de enviar el formulario
    } catch (error) {
      console.error('Error al guardar la información:', error);
    }
  };

  return (
    <div className="flex">
      {isAuthenticated && (
        <Sidebar openGradeGroupModal={() => setShowGradeGroupModal(true)} /> // Pasar la función al Sidebar
      )}
      <div className="content flex-1 p-4">
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          {isAuthenticated && (
            <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#f00', color: '#fff' }}>
              Cerrar sesión
            </button>
          )}
        </div>

        <Routes>
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />} />
          <Route path="/signin" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
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
    </div>
  );
}

export default App;
