import { useState, useEffect, useRef } from 'react';
import { Wheel } from 'react-custom-roulette';
import useStore from '../store';
import axios from 'axios';

// Función para reproducir sonido de giro de ruleta
const playSpinSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(200, audioContext.currentTime); // Frecuencia baja
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5); // Decay
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Error playing spin sound:', e);
  }
};

// Función para reproducir sonido de traqueteo tipo track
const playTickSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(600, audioContext.currentTime); // Tono constante
    oscillator.type = 'triangle'; // Más suave

    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  } catch (e) {
    console.log('Error playing tick sound:', e);
  }
};

const Ruleta = ({ onSeleccionarPregunta }) => {
  const { preguntasActivas, setPreguntasActivas } = useStore();
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const tickIntervalRef = useRef(null);

  useEffect(() => {
    fetchPreguntasActivas();
  }, []);

  const fetchPreguntasActivas = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/preguntas/activas');
      setPreguntasActivas(response.data.activas);
    } catch (error) {
      console.error('Error fetching preguntas activas', error);
    }
  };

  const data = preguntasActivas.map(id => ({ option: id.toString() }));

  const handleSpinClick = () => {
    if (data.length === 0) return;
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    // Reproducir sonido inicial de giro
    playSpinSound();
    // Iniciar sonido de traqueteo
    tickIntervalRef.current = setInterval(playTickSound, 150); // Cada 150ms
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    // Detener sonido de traqueteo
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    const selectedId = preguntasActivas[prizeNumber];
    onSeleccionarPregunta(selectedId);
  };

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '16px' }}>
      {data.length > 0 ? (
        <>
        <button
            onClick={handleSpinClick}
            disabled={mustSpin}
            style={{
              marginTop: '6px',
              padding: '8px 16px',
              backgroundColor: mustSpin ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: mustSpin ? 'not-allowed' : 'pointer',
            }}
          >
            Girar Ruleta
          </button>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={handleStopSpinning}
            backgroundColors={['#ff8f43', '#70bbe0', '#0b3351', '#f9dd50']}
            textColors={['#ffffff']}
            spinDuration={0.5} // Más rápido
          />
        </>
      ) : (
        <p>No hay preguntas activas. Importa un CSV primero.</p>
      )}
    </div>
  );
};

export default Ruleta;