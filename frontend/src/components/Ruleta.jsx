import { useState, useEffect, useRef } from 'react';
import { Box, Button, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Wheel } from 'react-custom-roulette';
import { FaPlay, FaDice, FaSpinner } from 'react-icons/fa';
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
    <VStack spacing={6} align="center">
      {data.length > 0 ? (
        <>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              as={motion.button}
              onClick={handleSpinClick}
              isDisabled={mustSpin}
              variant="gradient"
              size="lg"
              px={8}
              py={4}
              leftIcon={mustSpin ? <Icon as={FaSpinner} /> : <Icon as={FaDice} />}
              animate={mustSpin ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
              boxShadow="2xl"
              bgGradient="linear(to-r, wheel.primary, wheel.secondary)"
              _hover={{
                bgGradient: "linear(to-r, wheel.primary, wheel.accent)",
                transform: "translateY(-2px)",
                boxShadow: "3xl"
              }}
            >
              {mustSpin ? 'Girando...' : '¡Girar Ruleta!'}
            </Button>
          </motion.div>

          <Box
            className="wheel-container"
            p={6}
            borderRadius="2xl"
            bgGradient="radial(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <motion.div
              animate={mustSpin ? {
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              } : { rotate: 0, scale: 1 }}
              transition={{
                duration: 0.3,
                repeat: mustSpin ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={data}
                onStopSpinning={handleStopSpinning}
                backgroundColors={['#ff8f43', '#70bbe0', '#0b3351', '#f9dd50']}
                textColors={['#ffffff']}
                spinDuration={0.8}
                outerBorderColor="#ffffff"
                outerBorderWidth={3}
                innerBorderColor="#ffffff"
                innerBorderWidth={2}
                radiusLineColor="#ffffff"
                radiusLineWidth={2}
                fontSize={16}
                textDistance={60}
              />
            </motion.div>
          </Box>
        </>
      ) : (
        <VStack spacing={4} textAlign="center">
          <Icon as={FaDice} boxSize="3xl" color="gray.400" />
          <Text color="gray.600" fontSize="lg">
            No hay preguntas activas
          </Text>
          <Text color="gray.500" fontSize="sm">
            Importa un CSV primero para comenzar
          </Text>
        </VStack>
      )}
    </VStack>
  );
};

export default Ruleta;