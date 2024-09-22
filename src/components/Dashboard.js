// pages/Dashboard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Importar estilos por defecto
import './Dashboard.css'; // Asegúrate de que esta línea esté presente


function Dashboard() {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
    // Aquí puedes agregar lógica para manejar la fecha seleccionada, como mostrar los eventos
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Bienvenido al sistema de control de proyectores.</p>

      {/* Resumen del día o de la semana */}
      <section className="summary">
        <h3>Resumen del Día/Semana</h3>
        <div className="summary-item">
          <h4>Proyectores Solicitados:</h4>
          <p>5 proyectores solicitados para hoy.</p>
        </div>
        <div className="summary-item">
          <h4>Horarios de Recolección y Entrega:</h4>
          <p>Recolección: 10:00 AM - Entrega: 4:00 PM</p>
        </div>
        <div className="summary-item">
          <h4>Número de Proyectores Disponibles:</h4>
          <p>10 proyectores disponibles.</p>
        </div>
        <div className="summary-item">
          <h4>Notificaciones Importantes:</h4>
          <p>2 solicitudes pendientes, 1 retraso en la entrega.</p>
        </div>
      </section>

      {/* Calendario rápido */}
      <section className="quick-calendar">
        <h3>Calendario Rápido</h3>
        <div className="calendar">
          <Calendar
            onChange={handleDateChange}
            value={date}
          />
        </div>
      </section>

      {/* Atajos o accesos rápidos */}
      <section className="shortcuts">
        <h3>Atajos Rápidos</h3>
        <div className="shortcut-item">
          <Link to="/request-projector">
            <button>Solicitar Proyector</button>
          </Link>
        </div>
        <div className="shortcut-item">
          <Link to="/upload-documents">
            <button>Subir Documentos</button>
          </Link>
        </div>
        <div className="shortcut-item">
          <Link to="/view-documents">
            <button>Ver Documentos</button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
