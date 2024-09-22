// pages/Dashboard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card'; // Asegúrate de importar el componente Card
import MiniCalendar from '../components/MiniCalendar'; // Importa el nuevo componente de calendario
import './Dashboard.css'; // Asegúrate de que esta línea esté presente

function Dashboard() {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Bienvenido al sistema de control de proyectores.</p>

      {/* Resumen del día o de la semana */}
      <section className="summary">
        <h3>Resumen del Día/Semana</h3>
        <div className="summary-cards">
          <Card title="Proyectores Solicitados" value="5 proyectores solicitados para hoy." />
          <Card title="Horarios de Recolección" value="Recolección: 10:00 AM - Entrega: 4:00 PM" />
          <Card title="Proyectores Disponibles" value="10 proyectores disponibles." />
          <Card title="Notificaciones" value="2 solicitudes pendientes, 1 retraso en la entrega." />
        </div>
      </section>

      {/* Calendario rápido */}
      <section className="quick-calendar">
        <h3>Calendario Rápido</h3>
        <MiniCalendar date={date} onChange={handleDateChange} /> {/* Usa el nuevo componente */}
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
