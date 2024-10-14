import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import './DeleteEventModal.css';
import { alertaEliminacion } from './Alert'; // Importa la alerta


const DeleteEventModal = ({ show, handleClose, handleDelete, events, toggleEventSelection }) => {
    const selectedEvents = events.filter(event => event.selected);

    const handleMultipleDelete = () => {
        const selectedEventIds = selectedEvents.map(event => event.id);
        handleDelete(selectedEventIds);
        
        // Llama a la alerta de eliminación después de eliminar los eventos
        alertaEliminacion(selectedEventIds.length);
        
        handleClose(); // Cierra el modal después de eliminar
    };
    

    const toggleAllEvents = () => {
        const allSelected = events.every(event => event.selected);
        events.forEach(event => toggleEventSelection(event.id, !allSelected));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="lg"
            className="custom-modal"
            dialogClassName="modal-90w"
        >
            <Modal.Header closeButton>
                <Modal.Title>Eliminar eventos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {events.length > 0 ? (
                    <>
                        <Button variant="secondary" onClick={toggleAllEvents} className="mb-2">
                            {events.every(event => event.selected) ? 'Deseleccionar todo' : 'Seleccionar todo'}
                        </Button>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Seleccionar</th>
                                    <th>Título</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(event => (
                                    <tr key={event.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={event.selected}
                                                onChange={() => toggleEventSelection(event.id)}
                                            />
                                        </td>
                                        <td>{event.summary}</td>
                                        <td>{formatDate(event.start.dateTime || event.start.date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                ) : (
                    <p>No hay eventos disponibles.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleMultipleDelete} disabled={selectedEvents.length === 0}>
                    Eliminar ({selectedEvents.length})
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteEventModal;