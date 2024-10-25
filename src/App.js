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
  const [events, setEvents] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPath, setCurrentPath] = useState('/dashboard');

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
          setIsAdmin(data.email === 'proyectoresunach@gmail.com');
          console.log('Estado de autenticación:', data.isAuthenticated, 'Es admin:', data.email === 'proyectoresunach@gmail.com');
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
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
