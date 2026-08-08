import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentThemeStyles } from '../themes/themeConfig';
import { fetchFromAPI } from '../utils/fetchHelper';

const ForgotPassword = () => {
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme || 'default');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchFromAPI('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
    } catch (error) {
      console.error('Error en forgot-password:', error);
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="h-[100dvh] flex items-center justify-center relative overflow-hidden
                    bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20
                    dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/50
                      rounded-3xl shadow-2xl overflow-hidden
                      border border-white/20 dark:border-gray-700/30">
          <div className="p-6 space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className={`absolute inset-0 bg-gradient-to-tr ${themeStyles.gradient} rounded-full opacity-70 blur-xl`}></div>
              <div className={`relative bg-gradient-to-tr ${themeStyles.gradient} rounded-full w-full h-full flex items-center justify-center shadow-lg`}>
                <KeyRound className="text-white w-8 h-8" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className={`text-2xl font-bold bg-gradient-to-r ${themeStyles.gradient} bg-clip-text text-transparent`}>
                Recuperar contraseña
              </h2>
              <p className="text-sm text-gray-600/90 dark:text-gray-300/90">
                Te enviaremos una liga a tu correo para definir una nueva contraseña
              </p>
            </div>

            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Si el correo existe en nuestro sistema, recibirás una liga para definir tu contraseña.
                </p>
                <Link to="/signin" className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Volver a iniciar sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Correo
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700
                                 border border-gray-200 dark:border-gray-600
                                 text-gray-900 dark:text-white rounded-xl
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="tu.correo@unach.mx"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-xl bg-gradient-to-r ${themeStyles.gradient} p-3
                             text-white font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Enviando...' : 'Enviar liga de recuperación'}
                </button>

                <div className="text-center">
                  <Link to="/signin" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Volver a iniciar sesión
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
