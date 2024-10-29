import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import 'animate.css';
import { useAuth } from './hooks/useAuth';

const SignIn = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setIsAdmin, handleLoginSuccess, handleLoginFailure } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para verificar el estado de carga inicial
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Manejo de éxito en el inicio de sesión
  const handleSuccess = async (response) => {
    if (response.credential) {
      const decoded = jwtDecode(response.credential);
      console.log('Información del usuario decodificada:', decoded);
      
      try {
        const res = await axios.post('http://localhost:3000/login', {
          token: response.credential,
          picture: decoded.picture
        }, {
          withCredentials: true
        });

        console.log('Inicio de sesión exitoso:', res.data);

        if (res.data.token) {
          sessionStorage.setItem('jwtToken', res.data.token);
          console.log('Token JWT guardado:', res.data.token);
        }

        if (res.data.user) {
          const userData = {
            ...res.data.user,
            picture: decoded.picture
          };
          sessionStorage.setItem('currentUser', JSON.stringify(userData));
          sessionStorage.setItem('userPicture', decoded.picture);
        }

        const isAdmin = decoded.email === 'proyectoresunach@gmail.com';
        setIsAuthenticated({
          isAuthenticated: true,
          isAdmin,
          user: res.data.user,
          userPicture: decoded.picture,
          isLoading: false
        });

        const isNewUser = !res.data.user.grado || !res.data.user.grupo || !res.data.user.turno;

        if (isNewUser) {
          console.log('Usuario nuevo detectado, mostrando alerta de bienvenida');
        }

        navigate(isAdmin ? '/admin-dashboard' : '/dashboard');

      } catch (error) {
        console.error('Error al enviar el token al backend:', error);
        setIsAuthenticated(false);
        Swal.fire({
          icon: 'error',
          title: 'Error de inicio de sesión',
          text: 'No se pudo iniciar sesión. Por favor, intente nuevamente.',
        });
      }
    }
  };

  // Manejo de fallo en el inicio de sesión
  const handleFailure = (error) => {
    console.error('Error en la autenticación:', error);
    setIsAuthenticated(false);
    Swal.fire({
      icon: 'error',
      title: 'Error de autenticación',
      text: 'No se pudo autenticar con Google. Por favor, intente nuevamente.',
    });
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post('http://localhost:3000/logout', {}, {
        withCredentials: true
      });

      console.log('Sesión cerrada correctamente:', res.data);
      setIsAuthenticated(false);
      setIsAdmin(false);
      googleLogout();

      sessionStorage.clear();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('jwtToken');

      navigate('/signin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cerrar sesión',
        text: 'No se pudo cerrar la sesión correctamente.',
      });
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
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
