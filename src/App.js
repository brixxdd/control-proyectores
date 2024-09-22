// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // Importa Sidebar desde la carpeta components
import Dashboard from './components/Dashboard'; // Asegúrate de que Dashboard esté aquí
import Grupos from './components/Grupos'; // Importa Grupos desde la carpeta components
import Calendario from './components/Calendario'; // Importa Calendario desde la carpeta components
import RequestProjector from './components/RequestProjector'; // Importa RequestProjector
import UploadDocuments from './components/UploadDocuments'; // Importa UploadDocuments
import ViewDocuments from './components/ViewDocuments'; // Importa ViewDocuments

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="content flex-1 p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/request-projector" element={<RequestProjector />} /> {/* Ruta para RequestProjector */}
            <Route path="/upload-documents" element={<UploadDocuments />} /> {/* Ruta para UploadDocuments */}
            <Route path="/view-documents" element={<ViewDocuments />} /> {/* Ruta para ViewDocuments */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
