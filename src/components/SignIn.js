import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { AUTH_CONSTANTS } from '../constants/auth';

const SignIn = () => {
  const { handleLoginSuccess } = useAuth();

  return (
    <GoogleOAuthProvider 
      clientId={AUTH_CONSTANTS.GOOGLE_CLIENT_ID}
      onScriptLoadError={(err) => console.error('Google Script Load Error:', err)}
    >
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 bg-white rounded-lg shadow-xl"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Iniciar sesión con Google
          </h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="google-button-wrapper">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={(error) => {
                  console.error('Error en la autenticación:', error);
                }}
                useOneTap={false}
                cookiePolicy={'single_host_origin'}
                scope="email profile"
                prompt="select_account"
                ux_mode="popup"
                context="signin"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignIn;