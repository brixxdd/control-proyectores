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

const CLIENT_ID = "217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com";
const API_KEY = "AIzaSyCGngj5UlwBeDeynle9K-yImbSTwfgWTFg";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const RequestProjector = () => {
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
      await new Promise((resolve, reject) => {
        gapi.load('client:auth2', resolve);
      });

      // 3. Inicializar el cliente
      await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      });

      console.log('GAPI cargado completamente');

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
      throw error; // Propagar el error para manejarlo en el nivel superior
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
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      selected: false
    }));

    setEvents(fetchedEvents);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
  }
};

const createEvent = async (event, token) => {
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
    gapi.client.setToken({
      access_token: accessToken
    });
    const response = await gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    });
    return response.result; // Esto debería incluir el ID del evento
  } catch (error) {
    console.error('Error al crear el evento:', error);
    throw error;
  }
};

  const handleDateChange = (date) => {
    // Crear una nueva fecha y establecer la hora a mediodía
    const localDate = new Date(date);
    localDate.setHours(12, 0, 0, 0);
    const dateStr = localDate.toISOString().split('T')[0];
    
    setSelectedDates(prev => {
      const index = prev.indexOf(dateStr);
      if (index > -1) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
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
      
      if (!jwtToken || !currentUser) {
        console.error("No hay sesión activa");
        return;
      }

      for (const date of selectedDates) {
        const startTime = selectedTimeSlots[date]?.start;
        const endTime = selectedTimeSlots[date]?.end;
    
        if (!startTime || !endTime) {
          console.error(`Faltan horarios para la fecha: ${date}`);
          continue;
        }
    
        const startDate = new Date(`${date}T${startTime}`);
        const endDate = new Date(`${date}T${endTime}`);
    
        // Crear el evento en Google Calendar
        const event = {
          summary: 'Solicitud de proyector',
          start: {
            dateTime: startDate.toISOString(),
            timeZone: 'America/Mexico_City',
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: 'America/Mexico_City',
          },
        };

        try {
          const createdEvent = await createEvent(event, jwtToken);
          
          if (!createdEvent || !createdEvent.id) {
            console.error('No se pudo crear el evento en Google Calendar');
            continue;
          }

          // Crear solicitud en el backend
          const response = await axios.post('http://localhost:3000/solicitar-proyector', 
            {
              fechaInicio: startDate.toISOString(),
              fechaFin: endDate.toISOString(),
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

        {/* Calendario con estilos mejorados para modo oscuro */}
        <div className="calendar-container p-2 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <Calendar
            onChange={handleDateChange}
            value={selectedDates.map(date => new Date(date))}
            minDetail="month"
            maxDetail="month"
            tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6}
            tileClassName={({ date, view }) => {
              if (view !== 'month') return null;
              const dateStr = date.toISOString().split('T')[0];
              const hasEvent = events.some(event => 
                new Date(event.start).toISOString().split('T')[0] === dateStr
              );
              const isSelected = selectedDates.includes(dateStr);
              
              return `calendar-tile ${hasEvent ? 'event-day' : ''} 
                      ${isSelected ? 'selected-date' : ''} 
                      dark:text-white dark:hover:bg-gray-700`;
            }}
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