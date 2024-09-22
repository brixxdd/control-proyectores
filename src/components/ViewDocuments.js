// components/ViewDocuments.js
import React, { useEffect, useState } from 'react';

function ViewDocuments() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      const response = await fetch('http://localhost:3001/documents'); 
      const data = await response.json();
      setDocuments(data);
    };

    fetchDocuments();
  }, []);

  return (
    <div>
      <h2>Documentos Subidos</h2>
      <ul>
        {documents.length === 0 ? (
          <p>No hay documentos disponibles.</p>
        ) : (
          documents.map(doc => (
            <li key={doc.id}>
              {doc.name}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default ViewDocuments;
