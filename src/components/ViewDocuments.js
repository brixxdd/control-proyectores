import React, { useEffect, useState } from 'react';
import { FiFile, FiSearch, FiDownload, FiFilter, FiLoader } from 'react-icons/fi';

function ViewDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3002/documents');
        if (!response.ok) throw new Error('Error al cargar documentos');
        const data = await response.json();
        setDocuments(data);
        setError(null);
      } catch (err) {
        setError('No se pudieron cargar los documentos. Por favor, intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterDate === 'all') return matchesSearch;
    
    const docDate = new Date(doc.uploaded);
    const today = new Date();
    const diffDays = Math.floor((today - docDate) / (1000 * 60 * 60 * 24));
    
    switch (filterDate) {
      case 'week': return diffDays <= 7 && matchesSearch;
      case 'month': return diffDays <= 30 && matchesSearch;
      default: return matchesSearch;
    }
  });

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const iconClasses = "w-8 h-8";
    
    switch (extension) {
      case 'pdf':
        return <FiFile className={`${iconClasses} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <FiFile className={`${iconClasses} text-blue-500`} />;
      default:
        return <FiFile className={`${iconClasses} text-gray-500`} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FiLoader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Documentos Subidos
        </h2>
        
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiFile className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No hay documentos disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start gap-4">
                {getFileIcon(doc.name)}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {doc.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Subido el: {new Date(doc.uploaded).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                  title="Descargar documento"
                >
                  <FiDownload className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewDocuments;