import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv, faCalendarPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { gapi } from 'gapi-script';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import './RequestProjector.css';
import TimeSelectionModal from './TimeSelectionModal'; 
import DeleteEventModal from './DeleteEventModal';
import { useTimeZone } from '../contexts/TimeZoneContext';
import { zonedTimeToUtc, utcToZonedTime, formatInTimeZone } from 'date-fns-tz';

const CLIENT_ID = "217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com";
const API_KEY = "AIzaSyCGngj5UlwBeDeynle9K-yImbSTwfgWTFg";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const RequestProjector = () => {
  const { currentTime, targetTimeZone } = useTimeZone();
  const [token, setToken] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false); 

  const [timeSlots, setTimeSlots] = useState({}); 
  const DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
];

useEffect(() => {
  const loadGapi = async () => {
    try {
      // 1. Cargar el script de GAPI
      if (!window.gapi) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      // 2. Cargar el cliente y auth2
      await new Promise((resolve) => {
        gapi.load('client:auth2', resolve);
      });

      // 3. Inicializar el cliente
      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      });

      // 4. Inicializar auth2 y manejar la autenticación
      const auth2 = gapi.auth2.getAuthInstance();
      console.log(`Estado de autenticación: ${auth2.isSignedIn.get() ? 'autenticado' : 'no autenticado'}`);
      
      // 5. Manejar el token
      const currentUser = auth2.currentUser.get();
      let accessToken = currentUser.getAuthResponse().access_token;
      
      if (accessToken === sessionStorage.getItem('accessRequest')) {
        console.log('Misma sesión');
      } else {
        accessToken = sessionStorage.getItem('accessRequest');
        console.log('Nueva sesión');
      }

      // 6. Configurar el token
      gapi.client.setToken({
        access_token: accessToken
      });

      console.log('GAPI inicializado correctamente con token de acceso');
      await fetchEvents();

    } catch (error) {
      console.error('Error al cargar GAPI:', error);
    }
  };

  loadGapi();
}, []);

const fetchEvents = async () => {
  try {
    console.log('Obteniendo eventos con token:', gapi.client.getToken());
    const response = await gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': new Date(new Date().getFullYear(), 0, 1).toISOString(),
      'timeMax': new Date(new Date().getFullYear(), 11, 31).toISOString(),
      'singleEvents': true,
      'orderBy': 'startTime',
      'q': 'Solicitud de proyector'
    });

    console.log('Eventos obtenidos:', response.result.items);
    const fetchedEvents = response.result.items.map(event => ({
      id: event.id,
      summary: event.summary,
      start: utcToZonedTime(new Date(event.start.dateTime || event.start.date), targetTimeZone),
      end: utcToZonedTime(new Date(event.end.dateTime || event.end.date), targetTimeZone),
      selected: false
    }));

    setEvents(fetchedEvents);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    
    if (error.status === 401) {
      const auth2 = gapi.auth2.getAuthInstance();
      try {
        await auth2.signIn();
        const currentUser = auth2.currentUser.get();
        const newToken = currentUser.getAuthResponse().access_token;
        sessionStorage.setItem('accessRequest', newToken);
        gapi.client.setToken({
          access_token: newToken
        });
        await fetchEvents();
      } catch (signInError) {
        console.error('Error al renovar la sesión:', signInError);
      }
    }
  }
};

const createEvent = async (event) => {
  try {
    const auth2 = gapi.auth2.getAuthInstance();
    const currentUser = auth2.currentUser.get();
    let accessToken = currentUser.getAuthResponse().access_token;
    
    if (accessToken === sessionStorage.getItem('accessRequest')) {
      console.log('Misma sesión');
    } else {
      accessToken = sessionStorage.getItem('accessRequest');
      console.log('Nueva sesión');
    }

    console.log('Creando evento con datos:', event);

    gapi.client.setToken({
      access_token: accessToken
    });

    // Convertir las fechas a la zona horaria correcta
    const startDateTime = utcToZonedTime(new Date(event.start.dateTime), targetTimeZone);
    const endDateTime = utcToZonedTime(new Date(event.end.dateTime), targetTimeZone);

    const response = await gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': {
        summary: event.summary,
        start: {
          dateTime: formatInTimeZone(startDateTime, targetTimeZone, "yyyy-MM-dd'T'HH:mm:ss"),
          timeZone: targetTimeZone
        },
        end: {
          dateTime: formatInTimeZone(endDateTime, targetTimeZone, "yyyy-MM-dd'T'HH:mm:ss"),
          timeZone: targetTimeZone
        }
      }
    });

    return response.result;
  } catch (error) {
    console.error('Error detallado al crear evento:', error);
    throw error;
  }
};

const handleDateChange = (newDate) => {
  if (newDate && newDate instanceof Date && !isNaN(newDate)) {
    // Convertir la fecha a la zona horaria objetivo
    const zonedDate = utcToZonedTime(newDate, targetTimeZone);
    zonedDate.setHours(0, 0, 0, 0);
    
    const dateStr = formatInTimeZone(zonedDate, targetTimeZone, 'yyyy-MM-dd');
    
    console.log('Fecha seleccionada:', {
      original: newDate,
      zonedDate: zonedDate,
      dateStr: dateStr,
      targetTimeZone
    });

    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      }
      return [...prev, dateStr].sort();
    });
  }
};

// Función para obtener el inicio y fin de la semana actual
const getWeekBounds = () => {
  const today = new Date();
  const first = today.getDate() - today.getDay() + 1; // Primer día (Lunes)
  const last = first + 4; // Último día (Viernes)

  const monday = new Date(today.setDate(first));
  monday.setHours(0, 0, 0, 0);
  
  const friday = new Date(today.setDate(last));
  friday.setHours(23, 59, 59, 999);

  return { monday, friday };
};

// Versión 2: Habilitar siguiente semana solo los viernes a las 21:00
const tileDisabled = ({ date }) => {
  const { monday, friday } = getWeekBounds();
  const day = date.getDay();
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const isCurrentlyFriday = currentTime.getDay() === 5; // 5 es viernes
  
  // Si es viernes después de las 14:00, permitir la siguiente semana
  if (isCurrentlyFriday && currentHour >= 14) {
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    const nextFriday = new Date(friday);
    nextFriday.setDate(friday.getDate() + 7);
    
    // Deshabilitar fines de semana y días fuera de la siguiente semana
    return date < nextMonday || 
           date > nextFriday || 
           day === 0 || 
           day === 6;
  }
  
  // Comportamiento normal si no es viernes o antes de las 21:00
  return date < monday || 
         date > friday || 
         day === 0 || 
         day === 6;
};

const tileClassName = ({ date, view }) => {
  if (view !== 'month') return null;
  
  // Convertir la fecha del tile a la zona horaria objetivo
  const zonedDate = utcToZonedTime(date, targetTimeZone);
  const dateStr = formatInTimeZone(zonedDate, targetTimeZone, 'yyyy-MM-dd');
  
  const hasEvent = events.some(event => {
    const eventDate = utcToZonedTime(new Date(event.start), targetTimeZone);
    const eventDateStr = formatInTimeZone(eventDate, targetTimeZone, 'yyyy-MM-dd');
    return eventDateStr === dateStr;
  });
  
  const isSelected = selectedDates.includes(dateStr);
  
  return `calendar-tile ${hasEvent ? 'event-day' : ''} 
          ${isSelected ? 'selected-date' : ''} 
          dark:text-white dark:hover:bg-gray-700`;
};

const handleRequest = async () => {
  try {
    console.log('Iniciando solicitud de proyector...');
    
    // Verificar si tenemos el token
    const googleCredential = sessionStorage.getItem('googleAccessToken');
    if (!googleCredential) {
      console.error('No hay token de autenticación');
      return;
    }

    if (selectedDates.length === 0) {
      alert("Por favor selecciona al menos un día entre lunes y viernes.");
      return;
    }

    const validDates = selectedDates.map(dateStr => {
      const date = new Date(dateStr + 'T00:00:00');
      const day = date.getDay();

      if (day === 0 || day === 6) {
        alert("Por favor selecciona solo días de lunes a viernes.");
        return null;
      }

      return date;
    }).filter(date => date !== null);

    if (validDates.length > 0) {
      console.log('Abriendo modal de selección de tiempo...');
      setShowTimeModal(true);
    }
  } catch (error) {
    console.error('Error detallado:', error);
    alert('Hubo un error al procesar tu solicitud. Revisa la consola para más detalles.');
  }
};

const handleConfirmTimeSlots = async (selectedTimeSlots) => {
  try {
    const jwtToken = sessionStorage.getItem('jwtToken');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const googleToken = sessionStorage.getItem('accessRequest');
    
    if (!jwtToken || !currentUser || !googleToken) {
      console.error("No hay sesión activa o faltan credenciales");
      return;
    }

    for (const date of selectedDates) {
      const startTime = selectedTimeSlots[date]?.start;
      const endTime = selectedTimeSlots[date]?.end;
  
      if (!startTime || !endTime) {
        console.error(`Faltan horarios para la fecha: ${date}`);
        continue;
      }
  
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      console.log('Fechas a usar:', {
        start: startDateTime,
        end: endDateTime
      });

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        console.error('Fechas inválidas:', { startDateTime, endDateTime });
        continue;
      }

      const event = {
        summary: 'Solicitud de proyector',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: targetTimeZone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: targetTimeZone,
        },
      };

      try {
        const createdEvent = await createEvent(event);
        
        if (!createdEvent || !createdEvent.id) {
          console.error('No se pudo crear el evento en Google Calendar');
          continue;
        }

        // Crear solicitud en el backend
        const response = await axios.post('http://localhost:3000/solicitar-proyector', 
          {
            fechaInicio: startDateTime.toISOString(),
            fechaFin: endDateTime.toISOString(),
            motivo: 'Solicitud de proyector',
            eventId: createdEvent.id,
            grado: currentUser?.grado,
            grupo: currentUser?.grupo,
            turno: currentUser?.turno
          },
          {
            headers: {
              'Authorization': `Bearer ${jwtToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Solicitud creada:', response.data);
      } catch (error) {
        console.error('Error detallado:', error.response?.data || error);
        throw error;
      }
    }

    setShowTimeModal(false);
    fetchEvents();

  } catch (error) {
    console.error('Error al procesar las solicitudes:', error);
    alert('Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.');
  }
};

const handleDeleteEvents = async (eventIds) => {
  const savedToken = localStorage.getItem('accessToken');
  if (!savedToken) {
    console.error("El token no está disponible");
    return;
  }

  for (const eventId of eventIds) {
    try {
      await axios.delete(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });
      console.log(`Evento ${eventId} eliminado`);
    } catch (error) {
      console.error(`Error al eliminar el evento ${eventId}:`, error);
    }
  }

  fetchEvents();
  setShowModal(false);
};

const toggleEventSelection = (id) => {
  setEvents(prevEvents =>
    prevEvents.map(event =>
      event.id === id ? { ...event, selected: !event.selected } : event
    )
  );
};

return (
  <div className="min-h-screen p-2 sm:p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
    {/* Contenedor principal */}
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
      {/* Encabezado */}
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 sm:p-6 rounded-full mb-4">
          <FontAwesomeIcon 
            icon={faTv} 
            className="text-blue-600 dark:text-blue-300 h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16" 
          />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Solicitud de Proyector
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Selecciona las fechas en las que necesitas el proyector
        </p>
      </div>

      {/* Reloj en zona horaria fija */}
      <div className="text-center mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Zona horaria: Ciudad de Tapachula, Chiapas
        </div>
        <div className="text-lg font-mono text-gray-800 dark:text-gray-100">
          {formatInTimeZone(currentTime, targetTimeZone, 'HH:mm:ss')}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatInTimeZone(currentTime, targetTimeZone, 'dd/MM/yyyy')}
        </div>
      </div>

      {/* Calendario con estilos mejorados para modo oscuro */}
      <div className="calendar-container p-2 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <Calendar
          onChange={handleDateChange}
          value={selectedDates.map(date => new Date(date))}
          minDetail="month"
          maxDetail="month"
          tileDisabled={tileDisabled}
          tileClassName={tileClassName}
          className="w-full dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Botones con estilos mejorados */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6">
        <button
          onClick={handleRequest}
          className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 
                   bg-blue-600 dark:bg-blue-500 text-white rounded-lg
                   hover:bg-blue-700 dark:hover:bg-blue-600 
                   focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700"
        >
          <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
          Solicitar Proyector
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 
                   bg-red-600 dark:bg-red-500 text-white rounded-lg
                   hover:bg-red-700 dark:hover:bg-red-600 
                   focus:ring-4 focus:ring-red-300 dark:focus:ring-red-700"
        >
          <FontAwesomeIcon icon={faTrash} className="mr-2" />
          Eliminar Eventos
        </button>
      </div>

      {/* Modales */}
      <DeleteEventModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleDelete={handleDeleteEvents}
        events={events}
        toggleEventSelection={toggleEventSelection}
        className="max-w-lg mx-auto"
      />

      <TimeSelectionModal
        show={showTimeModal}
        handleClose={() => setShowTimeModal(false)}
        selectedDates={selectedDates}
        handleConfirm={handleConfirmTimeSlots}
        className="max-w-lg mx-auto"
      />
    </div>
  </div>
);
};

export default RequestProjector;