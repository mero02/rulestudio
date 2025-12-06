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
  Icon,
  HStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaQuestion } from 'react-icons/fa';
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

  // Hooks deben estar antes de cualquier return condicional
  const modalBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

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
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'sm', md: 'lg' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg={modalBg}
          mx={4}
          borderRadius="2xl"
          boxShadow="2xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <ModalHeader
            color={textColor}
            fontSize={{ base: 'lg', md: 'xl' }}
            textAlign="center"
            pb={2}
          >
            <HStack justify="center" spacing={3}>
              <Icon as={FaQuestion} color="brand.500" />
              <Text>Pregunta</Text>
            </HStack>
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
            <VStack spacing={4} align="stretch" role="radiogroup" aria-labelledby="question-text">
              {pregunta.opciones.map((opcion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Button
                    as={motion.button}
                    onClick={() => handleRespuesta(opcion)}
                    variant={selected === opcion ? 'solid' : 'outline'}
                    colorScheme={selected === opcion ? 'brand' : 'gray'}
                    size={{ base: 'md', md: 'lg' }}
                    justifyContent="flex-start"
                    px={6}
                    py={4}
                    width="100%"
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="semibold"
                    borderRadius="xl"
                    borderWidth={2}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: 'lg',
                      borderColor: 'brand.300'
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    aria-pressed={selected === opcion}
                    role="option"
                    aria-selected={selected === opcion}
                    _hover={{
                      bg: selected === opcion ? 'brand.600' : 'brand.50',
                      borderColor: 'brand.400'
                    }}
                  >
                    <HStack spacing={3}>
                      <Icon
                        as={selected === opcion ? FaCheck : FaQuestion}
                        color={selected === opcion ? 'white' : 'brand.500'}
                      />
                      <Text>{opcion}</Text>
                    </HStack>
                  </Button>
                </motion.div>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={showResult} onClose={handleCloseResult} size={{ base: 'sm', md: 'md' }}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          as={motion.div}
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          bgGradient={resultData?.esCorrecto ?
            'linear(to-br, success.400, success.600)' :
            'linear(to-br, error.400, error.600)'}
          color="white"
          mx={4}
          borderRadius="2xl"
          boxShadow="2xl"
          border="2px solid white"
        >
          <ModalHeader
            fontSize={{ base: 'lg', md: 'xl' }}
            textAlign="center"
            pb={2}
          >
            <HStack justify="center" spacing={3}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Icon
                  as={resultData?.esCorrecto ? FaCheck : FaTimes}
                  boxSize={6}
                />
              </motion.div>
              <Text fontWeight="bold">
                {resultData?.esCorrecto ? '¡Correcto!' : 'Incorrecto'}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <VStack spacing={2} align="start">
                  <HStack>
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="semibold">
                      Tu respuesta:
                    </Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }}>
                      {resultData?.tuRespuesta}
                    </Text>
                  </HStack>
                  <HStack>
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="semibold">
                      Respuesta correcta:
                    </Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }}>
                      {resultData?.correcta}
                    </Text>
                  </HStack>
                </VStack>
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <Button
                  onClick={handleCloseResult}
                  variant="gradient"
                  bg="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: "whiteAlpha.300" }}
                  mt={4}
                  size={{ base: 'sm', md: 'md' }}
                  px={6}
                  borderRadius="xl"
                >
                  Continuar
                </Button>
              </motion.div>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalPregunta;