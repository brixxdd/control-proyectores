import React, { useState } from 'react';
import '../modal.css'; // Asegúrate de que el archivo de estilos exista

const GradeGroupModal = ({ isOpen, onClose }) => {
  const [grade, setGrade] = useState('');
  const [group, setGroup] = useState('');
  const [shift, setShift] = useState('Matutino'); // Combobox con Matutino y Vespertino
  const [loading, setLoading] = useState(false); // Estado para manejar la carga

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación previa
    if (!grade || !group) {
      return alert('Todos los campos son obligatorios');
    }

    setLoading(true); // Comienza la carga

    try {
      const response = await fetch('http://localhost:3000/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Esto asegura que las cookies se envíen con la solicitud
        body: JSON.stringify({ grado: grade, grupo: group, turno: shift }),
      });

      if (response.ok) {
        const data = await response.json(); // Obtener datos de la respuesta
        console.log('Información actualizada:', data); // Log de éxito
        alert('Información actualizada correctamente');
        onClose(); // Cierra el modal
      } else {
        console.error('Error al actualizar la información');
        alert('Error al actualizar la información');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error en la solicitud');
    } finally {
      setLoading(false); // Finaliza la carga
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h2>Ingresa tu Información</h2>

        {/* Campo Grado */}
        <label>
          Grado:
          <input 
            type="text" 
            value={grade} 
            onChange={(e) => setGrade(e.target.value)} 
            required 
          />
        </label>

        {/* Campo Grupo */}
        <label>
          Grupo:
          <input 
            type="text" 
            value={group} 
            onChange={(e) => setGroup(e.target.value)} 
            required 
          />
        </label>

        {/* Combobox para Matutino/Vespertino */}
        <label>
          Turno:
          <select value={shift} onChange={(e) => setShift(e.target.value)} required>
            <option value="Matutino">Matutino</option>
            <option value="Vespertino">Vespertino</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>Guardar</button>
        <button type="button" onClick={onClose}>Cerrar</button>
      </form>
    </div>
  );
};

export default GradeGroupModal;
