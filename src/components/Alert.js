// components/Alert.js
import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Swal from 'sweetalert2'; // Importa SweetAlert2 para las alertas adicionales

const CustomAlert = ({ open, handleClose, severity, message }) => {
  return (
    <Snackbar 
      open={open} 
      autoHideDuration={6000} 
      onClose={handleClose} 
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Cambiar posición aquí
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

// Alerta de éxito usando SweetAlert2
export const alertaExito = (mensaje = '¡Éxito!') => {
  Swal.fire({
    title: mensaje, // Aquí se puede personalizar el título
    text: 'Evento programado correctamente.', // Cambiar el texto aquí
    icon: 'success',
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'popup-class',
      confirmButton: 'confirm-button'
    },
    backdrop: true,
    timer: 4000,
    timerProgressBar: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    stopKeydownPropagation: true,
  });
};

// Alerta de eliminación de eventos usando SweetAlert2
export const alertaEliminacion = (cantidadEliminados) => {
  Swal.fire({
    title: 'Eventos eliminados',
    text: `${cantidadEliminados} evento(s) han sido eliminados.`,
    icon: 'info',
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'popup-class',
      confirmButton: 'confirm-button'
    },
    backdrop: true,
    timer: 4000,
    timerProgressBar: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    stopKeydownPropagation: true,
  });
};



// Alerta de error usando SweetAlert2
export const alertaError = (mensaje = 'Ha ocurrido un error') => {
  Swal.fire({
    title: 'Error',
    text: mensaje,
    icon: 'error',
    confirmButtonText: 'Aceptar',
    customClass: {
      popup: 'popup-class',
      confirmButton: 'confirm-button'
    },
    backdrop: true,
    timer: 4000,
    timerProgressBar: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    stopKeydownPropagation: true,
  });
};

// Alerta personalizada usando SweetAlert2
export const alertaPersonalizada = (titulo, texto, icono) => {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    confirmButtonText: 'Aceptar',
  });
};

export default CustomAlert;
