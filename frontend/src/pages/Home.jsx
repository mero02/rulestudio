import { useState } from 'react';
import { Box, HStack, Flex, Grid, GridItem, useColorModeValue, VStack, Text, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaGamepad, FaChartBar } from 'react-icons/fa';
import CargarCSV from '../components/CargarCSV';
import Ruleta from '../components/Ruleta';
import ModalPregunta from '../components/ModalPregunta';
import Estadisticas from '../components/Estadisticas';
import PreguntasRespondidas from '../components/PreguntasRespondidas';
import ThemeToggle from '../components/ThemeToggle';
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
    <Box
      minH="100vh"
      bgGradient={useColorModeValue(
        'linear(to-br, gray.50, blue.50)',
        'linear(to-br, gray.900, blue.900)'
      )}
      p={{ base: 4, md: 6 }}
    >
      <Flex justify="flex-end" mb={6}>
        <ThemeToggle />
      </Flex>

      <Grid
        templateColumns={{ base: '1fr', lg: '450px 1fr' }}
        gap={{ base: 6, md: 8 }}
        alignItems="start"
        maxW="1400px"
        mx="auto"
      >
        {/* Panel Izquierdo - Juego */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Box
                bg={useColorModeValue('white', 'gray.800')}
                p={6}
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                backdropFilter="blur(10px)"
              >
                <VStack spacing={4} align="start">
                  <HStack>
                    <Icon as={FaGamepad} color="brand.500" />
                    <Text fontSize="lg" fontWeight="bold">Configuración</Text>
                  </HStack>
                  <CargarCSV onCargar={handleCargar} />
                </VStack>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box
                bg={useColorModeValue('white', 'gray.800')}
                p={6}
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                backdropFilter="blur(10px)"
              >
                <Ruleta key={refreshRuleta} onSeleccionarPregunta={handleSeleccionarPregunta} />
              </Box>
            </motion.div>
          </VStack>
        </GridItem>

        {/* Panel Derecho - Estadísticas */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Box
                bg={useColorModeValue('white', 'gray.800')}
                p={6}
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                backdropFilter="blur(10px)"
              >
                <VStack spacing={4} align="start">
                  <HStack>
                    <Icon as={FaChartBar} color="brand.500" />
                    <Text fontSize="lg" fontWeight="bold">Estadísticas</Text>
                  </HStack>
                  <Estadisticas />
                </VStack>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Box
                bg={useColorModeValue('white', 'gray.800')}
                p={6}
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                backdropFilter="blur(10px)"
              >
                <PreguntasRespondidas refresh={refreshRuleta} />
              </Box>
            </motion.div>
          </VStack>
        </GridItem>
      </Grid>
      <ModalPregunta
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pregunta={currentPregunta}
        onRespuesta={handleRespuesta}
      />
    </Box>
  );
};

export default Home;