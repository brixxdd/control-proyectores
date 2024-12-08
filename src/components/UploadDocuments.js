import React, { useState, useCallback ,useEffect} from 'react';
import { FiUploadCloud, FiFile, FiX, FiCheck } from 'react-icons/fi';
import { authService } from '../services/authService';
function UploadDocuments() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isFirstUpload, setIsFirstUpload] = useState(true);

  useEffect(() => {
    console.log('Token en sessionStorage:', sessionStorage.getItem('jwtToken'));
    console.log('Usuario en sessionStorage:', sessionStorage.getItem('currentUser'));
    
    const checkExistingDocument = async () => {
      try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const token = sessionStorage.getItem('jwtToken');
        
        if (!currentUser || !token) {
          console.error('No hay usuario o token disponible');
          return;
        }

        const response = await authService.api.get(`/documentos/usuario/${currentUser._id}`);
        
        if (response.data) {
          setStatusMessage('Ya tienes un documento subido. Si subes otro, reemplazará al anterior.');
          setUploadStatus('warning');
          setIsFirstUpload(false);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          setStatusMessage('Error al verificar documentos existentes. Por favor, intenta más tarde.');
          setUploadStatus('error');
          console.error('Error al verificar documento existente:', error);
        } else {
          setStatusMessage('Aún no has subido ningún documento. ¡Sube tu primer documento!');
          setUploadStatus('info');
          setIsFirstUpload(true);
        }
      }
    };

    checkExistingDocument();
  }, []);

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

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
      const token = sessionStorage.getItem('jwtToken');
      
      if (!currentUser || !token) {
        setStatusMessage('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        setUploadStatus('error');
        return;
      }

      formData.append('usuarioId', currentUser._id);
      formData.append('nombre', currentUser.nombre);
      formData.append('email', currentUser.email);
      formData.append('grado', currentUser.grado);
      formData.append('grupo', currentUser.grupo);
      formData.append('turno', currentUser.turno);

      const response = await authService.api.post('/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadStatus('success');
      setStatusMessage('Documento subido exitosamente');
      setFile(null);
      
    } catch (error) {
      setUploadStatus('error');
      setStatusMessage(error.response?.data?.message || 'Error al subir el archivo');
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
          Subir Documentos
        </h2>
        
        {uploadStatus && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3
            ${uploadStatus === 'success' 
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
              : uploadStatus === 'warning'
              ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              : uploadStatus === 'info'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}
          >
            <div className={`rounded-full p-1 
              ${uploadStatus === 'success' 
                ? 'bg-green-100 dark:bg-green-800'
                : uploadStatus === 'warning'
                ? 'bg-yellow-100 dark:bg-yellow-800'
                : uploadStatus === 'info'
                ? 'bg-blue-100 dark:bg-blue-800' 
                : 'bg-red-100 dark:bg-red-800'}`}
            >
              {uploadStatus === 'success' ? (
                <FiCheck className="h-5 w-5" />
              ) : uploadStatus === 'warning' ? (
                <FiFile className="h-5 w-5" />
              ) : uploadStatus === 'info' ? (
                <FiUploadCloud className="h-5 w-5" />
              ) : (
                <FiX className="h-5 w-5" />
              )}
            </div>
            <span className="text-sm font-medium">{statusMessage}</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Área de arrastrar y soltar */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8
              transition-all duration-200 ease-in-out
              ${isDragging 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}
              ${file 
                ? 'bg-gray-50 dark:bg-gray-800/50' 
                : 'bg-white dark:bg-gray-800/30'}
            `}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="text-center">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FiUploadCloud className="h-10 w-10 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                  {file ? file.name : 'Arrastra y suelta tu archivo aquí'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  PDF o Word (máximo 10MB)
                </p>
              </div>
            </div>
          </div>

          {/* Botón de subida */}
          {file && !uploadStatus && (
            <button
              onClick={handleFileUpload}
              className="mt-6 w-full bg-blue-600 dark:bg-blue-500 text-white 
                       px-6 py-3 rounded-lg text-sm font-medium
                       hover:bg-blue-700 dark:hover:bg-blue-600
                       focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
                       transition-all duration-200 
                       flex items-center justify-center gap-2
                       shadow-lg hover:shadow-xl"
            >
              <FiFile className="h-5 w-5" />
              <span>Subir Documento</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadDocuments;