import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv } from '@fortawesome/free-solid-svg-icons';
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
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dateString = utcDate.toISOString().split('T')[0];
    
    setSelectedDates((prevDates) => {
      if (prevDates.includes(dateString)) {
        return prevDates.filter((d) => d !== dateString);
      } else {
        return [...prevDates, dateString];
      }
    });
  };
  

  const handleRequest = async () => {
    const savedToken = localStorage.getItem('accessToken');
    if (!savedToken) return;
  
    if (selectedDates.length === 0) {
      alert("Por favor selecciona al menos un día entre lunes y viernes.");
      return;
    }
  
    // Aquí puedes filtrar los días seleccionados
    const validDates = selectedDates.map(dateStr => {
      const date = new Date(dateStr + 'T00:00:00');
      const day = date.getDay();
  
      if (day === 0 || day === 6) {
        alert("Por favor selecciona solo días de lunes a viernes.");
        return null; // Retorna null si el día no es válido
      }
  
      return date; // Retorna la fecha si es válida
    }).filter(date => date !== null); // Filtra los null
  
    // Si hay fechas válidas, abre el modal de selección de horarios
    if (validDates.length > 0) {
      setShowTimeModal(true); // Abre el modal
      setSelectedDates(validDates.map(date => date.toISOString().split('T')[0])); // Establece las fechas válidas
    }
  };

  const handleConfirmTimeSlots = async (selectedTimeSlots) => {
    setTimeSlots(selectedTimeSlots);
    const savedToken = localStorage.getItem('accessToken');
    if (!savedToken) {
      console.error("El token no está disponible");
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
        const createdEvent = await createEvent(event, savedToken);
        if (createdEvent && createdEvent.id) {
          console.log(`Evento creado con ID: ${createdEvent.id}`);

          // Crear solicitud en el backend
          try {
            const response = await axios.post('http://localhost:3000/solicitar-proyector', {
              fechaInicio: startDate,
              fechaFin: endDate,
              motivo: 'Solicitud de proyector',
              eventId: createdEvent.id
            }, {
              withCredentials: true
            });
            console.log('Solicitud creada:', response.data);
          } catch (error) {
            console.error('Error al crear la solicitud:', error);
          }
        }
      } catch (error) {
        console.error('Error al crear el evento:', error);
      }
    }
      
    fetchEvents(); // Actualiza la lista de eventos
    setShowTimeModal(false); // Cierra el modal de selección de horarios
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

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const hasEvent = events.some(event => 
      event.start.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
    
    const isSelected = selectedDates.some(selectedDate => 
      new Date(selectedDate).toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
  
    let classes = [];
    if (hasEvent) classes.push('event-day');
    if (isSelected) classes.push('selected-date');
    return classes.join(' ');
  };
  

  return (
    <div className="request-projector-container">
      <div className="icon-container" aria-label="Icono de proyector">
        <FontAwesomeIcon icon={faTv} size="6x" />
      </div>
      <Calendar
        onChange={handleDateChange}
        value={selectedDates.map(date => new Date(date))}
        minDetail="month"
        maxDetail="month"
        tileDisabled={({ date }) => date.getDay() === 0 || date.getDay() === 6}
        tileClassName={tileClassName}
      />
      <button className="request-button" onClick={handleRequest}>
        Solicitar Proyector
      </button>
      <button className="delete-event-button" onClick={() => setShowModal(true)}>
        Eliminar Eventos
      </button>
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
  );
};

export default RequestProjector;
