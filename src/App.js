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

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    navigate('/signin');
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