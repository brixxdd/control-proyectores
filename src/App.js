// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar'; 
import Dashboard from './components/Dashboard'; 
import Grupos from './components/Grupos'; 
import MiniCalendar from './components/MiniCalendar'; // Cambié el nombre aquí
import RequestProjector from './components/RequestProjector'; 
import UploadDocuments from './components/UploadDocuments'; 
import ViewDocuments from './components/ViewDocuments'; 

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="content flex-1 p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/calendario" element={<MiniCalendar />} />
            <Route path="/request-projector" element={<RequestProjector />} />
            <Route path="/upload-documents" element={<UploadDocuments />} /> {/* Ruta para UploadDocuments */}
            <Route path="/view-documents" element={<ViewDocuments />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
