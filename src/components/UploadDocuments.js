// components/UploadDocuments.js
import React, { useState } from 'react';
import { Button, Input } from '@mui/material';
import CustomAlert from './Alert'; // Asegúrate de importar el componente de alerta

function UploadDocuments() {
  const [file, setFile] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success'); // 'success' o 'error'

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    const response = await fetch('http://localhost:3001/documents', {
      method: 'POST',
      body: JSON.stringify({
        name: file.name,
        uploaded: new Date().toISOString().split('T')[0],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      setAlertMessage('Documento subido exitosamente');
      setAlertSeverity('success');
    } else {
      setAlertMessage('Error al subir el documento');
      setAlertSeverity('error');
    }

    setAlertOpen(true);
    setFile(null);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  return (
    <div>
      <h2>Subir Documentos</h2>
      <Input
        type="file"
        onChange={handleFileChange}
        inputProps={{ accept: 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' }}
      />
      <Button variant="contained" color="primary" style={{ marginTop: '10px' }} onClick={handleUpload}>
        Subir
      </Button>
      <CustomAlert
        open={alertOpen}
        handleClose={handleAlertClose}
        severity={alertSeverity}
        message={alertMessage}
      />
    </div>
  );
}

export default UploadDocuments;
