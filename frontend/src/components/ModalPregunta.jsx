import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import useStore from '../store';
import axios from 'axios';

// Función para reproducir sonido de pregunta
const playQuestionSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // La
    oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.1); // Do#
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2); // Mi

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch (e) {
    console.log('Error playing question sound:', e);
  }
};

// Función para reproducir sonido de éxito
const playSuccessSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // Do
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // Mi
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // Sol

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Error playing success sound:', e);
  }
};

// Función para reproducir sonido de error
const playErrorSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(294, audioContext.currentTime); // Re bajo
    oscillator.frequency.setValueAtTime(277, audioContext.currentTime + 0.1); // Do# bajo

    oscillator.type = 'sawtooth';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Error playing error sound:', e);
  }
};

// Establecer el elemento raíz para el modal
Modal.setAppElement('#root');

const ModalPregunta = ({ isOpen, onClose, pregunta, onRespuesta }) => {
  const { responderPregunta } = useStore();
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  // Reproducir sonido cuando se abre el modal de pregunta
  useEffect(() => {
    if (isOpen && pregunta) {
      playQuestionSound();
    }
  }, [isOpen, pregunta]);

  const handleRespuesta = async (respuesta) => {
    try {
      const response = await axios.post('http://localhost:8000/api/preguntas/responder', {
        id: pregunta.id,
        respuesta,
      });
     
      const { correcto, respuesta_correcta } = response.data;
      responderPregunta(correcto);
      onRespuesta(correcto);
      setResultData({ tuRespuesta: respuesta, correcta: respuesta_correcta, esCorrecto: correcto });
      setShowResult(true);
    } catch (error) {
      alert('Error al enviar respuesta');
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    onClose();
  };

  // Reproducir sonido cuando se muestra el resultado
  if (showResult && resultData) {
    if (resultData.esCorrecto) {
      playSuccessSound();
    } else {
      playErrorSound();
    }
  }

  if (!pregunta) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Pregunta"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            padding: '20px',
            backgroundColor: '#2d3748',
            color: 'white',
            zIndex: 1000,
          },
          overlay: {
            zIndex: 999,
          },
        }}
      >
        <h2>Pregunta</h2>
        <p>{pregunta.frase}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          {pregunta.opciones.map((opcion, index) => (
            <button
              key={index}
              onClick={() => handleRespuesta(opcion)}
              style={{
                padding: '10px',
                backgroundColor: selected === opcion ? '#3182ce' : '#4a5568',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {opcion}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: '20px', backgroundColor: '#e53e3e', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}>Cerrar</button>
      </Modal>

      <Modal
        isOpen={showResult}
        onRequestClose={handleCloseResult}
        contentLabel="Resultado"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '350px',
            padding: '20px',
            backgroundColor: resultData?.esCorrecto ? '#38a169' : '#e53e3e',
            color: 'white',
            zIndex: 1001,
          },
          overlay: {
            zIndex: 1000,
          },
        }}
      >
        <h2>{resultData?.esCorrecto ? '¡Correcto!' : 'Incorrecto'}</h2>
        <p>Tu respuesta: {resultData?.tuRespuesta}</p>
        <p>Respuesta correcta: {resultData?.correcta}</p>
        <button onClick={handleCloseResult} style={{ marginTop: '20px', backgroundColor: '#3182ce', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}>Continuar</button>
      </Modal>
    </>
  );
};

export default ModalPregunta;