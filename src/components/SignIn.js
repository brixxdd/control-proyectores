import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion'; // Asegúrate de instalar framer-motion


const SignIn = ({ setIsAuthenticated, setIsAdmin }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='));
    if (token) {
      // navigate('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleSuccess = (response) => {
    if (response.credential) {
      const decoded = jwtDecode(response.credential);
      console.log('Información del usuario decodificada:', decoded);
  
      if (decoded.email && (decoded.email.endsWith('@unach.mx') || decoded.email === 'proyectoresunach@gmail.com')) {
        console.log('Bienvenido, usuario autorizado:', decoded.email);
  
        localStorage.setItem('accessToken', response.credential);
  
        axios.post('http://localhost:3000/login', { 
          token: response.credential 
        }, { 
          withCredentials: true 
        })
        .then((res) => {
          console.log('Inicio de sesión exitoso:', res.data);
          setIsAuthenticated(true);
          
          const isAdmin = decoded.email === 'proyectoresunach@gmail.com';
          setIsAdmin(isAdmin);
          
          if (isAdmin) {
            console.log('Redirigiendo a admin-dashboard');
            navigate('/admin-dashboard');
          } else {
            console.log('Redirigiendo a dashboard');
            navigate('/dashboard');
          }
        })
        .catch((error) => {
          console.error('Error al enviar el token al backend:', error);
          setIsAuthenticated(false);
          setIsAdmin(false);
        });
      } else {
        console.error('Correo no autorizado o campo email faltante');
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    }
  };

  const handleFailure = (error) => {
    console.error('Error en la autenticación:', error);
    setIsAuthenticated(false);
  };

  const handleLogout = () => {
    axios.post('http://localhost:3000/logout', {}, { withCredentials: true })
    .then((res) => {
      console.log('Sesión cerrada correctamente:', res.data);
      setIsAuthenticated(false);
      setIsAdmin(false);
      googleLogout();
      navigate('/');
      localStorage.removeItem('accessToken');
    })
    .catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  };
  
  return (
    <GoogleOAuthProvider clientId={"217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com"}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 bg-white rounded-lg shadow-xl"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Iniciar sesión con Google</h2>
          {!isLoading && (
            <div className="flex flex-col items-center space-y-4">
              <div className="google-button-wrapper">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={handleFailure}
                  auto_select={false}
                  render={renderProps => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                      className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
                    >
                      Iniciar sesión con Google
                    </motion.button>
                  )}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-300"
              >
                Cerrar Sesión
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignIn;