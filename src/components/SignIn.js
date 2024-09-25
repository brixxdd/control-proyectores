import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // Asegúrate de importar correctamente
import { useNavigate } from 'react-router-dom';

const SignIn = ({ setIsAuthenticated }) => {
  const navigate = useNavigate(); // Hook para navegación

  const handleSuccess = (response) => {
    if (response.credential) {
      const decoded = jwtDecode(response.credential);
      console.log('Información del usuario:', decoded);

      if (decoded.email.endsWith('@unach.mx')) {
        console.log('Bienvenido, usuario de UNACH:', decoded.email);
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true'); // Guardar estado de autenticación
        navigate('/'); // Redirigir al Dashboard después de un login exitoso
      } else {
        console.error('Correo no autorizado');
        setIsAuthenticated(false);
      }
    }
  };

  const handleFailure = (error) => {
    console.error('Error en la autenticación:', error);
  };

  return (
    <GoogleOAuthProvider clientId="217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com">
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Iniciar sesión con Google</h2>
        <GoogleLogin onSuccess={handleSuccess} onError={handleFailure} useOneTap />
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignIn;
