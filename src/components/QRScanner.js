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
        try {
          scannerRef.current.stop();
        } catch (err) {
          // Silenciar errores al detener
        }
      }
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      setCameraError(null);
      
      // Iniciar el escáner después de verificar permisos
      setTimeout(() => {
        initializeScanner();
      }, 1000);
    } catch (error) {
      console.error("Error al verificar permisos de cámara:", error);
      setCameraPermission('denied');
      setCameraError(error.message || 'No se pudo acceder a la cámara');
      alertaError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const requestCameraPermission = () => {
    setCameraPermission(null);
    setCameraError(null);
    checkCameraPermission();
  };
  
  const initializeScanner = async () => {
    try {
      // Asegurarse de que el elemento existe y está en el DOM
      const qrReaderElement = document.getElementById("qr-reader");
      if (!qrReaderElement) {
        console.error("Elemento qr-reader no encontrado en el DOM");
        alertaError('Error al inicializar el escáner: elemento no encontrado');
        return;
      }
      
      // Establecer dimensiones explícitas
      qrReaderElement.style.width = "100%";
      qrReaderElement.style.height = "300px";
      
      // Limpiar cualquier instancia previa
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (err) {
          // Ignorar errores al detener
        }
      }
      
      // Crear nueva instancia
      console.log("Creando nueva instancia de Html5Qrcode");
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      // Obtener cámaras disponibles
      console.log("Obteniendo cámaras disponibles...");
      const cameras = await Html5Qrcode.getCameras();
      console.log("Cámaras disponibles:", cameras);
      
      if (cameras && cameras.length) {
        const cameraId = cameras[0].id;
        console.log("Usando cámara:", cameraId);
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        };
        
        console.log("Iniciando escáner con configuración:", config);
        await html5QrCode.start(
          { deviceId: { exact: cameraId } },
          config,
          (decodedText) => {
            console.log("QR detectado:", decodedText);
            handleScan(decodedText);
          },
          (errorMessage) => {
            // Silenciar errores comunes
            if (!errorMessage.includes("No QR code found") && 
                !errorMessage.includes("No MultiFormat Readers")) {
              console.error("Error de escaneo:", errorMessage);
            }
          }
        );
        
        console.log("Escáner iniciado correctamente");
      } else {
        console.error("No se detectaron cámaras");
        alertaError('No se detectaron cámaras en el dispositivo.');
      }
    } catch (err) {
      console.error("Error al inicializar el escáner:", err);
      setCameraError(err.message || 'Error desconocido');
      alertaError('Error al inicializar el escáner de QR.');
    }
  };

  const handleScan = (decodedText) => {
    try {
      // Intentar parsear el texto como JSON
      const qrData = JSON.parse(decodedText);
      
      // Verificar que tenga la estructura esperada
      if (qrData && qrData.solicitudId) {
        console.log("QR escaneado correctamente:", qrData);
        setStartScan(false);
        
        // Notificar éxito
        alertaExito('Código QR escaneado correctamente');
        
        // Llamar al callback con los datos
        setTimeout(() => {
          onScanSuccess(qrData);
        }, 1000);
      } else {
        alertaError('El código QR no contiene datos válidos de solicitud');
      }
    } catch (error) {
      console.error("Error al procesar el código QR:", error);
      alertaError('Error al procesar el código QR. Formato inválido.');
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