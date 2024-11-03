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
          await new Promise((resolve) => {
              const script = document.createElement('script');
              script.src = 'https://apis.google.com/js/api.js';
              script.onload = resolve;
              document.body.appendChild(script);
          });

          await gapi.load('client:auth2', async () => {
              await gapi.client.init({
                  apiKey: API_KEY,
                  clientId: CLIENT_ID,
                  discoveryDocs: DISCOVERY_DOCS,
                  scope: SCOPES,
              });

              // Verifica el estado de la autenticación
              const authInstance = gapi.auth2.getAuthInstance();
              if (authInstance.isSignedIn.get()) {
                  const user = authInstance.currentUser.get();
                  const accessToken = user.getAuthResponse().access_token;
                  setToken(accessToken);
                  localStorage.setItem('accessToken', accessToken);
                  await fetchEvents();
              }

              // Escucha cambios en el estado de autenticación
              authInstance.isSignedIn.listen((isSignedIn) => {
                  if (isSignedIn) {
                      fetchEvents();
                  } else {
                      setEvents([]);
                  }
              });
          });
      } catch (error) {
          console.error('Error al cargar gapi o inicializar cliente:', error);
      }
  };

  loadGapi();
}, []);

  const fetchEvents = async () => {
    try {
        // Primero verifica si el usuario está autenticado
        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance.isSignedIn.get()) {
            await handleSignIn();
            return;
        }

        // Obtén el token fresco directamente del usuario actual
        const user = authInstance.currentUser.get();
        const currentToken = user.getAuthResponse().access_token;

        const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
        const endOfYear = new Date(new Date().getFullYear(), 11, 31).toISOString();

        // Usa gapi.client en lugar de axios para manejar automáticamente la autorización
        const response = await gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': startOfYear,
            'timeMax': endOfYear,
            'singleEvents': true,
            'orderBy': 'startTime',
            'q': 'Solicitud de proyector'
        });

        const fetchedEvents = response.result.items.map(event => ({
            id: event.id,
            summary: event.summary,
            start: new Date(event.start.dateTime || event.start.date),
            end: new Date(event.end.dateTime || event.end.date),
            selected: false
        }));

        setEvents(fetchedEvents);
    } catch (error) {
        console.error('Error al obtener los eventos del calendario:', error);
        if (error.status === 401 || error.status === 403) {
            // Si el error es de autorización, intenta renovar el token
            try {
                await handleSignIn();
                // Vuelve a intentar fetchEvents después de renovar el token
                fetchEvents();
            } catch (signInError) {
                console.error('Error al renovar la autenticación:', signInError);
            }
        }
    }
};


const handleSignIn = async () => {
  try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn({
          scope: SCOPES
      });
      
      const user = authInstance.currentUser.get();
      const accessToken = user.getAuthResponse().access_token;
      
      // Inicializa el cliente de gapi con el nuevo token
      await gapi.client.setToken({
          access_token: accessToken
      });

      setToken(accessToken);
      localStorage.setItem('accessToken', accessToken);
      
      return accessToken;
  } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
  }
};

  const createEvent = async (event, token) => {
    try {
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
    // Ajustar la fecha para la zona horaria local
    const adjustedDate = new Date(date.setHours(12, 0, 0, 0));
    const dateStr = adjustedDate.toISOString().split('T')[0];
    
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
      const authInstance = gapi.auth2.getAuthInstance();
      console.log('Estado de autenticación:', authInstance?.isSignedIn.get());
      
      if (!authInstance.isSignedIn.get()) {
        await handleSignIn();
        return;
      }

      const user = authInstance.currentUser.get();
      const currentToken = user.getAuthResponse().access_token;

      const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endOfYear = new Date(new Date().getFullYear(), 11, 31).toISOString();

      const response = await gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': startOfYear,
        'timeMax': endOfYear,
        'singleEvents': true,
        'orderBy': 'startTime',
        'q': 'Solicitud de proyector'
      });

      const fetchedEvents = response.result.items.map(event => ({
        id: event.id,
        summary: event.summary,
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        selected: false
      }));

      setEvents(fetchedEvents);

      if (selectedDates.length === 0) {
        alert("Por favor selecciona al menos un día entre lunes y viernes.");
        return;
      }

      const validDates = selectedDates.map(dateStr => {
        const date = new Date(dateStr + 'T00:00:00');
        const day = date.getDay();

        if (day === 0 || day === 6) {
          alert("Por favor selecciona solo días de lunes a viernes.");
          return null; // Retorna null si el día no es válido
        }

        return date; // Retorna la fecha si es válida
      }).filter(date => date !== null); // Filtra los null

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
    setTimeSlots(selectedTimeSlots);
    const jwtToken = sessionStorage.getItem('jwtToken');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!jwtToken || !currentUser) {
      console.error("No hay sesión activa");
      // Redirigir al usuario a la página de inicio de sesión
      // navigate('/login');
      return;
    }

    try {
      // Verificar usuario antes de crear el evento
      const checkSessionResponse = await axios.get('http://localhost:3000/check-session', {
        headers: { 
          'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}` 
        }
      });

      if (checkSessionResponse.data.user.email !== currentUser.email) {
        console.error("La sesión ha cambiado. Por favor, vuelve a iniciar sesión.");
        // Redirigir al usuario a la página de inicio de sesión
        // navigate('/login');
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
          // Crear el evento en Google Calendar
          const createdEvent = await createEvent(event, jwtToken);
          if (createdEvent && createdEvent.id) {
            console.log(`Evento creado con ID: ${createdEvent.id}`);
  
            // Crear solicitud en el backend
            const response = await axios.post('http://localhost:3000/solicitar-proyector', {
              fechaInicio: startDate,
              fechaFin: endDate,
              motivo: 'Solicitud de proyector',
              eventId: createdEvent.id
            }, {
              headers: {
                'Authorization': `Bearer ${jwtToken}`
              }
            });
            console.log('Solicitud creada:', response.data);
          }
        } catch (error) {
          console.error('Error al crear el evento o la solicitud:', error);
          if (error.response && error.response.status === 401) {
            console.error('Error de autenticación. Por favor, vuelve a iniciar sesión.');
            // Redirigir al usuario a la página de inicio de sesión
            // navigate('/login');
            return;
          }
        }
      }
        
      fetchEvents();
      setShowTimeModal(false);
    } catch (error) {
      console.error('Error al verificar la sesión:', error);
      if (error.response && error.response.status === 401) {
        console.error('Error de autenticación. Por favor, vuelve a iniciar sesión.');
        // Redirigir al usuario a la página de inicio de sesión
        // navigate('/login');
      }
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
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      {/* Contenedor principal */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {/* Encabezado */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-6 rounded-full mb-4 transform hover:scale-105 transition-transform duration-300">
            <FontAwesomeIcon 
              icon={faTv} 
              className="text-blue-600 h-12 w-12 md:h-16 md:w-16" 
              aria-label="Icono de proyector"
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Solicitud de Proyector
          </h2>
          <p className="text-gray-600 text-center">
            Selecciona las fechas en las que necesitas el proyector
          </p>
        </div>

        {/* Calendario */}
        <div className="mb-8">
          <div className="calendar-container p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <Calendar
              onChange={handleDateChange}
              value={selectedDates.map(date => new Date(date))}
              minDetail="month"
              maxDetail="month"
              tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6}
              tileClassName={({ date, view }) => {
                if (view !== 'month') return null;
                
                // Ajustar la fecha para comparación
                const adjustedDate = new Date(date.setHours(12, 0, 0, 0));
                const dateStr = adjustedDate.toISOString().split('T')[0];
                
                const hasEvent = events.some(event => {
                  const eventDate = new Date(event.start);
                  return eventDate.toISOString().split('T')[0] === dateStr;
                });
                
                const isSelected = selectedDates.some(selectedDate => {
                  return selectedDate === dateStr;
                });

                return `
                  ${hasEvent ? 'bg-yellow-100 hover:bg-yellow-200' : 'hover:bg-gray-100'}
                  ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  rounded-lg transition-colors duration-200
                `;
              }}
              className="w-full"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <button
            onClick={handleRequest}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300
                     transform hover:scale-105 active:scale-95"
          >
            <FontAwesomeIcon icon={faCalendarPlus} className="mr-2" />
            Solicitar Proyector
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg
                     hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-300
                     transform hover:scale-105 active:scale-95"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Eliminar Eventos
          </button>
        </div>

        {/* Modal de eliminación de eventos */}
        <DeleteEventModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          handleDelete={handleDeleteEvents}
          events={events}
          toggleEventSelection={toggleEventSelection}
        />

        {/* Modal de selección de horarios */}
        <TimeSelectionModal
          show={showTimeModal}
          handleClose={() => setShowTimeModal(false)}
          selectedDates={selectedDates}
          handleConfirm={handleConfirmTimeSlots}
        />
      </div>
    </div>
  );
};

export default RequestProjector;
