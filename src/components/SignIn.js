import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // Asegúrate de importar correctamente
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = ({ setIsAuthenticated }) => {
  const navigate = useNavigate(); // Hook para la navegación

  const handleSuccess = (response) => {
    if (response.credential) {
      const decoded = jwtDecode(response.credential);  // Decodifica el JWT
      console.log('Información del usuario decodificada:', decoded); // Revisa la estructura completa
  
      // Verifica si el token tiene el campo email y el dominio es @unach.mx
      if (decoded.email && decoded.email.endsWith('@unach.mx')) {
        console.log('Bienvenido, usuario de UNACH:', decoded.email);
  
        // Enviar el token al backend para validación y almacenamiento
        axios.post('http://localhost:3000/login', { 
          token: response.credential 
        }, { 
          withCredentials: true // withCredentials asegura que se manejen cookies
        })
        .then((res) => {
          console.log('Inicio de sesión exitoso:', res.data);
          setIsAuthenticated(true);
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/');  // Redirigir al dashboard
        })
        .catch((error) => {
          console.error('Error al enviar el token al backend:', error);
          setIsAuthenticated(false); // Asegúrate de establecer la autenticación en falso si hay un error
        });
      } else {
        console.error('Correo no autorizado o campo email faltante');
        setIsAuthenticated(false);
      }
    }
  };
  
  const handleFailure = (error) => {
    console.error('Error en la autenticación:', error);
    setIsAuthenticated(false); // Asegúrate de establecer la autenticación en falso si hay un error
  };

  return (
    <GoogleOAuthProvider clientId={"217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com"}>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Iniciar sesión con Google</h2>
        <GoogleLogin onSuccess={handleSuccess} onError={handleFailure} useOneTap />
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignIn;
