import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, RefreshCw, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getCurrentThemeStyles } from '../themes/themeConfig';
import { fetchFromAPI } from '../utils/fetchHelper';
import { alertaExito, alertaError } from './Alert';

const EstadoBadge = ({ invitacion }) => {
  if (invitacion.used) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle className="w-3 h-3" /> Usada
      </span>
    );
  }
  if (new Date(invitacion.expiresAt) < new Date()) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
        <XCircle className="w-3 h-3" /> Expirada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
      <Clock className="w-3 h-3" /> Pendiente
    </span>
  );
};

const AdminInvitaciones = () => {
  const { currentTheme } = useTheme();
  const themeStyles = getCurrentThemeStyles(currentTheme);

  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [invitaciones, setInvitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accionando, setAccionando] = useState(null);

  const cargarInvitaciones = useCallback(async () => {
    try {
      const data = await fetchFromAPI('/api/invitaciones');
      setInvitaciones(data || []);
    } catch (error) {
      console.error('Error al cargar invitaciones:', error);
      alertaError('Error al cargar las invitaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarInvitaciones();
  }, [cargarInvitaciones]);

  const handleInvitar = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setEnviando(true);
    try {
      await fetchFromAPI('/api/invitaciones', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      alertaExito('Invitación enviada correctamente');
      setEmail('');
      cargarInvitaciones();
    } catch (error) {
      console.error('Error al invitar:', error);
      alertaError(error.message || 'No se pudo crear la invitación');
    } finally {
      setEnviando(false);
    }
  };

  const handleReenviar = async (id) => {
    setAccionando(id);
    try {
      await fetchFromAPI(`/api/invitaciones/${id}/reenviar`, { method: 'POST' });
      alertaExito('Invitación reenviada');
      cargarInvitaciones();
    } catch (error) {
      console.error('Error al reenviar:', error);
      alertaError(error.message || 'No se pudo reenviar la invitación');
    } finally {
      setAccionando(null);
    }
  };

  const handleRevocar = async (id) => {
    setAccionando(id);
    try {
      await fetchFromAPI(`/api/invitaciones/${id}`, { method: 'DELETE' });
      alertaExito('Invitación revocada');
      cargarInvitaciones();
    } catch (error) {
      console.error('Error al revocar:', error);
      alertaError(error.message || 'No se pudo revocar la invitación');
    } finally {
      setAccionando(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl bg-gradient-to-br ${themeStyles.gradient} p-6 text-white shadow-lg`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Invitaciones</h1>
            <p className="text-sm text-white/80">
              Da de alta usuarios enviándoles una liga de registro por correo
            </p>
          </div>
        </div>
      </motion.div>

      {/* Formulario de invitación */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <form onSubmit={handleInvitar} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@unach.mx"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={enviando}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r ${themeStyles.gradient} hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0`}
          >
            {enviando ? 'Enviando...' : 'Invitar'}
          </button>
        </form>
      </div>

      {/* Lista de invitaciones */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Historial de invitaciones</p>
        </div>

        {loading ? (
          <p className="p-5 text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
        ) : invitaciones.length === 0 ? (
          <p className="p-5 text-sm text-gray-500 dark:text-gray-400">Aún no has enviado invitaciones.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {invitaciones.map((inv) => {
              const expirada = !inv.used && new Date(inv.expiresAt) < new Date();
              return (
                <div key={inv._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{inv.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Invitado por {inv.invitedBy?.nombre || 'admin'} · expira {new Date(inv.expiresAt).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <EstadoBadge invitacion={inv} />
                    {!inv.used && (
                      <>
                        {expirada && (
                          <button
                            onClick={() => handleReenviar(inv._id)}
                            disabled={accionando === inv._id}
                            title="Reenviar"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-gray-400 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRevocar(inv._id)}
                          disabled={accionando === inv._id}
                          title="Revocar"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-gray-400 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInvitaciones;
