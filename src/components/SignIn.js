import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  
  // Efecto para redirigir si ya hay un token
  useEffect(() => {
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='));
    if (token) {
      navigate('/dashboard'); // Redirige si ya hay un token
    } else {
      setIsLoading(false); // Cambia el estado a no cargando si no hay token
    }
  }, [navigate]);

  const handleSuccess = (response) => {
    if (response.credential) {
      const decoded = jwtDecode(response.credential);
      console.log('Información del usuario decodificada:', decoded);

      if (decoded.email && decoded.email.endsWith('@unach.mx')) {
        console.log('Bienvenido, usuario de UNACH:', decoded.email);

        axios.post('http://localhost:3000/login', { 
          token: response.credential 
        }, { 
          withCredentials: true 
        })
        .then((res) => {
          console.log('Inicio de sesión exitoso:', res.data);
          setIsAuthenticated(true);
          navigate('/');  // Redirigir al dashboard
        })
        .catch((error) => {
          console.error('Error al enviar el token al backend:', error);
          setIsAuthenticated(false);
        });
      } else {
        console.error('Correo no autorizado o campo email faltante');
        setIsAuthenticated(false);
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
        setIsAuthenticated(false); // Reiniciar el estado de autenticación
        googleLogout(); // Cerrar sesión de Google OAuth en el cliente
        navigate('/'); // Redirigir a la página de inicio o donde desees
      })
      .catch((error) => {
        console.error('Error al cerrar sesión:', error);
      });
  };

  return (
    <GoogleOAuthProvider clientId={"217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com"}>
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h2>Iniciar sesión con Google</h2>
    {!isLoading && (
      <div className="google-button-wrapper">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleFailure}
          auto_select={false}
        />
      </div>
    )}
    <button onClick={handleLogout}>Cerrar Sesión</button>
  </div>
</GoogleOAuthProvider>

  );
};

export default SignIn;
