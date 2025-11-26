import { useState } from 'react';
import CargarCSV from '../components/CargarCSV';
import Ruleta from '../components/Ruleta';
import ModalPregunta from '../components/ModalPregunta';
import Estadisticas from '../components/Estadisticas';
import PreguntasRespondidas from '../components/PreguntasRespondidas';
import useStore from '../store';
import axios from 'axios';

const Home = () => {
  const { setPreguntaActual } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPregunta, setCurrentPregunta] = useState(null);
  const [refreshRuleta, setRefreshRuleta] = useState(0);

  const handleSeleccionarPregunta = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/preguntas/${id}`);
      setCurrentPregunta(response.data);
      setPreguntaActual(response.data);
      setIsOpen(true);
    } catch (error) {
      alert('Error al cargar pregunta');
    }
  };

  const handleRespuesta = (correcto) => {
    // Forzar refresco de la ruleta
    setRefreshRuleta(prev => prev + 1);
  };

  const handleCargar = () => {
    // Refrescar ruleta después de cargar CSV
    setRefreshRuleta(prev => prev + 1);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', flexDirection: 'row', gap: '0px', alignItems: 'flex-start' }}>
        <div style={{ flex: 0 }}>
          <div className="section">
            <CargarCSV onCargar={handleCargar} />
          </div>
          <div className="section">
            <Ruleta key={refreshRuleta} onSeleccionarPregunta={handleSeleccionarPregunta} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="section">
            <Estadisticas />
          </div>
          <div className="section">
            <PreguntasRespondidas refresh={refreshRuleta} />
          </div>
        </div>
      </div>
      <ModalPregunta
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pregunta={currentPregunta}
        onRespuesta={handleRespuesta}
      />
    </div>
  );
};

export default Home;