import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
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

// Chakra UI maneja el app element automáticamente

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
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={useColorModeValue('white', 'gray.800')}>
          <ModalHeader color={useColorModeValue('gray.800', 'white')}>Pregunta</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text color="white" mb={4} fontSize="lg">{pregunta.frase}</Text>
            <VStack spacing={3} align="stretch">
              {pregunta.opciones.map((opcion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Button
                    as={motion.button}
                    onClick={() => handleRespuesta(opcion)}
                    colorScheme={selected === opcion ? 'blue' : 'gray'}
                    variant={selected === opcion ? 'solid' : 'outline'}
                    size="lg"
                    justifyContent="flex-start"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    width="100%"
                  >
                    {opcion}
                  </Button>
                </motion.div>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={showResult} onClose={handleCloseResult} size="md">
        <ModalOverlay />
        <ModalContent
          as={motion.div}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          bg={resultData?.esCorrecto ? 'green.500' : 'red.500'}
          color="white"
        >
          <ModalHeader>{resultData?.esCorrecto ? '¡Correcto!' : 'Incorrecto'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Text>Tu respuesta: {resultData?.tuRespuesta}</Text>
              <Text>Respuesta correcta: {resultData?.correcta}</Text>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Button onClick={handleCloseResult} colorScheme="blue" mt={4}>
                Continuar
              </Button>
            </motion.div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalPregunta;