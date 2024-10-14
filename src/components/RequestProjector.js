import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv } from '@fortawesome/free-solid-svg-icons';
import { gapi } from 'gapi-script';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import './RequestProjector.css';
import DeleteEventModal from './DeleteEventModal';
import TimeSelectionModal from './TimeSelectionModal';


const CLIENT_ID = "217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com";
const API_KEY = "AIzaSyCGngj5UlwBeDeynle9K-yImbSTwfgWTFg";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const RequestProjector = () => {
  const [showTimeModal, setShowTimeModal] = useState(false);

  const [token, setToken] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

          const authInstance = gapi.auth2.getAuthInstance();
          const isSignedIn = authInstance.isSignedIn.get();
          if (isSignedIn) {
            const user = authInstance.currentUser.get();
            const accessToken = user.getAuthResponse().access_token;
            setToken(accessToken);
            localStorage.setItem('accessToken', accessToken);
            fetchEvents();
          } else {
            await handleSignIn();
          }
        });
      } catch (error) {
        console.error('Error al cargar gapi o inicializar cliente:', error);
      }
    };

    loadGapi();
  }, []);

  const fetchEvents = async () => {
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      const calendarApiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
      try {
        const response = await axios.get(calendarApiUrl, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        const fetchedEvents = response.data.items.map(event => ({
          ...event,
          selected: false
        }));
        setEvents(fetchedEvents);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.error('Token inválido o expirado. Iniciando sesión nuevamente...');
          await handleSignIn();
        } else {
          console.error('Error al obtener los eventos del calendario:', error);
        }
      }
    }
  };

  const handleRequestClick = () => {
    if (selectedDates.length === 0) {
      alert("Por favor selecciona al menos un día entre lunes y viernes.");
      return;
    }
    setShowTimeModal(true);
  };
  const handleSignIn = async () => {
    try {
      await gapi.auth2.getAuthInstance().signIn();
      const user = gapi.auth2.getAuthInstance().currentUser.get();
      const accessToken = user.getAuthResponse().access_token;
      setToken(accessToken);
      localStorage.setItem('accessToken', accessToken);
      fetchEvents();
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const createEvent = async (event, token) => {
    try {
      const calendarApiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
      const response = await axios.post(calendarApiUrl, event, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Evento creado en Google Calendar:', response.data);
      return response.data.id;
    } catch (error) {
      console.error('Error al crear evento en Google Calendar:', error);
      return null;
    }
  };


  const handleDateChange = (date) => {
    const dateString = date.toISOString().split('T')[0];
    
    setSelectedDates((prevDates) => {
      if (prevDates.includes(dateString)) {
        return prevDates.filter((d) => d !== dateString);
      } else {
        return [...prevDates, dateString];
      }
    });
  };


  const handleTimeConfirm = async (timeSlots) => {
    const savedToken = localStorage.getItem('accessToken');
    if (!savedToken) return;

    for (const dateStr of Object.keys(timeSlots)) {
      const date = new Date(dateStr + 'T00:00:00');
      const day = date.getDay();

      if (day === 0 || day === 6) {
        alert("Por favor selecciona solo días de lunes a viernes.");
        continue;
      }

      const { start, end } = timeSlots[dateStr];
      const startDate = new Date(`${dateStr}T${start}:00`);
      const endDate = new Date(`${dateStr}T${end}:00`);

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

      const eventId = await createEvent(event, savedToken);
      if (eventId) {
        console.log(`Evento creado con ID: ${eventId}`);
      }
    }
    fetchEvents();
    setSelectedDates([]);
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
  tileClassName={({ date }) => {
    const dateString = date.toISOString().split('T')[0];
    const hasEvent = events.some(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.toISOString().split('T')[0] === dateString;
    });
    return selectedDates.includes(dateString) ? 'selected-date' : hasEvent ? 'event-day' : null;
  }}
  selectRange={false}
/>
      <button className="request-button" onClick={handleRequestClick}>
        Solicitar Proyector
      </button>
      <TimeSelectionModal
        show={showTimeModal}
        handleClose={() => setShowTimeModal(false)}
        selectedDates={selectedDates}
        handleConfirm={handleTimeConfirm}
      />
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
      
    </div>
  );
};

export default RequestProjector;