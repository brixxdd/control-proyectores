import React, { useState, useCallback } from 'react';
import { FiUploadCloud, FiFile, FiX, FiCheck } from 'react-icons/fi';

function UploadDocuments() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('');

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (isValidFileType(droppedFile)) {
      setFile(droppedFile);
      setUploadStatus(null);
    } else {
      setStatusMessage('Tipo de archivo no permitido. Por favor, sube PDF o Word.');
      setUploadStatus('error');
    }
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setUploadStatus(null);
    } else {
      setStatusMessage('Tipo de archivo no permitido. Por favor, sube PDF o Word.');
      setUploadStatus('error');
    }
  };

  const isValidFileType = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return file && allowedTypes.includes(file.type);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const response = await fetch('http://localhost:3002/documents', {
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
        setStatusMessage('¡Documento subido exitosamente!');
        setUploadStatus('success');
        setTimeout(() => setFile(null), 3000);
      } else {
        throw new Error('Error en la subida');
      }
    } catch (error) {
      setStatusMessage('Error al subir el documento. Intenta nuevamente.');
      setUploadStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Subir Documentos</h2>
      
      {/* Área de arrastrar y soltar */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-all duration-200 ease-in-out
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${file ? 'bg-gray-50' : 'bg-white'}
        `}
      >
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {file ? file.name : 'Arrastra y suelta tu archivo aquí o haz clic para seleccionar'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PDF o Word (máximo 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* Estado de la subida */}
      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 
          ${uploadStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {uploadStatus === 'success' ? (
            <FiCheck className="h-5 w-5" />
          ) : (
            <FiX className="h-5 w-5" />
          )}
          <span className="text-sm">{statusMessage}</span>
        </div>
      )}

      {/* Botón de subida */}
      {file && !uploadStatus && (
        <button
          onClick={handleUpload}
          className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                   transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <FiFile className="h-5 w-5" />
          <span>Subir Documento</span>
        </button>
      )}
    </div>
  );
}

export default UploadDocuments;