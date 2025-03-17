import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { alertaError, alertaExito } from './Alert';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const [startScan, setStartScan] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Verificar permisos de cámara al montar
    checkCameraPermission();
    
    // Limpiar al desmontar
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error('Error al detener el escáner:', err));
      }
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      console.log("Solicitando permisos de cámara...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      setCameraError(null);
      
      // Iniciar el escáner después de verificar permisos
      setTimeout(() => {
        initializeScanner();
      }, 500);
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      setCameraPermission('denied');
      setCameraError(error.message || 'No se pudo acceder a la cámara');
      alertaError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const requestCameraPermission = () => {
    setCameraPermission(null);
    setCameraError(null);
    
    // Intentar solicitar permisos nuevamente
    checkCameraPermission();
  };
  
  const initializeScanner = async () => {
    if (!containerRef.current) return;
    
    try {
      // Asegurarse de que el elemento existe
      const qrReaderElement = document.getElementById("qr-reader");
      if (!qrReaderElement) {
        console.error("Elemento qr-reader no encontrado");
        return;
      }
      
      // Establecer dimensiones explícitas
      qrReaderElement.style.width = "100%";
      qrReaderElement.style.height = "300px";
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      console.log("Iniciando búsqueda de cámaras...");
      const cameras = await Html5Qrcode.getCameras();
      console.log("Cámaras encontradas:", cameras);
      
      if (cameras && cameras.length) {
        const cameraId = cameras[0].id;
        console.log("Usando cámara:", cameraId);
        
        await html5QrCode.start(
          cameraId, 
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            console.log("QR detectado:", decodedText);
            handleScan(decodedText);
          },
          (errorMessage) => {
            // Solo registrar errores significativos
            if (!errorMessage.includes("No QR code found")) {
              console.error("Error de escaneo:", errorMessage);
            }
          }
        );
        
        console.log("Escáner iniciado correctamente");
      } else {
        alertaError('No se detectaron cámaras en el dispositivo.');
      }
    } catch (err) {
      console.error('Error al inicializar el escáner:', err);
      alertaError('Error al inicializar el escáner de QR.');
    }
  };

  const handleScan = (result) => {
    if (result && startScan) {
      try {
        // Intentar parsear los datos del QR
        const qrData = JSON.parse(result);
        
        // Verificar que tenga la estructura esperada
        if (qrData.solicitudId && qrData.usuarioId && qrData.fechas) {
          // Detener el escáner
          if (scannerRef.current) {
            scannerRef.current.stop().catch(err => console.error('Error al detener el escáner:', err));
          }
          
          setStartScan(false);
          onScanSuccess(qrData);
          alertaExito('QR escaneado correctamente');
        } else {
          alertaError('Código QR inválido. No contiene la información necesaria.');
        }
      } catch (error) {
        console.error('Error al procesar el código QR:', error);
        alertaError('Error al procesar el código QR. Formato inválido.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Escanear código QR
        </h2>
        
        {cameraPermission === 'granted' ? (
          <>
            {startScan ? (
              <div className="relative" ref={containerRef}>
                <div id="qr-reader" className="w-full h-64 rounded-lg overflow-hidden bg-gray-200"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-blue-500 rounded-lg"></div>
                </div>
                <p className="text-sm text-center mt-2 text-gray-600 dark:text-gray-400">
                  Coloca el código QR dentro del recuadro
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-green-600 dark:text-green-400 font-medium">
                  ¡Código escaneado correctamente!
                </p>
              </div>
            )}
          </>
        ) : cameraPermission === 'denied' ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">
              No se pudo acceder a la cámara. Por favor, verifica los permisos del navegador.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Puedes reiniciar los permisos en la configuración de tu navegador o intentar nuevamente.
            </p>
            <button
              onClick={requestCameraPermission}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Intentar nuevamente
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Verificando acceso a la cámara...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        )}
        
        {cameraError && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400">
              Error: {cameraError}
            </p>
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner; 