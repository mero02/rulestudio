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

const ModalPreguntaAuto = ({ isOpen, onClose, pregunta, onRespuesta }) => {
  const [selected, setSelected] = useState(null);

  // Hooks deben estar antes de cualquier return condicional
  const modalBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  // Reproducir sonido cuando se abre el modal de pregunta
  useEffect(() => {
    if (isOpen && pregunta) {
      playQuestionSound();
    }
  }, [isOpen, pregunta]);

  const handleRespuesta = async (evaluacion) => {
    try {
      const response = await axios.post('http://localhost:8000/api/autoevaluacion/preguntas/responder', {
        id: pregunta.id,
        evaluacion,
      });

      onRespuesta(evaluacion === 'bien');
      onClose(); // Cerrar modal inmediatamente
    } catch (error) {
      alert('Error al enviar evaluación');
    }
  };

  if (!pregunta) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'sm', md: 'lg' }}>
      <ModalOverlay />
      <ModalContent bg={modalBg} mx={4}>
        <ModalHeader color={textColor} fontSize={{ base: 'lg', md: 'xl' }}>
          Pregunta de Autoevaluación
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text
            id="question-text"
            color={textColor}
            mb={4}
            fontSize={{ base: 'md', md: 'lg' }}
          >
            {pregunta.frase}
          </Text>
          <VStack spacing={3} align="stretch">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Button
                as={motion.button}
                onClick={() => handleRespuesta('bien')}
                colorScheme={selected === 'bien' ? 'green' : 'gray'}
                variant={selected === 'bien' ? 'solid' : 'outline'}
                size={{ base: 'md', md: 'lg' }}
                justifyContent="center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                width="100%"
                fontSize={{ base: 'sm', md: 'md' }}
              >
                Respondí Bien
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Button
                as={motion.button}
                onClick={() => handleRespuesta('mal')}
                colorScheme={selected === 'mal' ? 'red' : 'gray'}
                variant={selected === 'mal' ? 'solid' : 'outline'}
                size={{ base: 'md', md: 'lg' }}
                justifyContent="center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                width="100%"
                fontSize={{ base: 'sm', md: 'md' }}
              >
                Respondí Mal
              </Button>
            </motion.div>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalPreguntaAuto;