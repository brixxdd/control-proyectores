import { Temporal } from '@js-temporal/polyfill';
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
import { alertaExito, alertaError } from './Alert';
import { BACKEND_URL } from '../config/config';
import { fetchFromAPI } from '../utils/fetchHelper';

const CLIENT_ID = "217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com";
const API_KEY = "AIzaSyCGngj5UlwBeDeynle9K-yImbSTwfgWTFg";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

let hasLoggedWeekBounds = false;

const RequestProjector = () => {
  const { currentTime, targetTimeZone } = useTimeZone();
  const [token, setToken] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false); 
  const [timeSlots, setTimeSlots] = useState({});
  const [calendarValue, setCalendarValue] = useState(new Date()); // Valor para el componente Calendar

  // Función para convertir Date a Temporal.ZonedDateTime
  const dateToTemporal = (date) => {
    if (!date) return null;
    // Crear un Temporal.Instant desde el timestamp
    const instant = Temporal.Instant.fromEpochMilliseconds(date.getTime());
    // Convertir a ZonedDateTime en la zona horaria objetivo
    return instant.toZonedDateTimeISO(targetTimeZone);
  };

  // Función para convertir Temporal.ZonedDateTime a Date
  const temporalToDate = (temporalDate) => {
    if (!temporalDate) return null;
    
    if (temporalDate instanceof Temporal.ZonedDateTime) {
      // Convertir ZonedDateTime a Date de JavaScript
      return new Date(temporalDate.epochMilliseconds);
    } else if (temporalDate instanceof Temporal.PlainDate) {
      // Convertir PlainDate a ZonedDateTime a medianoche
      const zonedDateTime = temporalDate.toZonedDateTime({
        timeZone: targetTimeZone,
        plainTime: Temporal.PlainTime.from('00:00:00')
      });
      // Convertir a Date de JavaScript
      return new Date(zonedDateTime.epochMilliseconds);
    }
    
    // Si ya es un Date, devolverlo
    return temporalDate;
  };

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
      const fetchedEvents = response.result.items.map(event => {
        // Convertir fechas usando Temporal
        const startInstant = Temporal.Instant.from(event.start.dateTime || event.start.date);
        const endInstant = Temporal.Instant.from(event.end.dateTime || event.end.date);
        
        return {
          id: event.id,
          summary: event.summary,
          start: new Date(startInstant.epochMilliseconds),
          end: new Date(endInstant.epochMilliseconds),
          selected: false
        };
      });

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
      if (!auth2) {
        console.error('No se pudo obtener la instancia de auth2');
        throw new Error('No se pudo obtener la instancia de auth2');
      }

      const isSignedIn = auth2.isSignedIn.get();
      if (!isSignedIn) {
        console.log('Usuario no autenticado, intentando iniciar sesión...');
        await auth2.signIn();
      }

      const currentUser = auth2.currentUser.get();
      const accessToken = currentUser.getAuthResponse().access_token;
      
      console.log('Creando evento con datos:', event);
      console.log('Token de acceso:', accessToken);

      // Asegurarse de que el token esté configurado
      gapi.client.setToken({
        access_token: accessToken
      });

      // Verificar que las fechas sean objetos Date válidos
      if (!(event.start instanceof Date) || isNaN(event.start.getTime())) {
        throw new Error('La fecha de inicio no es válida');
      }
      
      if (!(event.end instanceof Date) || isNaN(event.end.getTime())) {
        throw new Error('La fecha de fin no es válida');
      }

      // Crear el evento con fechas en formato ISO
      const response = await gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': {
          summary: event.summary,
          start: {
            dateTime: event.start.toISOString(),
            timeZone: targetTimeZone
          },
          end: {
            dateTime: event.end.toISOString(),
            timeZone: targetTimeZone
          }
        }
      });

      console.log('Evento creado exitosamente:', response.result);
      return response.result;
    } catch (error) {
      console.error('Error detallado al crear evento:', error);
      throw error;
    }
  };

  // Función para manejar el cambio de fecha en el calendario
  const handleDateChange = (newDate) => {
    if (newDate && newDate instanceof Date && !isNaN(newDate)) {
      setCalendarValue(newDate); // Actualizar el valor del calendario
      
      // Convertir Date a Temporal.PlainDate
      const temporalDate = dateToTemporal(newDate).toPlainDate();
      // Formato ISO para almacenar (YYYY-MM-DD)
      const dateStr = temporalDate.toString();
      
      console.log('Fecha seleccionada:', {
        original: newDate,
        temporal: temporalDate,
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

  // Función para obtener los límites de la semana
  const getWeekBounds = (date) => {
    // Convertir a PlainDate primero
    let plainDate;
    
    if (date instanceof Date) {
      plainDate = Temporal.PlainDate.from({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      });
    } else if (date instanceof Temporal.ZonedDateTime) {
      plainDate = date.toPlainDate();
    } else {
      plainDate = Temporal.PlainDate.from(date);
    }
    
    // Calcular el día de la semana (1-7, donde 1 es lunes)
    const dayOfWeek = plainDate.dayOfWeek || ((new Date(plainDate.toString()).getDay() + 6) % 7) + 1;
    
    // Calcular cuántos días restar para llegar al lunes
    const daysToMonday = dayOfWeek - 1;
    // Calcular cuántos días sumar para llegar al viernes
    const daysToFriday = 5 - dayOfWeek;
    
    // Calcular lunes y viernes
    const monday = plainDate.subtract({ days: daysToMonday });
    const friday = plainDate.add({ days: Math.max(0, daysToFriday) });
    
    return { monday, friday };
  };

  // Función para deshabilitar días en el calendario
  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false;
    
    // Calcular el día de la semana (0-6, donde 0 es domingo)
    const dayOfWeek = date.getDay();
    
    // Si es sábado o domingo, deshabilitar
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    
    // Obtener la fecha actual
    const now = new Date();
    
    // Obtener los límites de la semana actual usando solo objetos Date
    const currentDay = now.getDay(); // 0 (domingo) a 6 (sábado)
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    // Crear el lunes de la semana actual
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);
    
    // Crear el viernes de la semana actual
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);
    
    // Crear el lunes y viernes de la próxima semana
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    
    const nextFriday = new Date(friday);
    nextFriday.setDate(friday.getDate() + 7);
    
    // Crear una copia de la fecha para no modificar la original
    const tileDateCopy = new Date(date);
    tileDateCopy.setHours(12, 0, 0, 0); // Mediodía para evitar problemas de zona horaria
    
    // Para pruebas: permitir seleccionar fechas de esta semana y la próxima
    // Deshabilitar solo si está antes de esta semana o después de la próxima semana
    return tileDateCopy < monday || tileDateCopy > nextFriday;
  };

  // Función para el className del tile
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    // Convertir Date a formato ISO para comparar (YYYY-MM-DD)
    const dateStr = date.toISOString().split('T')[0];
    
    const hasEvent = events.some(event => {
      // Asegurarse de que event.start sea un Date
      const eventDate = event.start instanceof Date 
        ? event.start 
        : new Date(event.start);
      
      return eventDate.toISOString().split('T')[0] === dateStr;
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
      console.log('Procesando horarios seleccionados:', selectedTimeSlots);
      
      const jwtToken = sessionStorage.getItem('jwtToken');
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
      
      if (!jwtToken || !currentUser) {
        console.error("No hay sesión activa o faltan credenciales");
        alert("No hay sesión activa. Por favor, inicia sesión nuevamente.");
        return;
      }

      // Verificar que gapi esté inicializado
      if (!gapi.client || !gapi.auth2) {
        console.error("La API de Google no está inicializada");
        alert("No se pudo conectar con Google Calendar. Por favor, recarga la página.");
        return;
      }

      for (const date of selectedDates) {
        const startTime = selectedTimeSlots[date]?.start;
        const endTime = selectedTimeSlots[date]?.end;
    
        if (!startTime || !endTime) {
          console.error(`Faltan horarios para la fecha: ${date}`);
          continue;
        }
    
        // Crear objetos Date para las fechas de inicio y fin
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        console.log('Fechas a usar:', {
          date,
          startTime,
          endTime,
          startDateTime,
          endDateTime
        });

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          console.error('Fechas inválidas:', { startDateTime, endDateTime });
          continue;
        }

        try {
          // Crear el evento en Google Calendar
          const event = {
            summary: 'Solicitud de proyector',
            start: startDateTime,
            end: endDateTime
          };

          const createdEvent = await createEvent(event);
          
          if (!createdEvent || !createdEvent.id) {
            console.error('No se pudo crear el evento en Google Calendar');
            continue;
          }

          // Crear solicitud en el backend
          const response = await fetchFromAPI('/solicitar-proyector', {
            method: 'POST',
            body: JSON.stringify({
              fechaInicio: startDateTime.toISOString(),
              fechaFin: endDateTime.toISOString(),
              motivo: 'Solicitud de proyector',
              eventId: createdEvent.id,
              grado: currentUser?.grado || '',
              grupo: currentUser?.grupo || '',
              turno: currentUser?.turno || ''
            })
          });

          console.log('Solicitud creada:', response.data);
        } catch (error) {
          console.error('Error al procesar solicitud para la fecha', date, error);
        }
      }

      setShowTimeModal(false);
      fetchEvents();
      alertaExito('Solicitudes procesadas correctamente');

    } catch (error) {
      console.error('Error al procesar las solicitudes:', error);
      alertaError('Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.');
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

  // Componente de fechas seleccionadas
  const SelectedDatesComponent = () => (
    selectedDates.length > 0 && (
      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          Fechas seleccionadas:
        </h3>
        <div className="flex flex-wrap gap-2">
          {selectedDates.map(date => {
            // Crear la fecha correctamente en la zona horaria objetivo
            const [year, month, day] = date.split('-');
            const zonedDate = new Date(Date.UTC(year, month - 1, day));
            
            return (
              <span 
                key={date}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 
                         text-blue-800 dark:text-blue-100 
                         rounded-full text-sm"
              >
                {date}
              </span>
            );
          })}
        </div>
      </div>
    )
  );

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
            {Temporal.Now.zonedDateTimeISO(targetTimeZone).toPlainTime().toString().split('.')[0]}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {Temporal.Now.zonedDateTimeISO(targetTimeZone).toPlainDate().toString()}
          </div>
        </div>

        {/* Calendario con estilos mejorados para modo oscuro */}
        <div className="calendar-container p-2 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <Calendar
            onChange={handleDateChange}
            value={calendarValue}
            tileDisabled={tileDisabled}
            tileClassName={tileClassName}
            locale="es-ES"
          />
        </div>

        <SelectedDatesComponent />

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