import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { alertaExito } from './Alert'; // Asegúrate de la ruta correcta de importación

const TimeSelectionModal = ({ show, handleClose, selectedDates, handleConfirm }) => {
  const [timeSlots, setTimeSlots] = useState({});

  const handleTimeChange = (date, field, value) => {
    setTimeSlots(prev => ({
      ...prev,
      [date]: { ...prev[date], [field]: value }
    }));
  };

  const onConfirm = () => {
    handleConfirm(timeSlots);
    alertaExito(); // Muestra la alerta de éxito
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Seleccionar horarios</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedDates.map(date => (
          <Form key={date}>
            <Form.Group>
              <Form.Label>{date}</Form.Label>
              <Form.Control
                type="time"
                onChange={(e) => handleTimeChange(date, 'start', e.target.value)}
                placeholder="Hora de inicio"
              />
              <Form.Control
                type="time"
                onChange={(e) => handleTimeChange(date, 'end', e.target.value)}
                placeholder="Hora de fin"
              />
            </Form.Group>
          </Form>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TimeSelectionModal;
