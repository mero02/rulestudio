import { useState } from 'react';
import axios from 'axios';

const CargarCSV = ({ onCargar }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8000/api/importar_csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('CSV importado exitosamente');
      onCargar(); // Refrescar preguntas activas
    } catch (error) {
      alert('Error al importar CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2px' }}>
      <p style={{ marginBottom: '2px' }}>Cargar archivo CSV con preguntas</p>
      <input type="file" accept=".csv" onChange={handleFileChange} style={{ marginBottom: '8px', color: 'white' }} />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="button"
      >
        {loading ? 'Importando...' : 'Importar CSV'}
      </button>
    </div>
  );
};

export default CargarCSV;