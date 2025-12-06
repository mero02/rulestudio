import { useState, useEffect, useRef } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Wheel } from 'react-custom-roulette';
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

const RuletaAuto = ({ onSeleccionarPregunta, preguntasActivas: preguntasActivasProp }) => {
  const [preguntasActivas, setPreguntasActivas] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const tickIntervalRef = useRef(null);

  useEffect(() => {
    if (preguntasActivasProp) {
      // Usar preguntas proporcionadas (modo multi-jugador)
      setPreguntasActivas(preguntasActivasProp);
    } else {
      // Fetchear todas las preguntas (modo clásico)
      fetchPreguntasActivas();
    }
  }, [preguntasActivasProp]);

  const fetchPreguntasActivas = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/autoevaluacion/preguntas/activas');
      setPreguntasActivas(response.data.activas);
    } catch (error) {
      console.error('Error fetching preguntas activas autoevaluacion', error);
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
    <Box textAlign="center">
      {data.length > 0 ? (
        <>
          <Button
            as={motion.button}
            onClick={handleSpinClick}
            isDisabled={mustSpin}
            colorScheme="brand"
            size="lg"
            mb={4}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={mustSpin ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            Girar Ruleta
          </Button>
          <Box className="wheel-container">
            <motion.div
              animate={mustSpin ? { rotate: [0, 10, -10, 0] } : { rotate: 0 }}
              transition={{ duration: 0.5, repeat: mustSpin ? Infinity : 0 }}
            >
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={data}
                onStopSpinning={handleStopSpinning}
                backgroundColors={['#ff8f43', '#70bbe0', '#0b3351', '#f9dd50']}
                textColors={['#ffffff']}
                spinDuration={0.5}
              />
            </motion.div>
          </Box>
        </>
      ) : (
        <Text color="gray.600">No hay preguntas activas. Importa un CSV primero.</Text>
      )}
    </Box>
  );
};

export default RuletaAuto;