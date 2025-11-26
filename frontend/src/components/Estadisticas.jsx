import { useState } from 'react';
import useStore from '../store';
import axios from 'axios';

const Estadisticas = () => {
  const { estadisticas, resetEstadisticas, setPreguntasActivas } = useStore();
  const [loading, setLoading] = useState(false);

  const handleReiniciarPreguntas = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/reiniciar_preguntas');
      // Refrescar preguntas activas
      const response = await axios.get('http://localhost:8000/api/preguntas/activas');
      setPreguntasActivas(response.data.activas);
      alert('Preguntas reiniciadas');
    } catch (error) {
      alert('Error al reiniciar preguntas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Estadísticas</h2>
      <div style={{ marginTop: '16px', display: 'flex', gap: '30px' }}>
          <div className="stat-number">Total respondidas: {estadisticas.totalRespondidas}</div>
          <div className="stat-number" style={{ color: '#28a745' }}>Correctas: {estadisticas.totalCorrectas}</div>
          <div className="stat-number" style={{ color: '#dc3545' }}>Incorrectas: {estadisticas.totalIncorrectas}</div>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
        <button
          onClick={resetEstadisticas}
          className="button"
          style={{ backgroundColor: '#dc3545' }}
        >
          Reiniciar estadísticas
        </button>
        <button
          onClick={handleReiniciarPreguntas}
          disabled={loading}
          className="button"
          style={{ backgroundColor: loading ? '#4a5568' : '#ffc107', color: 'black' }}
        >
          {loading ? 'Reiniciando...' : 'Reiniciar preguntas'}
        </button>
      </div>
    </div>
  );
};

export default Estadisticas;