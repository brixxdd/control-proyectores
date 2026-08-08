import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, GraduationCap, XCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentThemeStyles } from '../themes/themeConfig';
import { fetchFromAPI } from '../utils/fetchHelper';
import { authService } from '../services/authService';

const GRADO_REGEX = /^[1-9]$/;
const GRUPO_REGEX = /^[a-zA-Z]$/;

const CompleteRegistration = () => {
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme || 'default');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('validando'); // validando | valido | invalido
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [grado, setGrado] = useState('');
  const [grupo, setGrupo] = useState('');
  const [turno, setTurno] = useState('Matutino');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const validar = async () => {
      if (!token) {
        setStatus('invalido');
        return;
      }
      try {
        const data = await fetchFromAPI(`/api/registro/validar/${token}`);
        if (data.valid) {
          setEmail(data.email);
          setStatus('valido');
        } else {
          setStatus('invalido');
        }
      } catch {
        setStatus('invalido');
      }
    };
    validar();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!GRADO_REGEX.test(grado)) {
      setError('El grado debe ser un número del 1 al 9');
      return;
    }
    if (!GRUPO_REGEX.test(grupo)) {
      setError('El grupo debe ser una sola letra (A-Z)');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchFromAPI('/api/registro/completar', {
        method: 'POST',
        body: JSON.stringify({ token, nombre: nombre.trim(), grado, grupo, turno, password })
      });

      authService._handleAuthResponse(data);
      sessionStorage.setItem('currentUser', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err?.message || 'Error al completar el registro');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden py-8
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
                <GraduationCap className="text-white w-8 h-8" />
              </div>
            </div>

            {status === 'validando' && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-300">Validando invitación...</p>
            )}

            {status === 'invalido' && (
              <div className="text-center space-y-4">
                <XCircle className="w-10 h-10 text-red-500 mx-auto" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Esta liga de invitación es inválida o ya expiró. Pide al administrador que te envíe una nueva.
                </p>
                <Link to="/signin" className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Ir al login
                </Link>
              </div>
            )}

            {status === 'valido' && (
              <>
                <div className="text-center space-y-2">
                  <h2 className={`text-2xl font-bold bg-gradient-to-r ${themeStyles.gradient} bg-clip-text text-transparent`}>
                    Completa tu registro
                  </h2>
                  <p className="text-sm text-gray-600/90 dark:text-gray-300/90">{email}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre y apellidos"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Grado</label>
                      <input
                        type="text"
                        value={grado}
                        onChange={(e) => setGrado(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1-9"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Grupo</label>
                      <input
                        type="text"
                        value={grupo}
                        onChange={(e) => setGrupo(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="A-Z"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Turno</label>
                    <select
                      value={turno}
                      onChange={(e) => setTurno(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="Matutino">Matutino</option>
                      <option value="Vespertino">Vespertino</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Mínimo 8 caracteres"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Confirmar contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Repite la contraseña"
                        required
                      />
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-xl bg-gradient-to-r ${themeStyles.gradient} p-3
                               text-white font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loading ? 'Creando cuenta...' : 'Completar registro'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteRegistration;
