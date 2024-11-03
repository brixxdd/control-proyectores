import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import ReactDOM from 'react-dom/client';


// Componente base para la notificación tipo toast
const Toast = ({ open, handleClose, severity, message }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        handleClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [open, handleClose]);

  if (!open) return null;

  const severityStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center p-4 rounded-lg border ${severityStyles[severity]} shadow-lg max-w-md`}>
        <div className="flex-shrink-0">
          {iconMap[severity]}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 flex-shrink-0 rounded-md p-1.5 hover:bg-opacity-20 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const modalStyles = {
  enter: 'transform transition-all duration-300 ease-out',
  enterFrom: 'opacity-0 scale-95 translate-y-4',
  enterTo: 'opacity-100 scale-100 translate-y-0',
  leave: 'transform transition-all duration-200 ease-in',
  leaveFrom: 'opacity-100 scale-100',
  leaveTo: 'opacity-0 scale-95'
};

const Modal = ({ isOpen, onClose, title, message, icon, confirmButtonText }) => {
  if (!isOpen) return null;

  const iconMap = {
    success: <CheckCircle className="w-12 h-12 text-green-600 mx-auto animate-bounce" />,
    error: <AlertCircle className="w-12 h-12 text-red-600 mx-auto animate-shake" />,
    info: <Info className="w-12 h-12 text-blue-600 mx-auto animate-pulse" />
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300" 
          onClick={onClose} 
        />
        
        <div className={`
          inline-block rounded-lg bg-white text-left align-bottom shadow-xl 
          sm:my-8 sm:w-full sm:max-w-lg sm:align-middle
          ${modalStyles.enter}
          animate-modal-slide-up
        `}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="mb-4 transform transition-all duration-500 hover:scale-110">
                  {iconMap[icon]}
                </div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 text-center mb-2">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 text-center">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent 
                         bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm 
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm
                         transform transition-all duration-200 hover:scale-105"
              onClick={onClose}
            >
              {confirmButtonText || 'Aceptar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Funciones de alerta
export const alertaExito = (mensaje = '¡Éxito!') => {
  const modalRoot = document.createElement('div');
  document.body.appendChild(modalRoot);

  const cleanup = () => {
    document.body.removeChild(modalRoot);
  };

  const App = () => {
    const [isOpen, setIsOpen] = React.useState(true);

    const handleClose = () => {
      setIsOpen(false);
      setTimeout(cleanup, 300);
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={mensaje}
        message="Evento programado correctamente."
        icon="success"
        confirmButtonText="Aceptar"
      />
    );
  };

  const root = ReactDOM.createRoot(modalRoot);
  root.render(<App />);
};

export const alertaEliminacion = (cantidadEliminados) => {
  const modalRoot = document.createElement('div');
  document.body.appendChild(modalRoot);

  const cleanup = () => {
    document.body.removeChild(modalRoot);
  };

  const App = () => {
    const [isOpen, setIsOpen] = React.useState(true);

    const handleClose = () => {
      setIsOpen(false);
      setTimeout(cleanup, 300);
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Eventos eliminados"
        message={`${cantidadEliminados} evento(s) han sido eliminados.`}
        icon="info"
        confirmButtonText="Aceptar"
      />
    );
  };

  const root = ReactDOM.createRoot(modalRoot);
  root.render(<App />);
};


export const alertaError = (mensaje = 'Ha ocurrido un error') => {
  const modalRoot = document.createElement('div');
  document.body.appendChild(modalRoot);

  const cleanup = () => {
    document.body.removeChild(modalRoot);
  };

  const App = () => {
    const [isOpen, setIsOpen] = React.useState(true);

    const handleClose = () => {
      setIsOpen(false);
      setTimeout(cleanup, 300);
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Error"
        message={mensaje}
        icon="error"
        confirmButtonText="Aceptar"
      />
    );
  };

  React.render(<App />, modalRoot);
};

export const alertaPersonalizada = (titulo, texto, icono) => {
  const modalRoot = document.createElement('div');
  document.body.appendChild(modalRoot);

  const cleanup = () => {
    document.body.removeChild(modalRoot);
  };

  const App = () => {
    const [isOpen, setIsOpen] = React.useState(true);

    const handleClose = () => {
      setIsOpen(false);
      setTimeout(cleanup, 300);
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={titulo}
        message={texto}
        icon={icono}
        confirmButtonText="Aceptar"
      />
    );
  };

  React.render(<App />, modalRoot);
};

// Componente principal para notificaciones tipo toast
const CustomAlert = ({ open, handleClose, severity, message }) => {
  return (
    <Toast
      open={open}
      handleClose={handleClose}
      severity={severity}
      message={message}
    />
  );
};
export default CustomAlert;
