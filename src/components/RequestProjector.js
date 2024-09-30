import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTv } from '@fortawesome/free-solid-svg-icons'; // Importar FaTv

const projectors = [
  { id: 1, name: 'Proyector A', status: 'Disponible' },
  { id: 2, name: 'Proyector B', status: 'Disponible' },
  { id: 3, name: 'Proyector C', status: 'Asignado' },
  // Agrega más proyectores según sea necesario
];

const RequestProjector = () => {
  const [selectedProjector, setSelectedProjector] = useState(null);
  const [userGroup, setUserGroup] = useState('1'); // Estado para el grado
  const [userClass, setUserClass] = useState('A'); // Estado para el grupo

  const handleRequest = (projector) => {
    // Aquí puedes agregar la lógica para realizar la solicitud
    console.log(`Solicitando el proyector: ${projector.name}`);
    console.log(`Grupo: ${userGroup}, Clase: ${userClass}`);

    // Realiza la actualización en la base de datos aquí
  };

  return (
    <div>
      <h1>Solicitar Proyector</h1>
      <div>
        <label htmlFor="grado">Grado:</label>
        <select
          id="grado"
          value={userGroup}
          onChange={(e) => setUserGroup(e.target.value)}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        <label htmlFor="grupo">Grupo:</label>
        <select
          id="grupo"
          value={userClass}
          onChange={(e) => setUserClass(e.target.value)}
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>
      <div className="projector-list">
        {projectors.map((projector) => (
          <div
            key={projector.id}
            className="projector-item"
            onClick={() => handleRequest(projector)}
            style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', margin: '10px', display: 'inline-block' }}
          >
            <FontAwesomeIcon icon={faTv} size="3x" /> {/* Cambiado a FaTv */}
            <h3>{projector.name}</h3>
            <p>Status: {projector.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestProjector;
