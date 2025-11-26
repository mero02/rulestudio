import { useState } from 'react';
import { Box, Flex, Grid, GridItem, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
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
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} p={4}>
      <ThemeToggle />
      <Grid templateColumns={{ base: '1fr', md: '400px 1fr' }} gap={6} alignItems="start">
        <GridItem>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box bg={useColorModeValue('gray.50', 'gray.700')} p={6} borderRadius="lg" shadow="md" mb={6}>
              <CargarCSV onCargar={handleCargar} />
            </Box>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box  p={6} borderRadius="lg" shadow="md">
              <Ruleta key={refreshRuleta} onSeleccionarPregunta={handleSeleccionarPregunta} />
            </Box>
          </motion.div>
        </GridItem>
        <GridItem>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Box bg={useColorModeValue('gray.50', 'gray.700')} p={6} borderRadius="lg" shadow="md" mb={6}>
              <Estadisticas />
            </Box>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Box bg={useColorModeValue('gray.50', 'gray.700')} p={6} borderRadius="lg" shadow="md">
              <PreguntasRespondidas refresh={refreshRuleta} />
            </Box>
          </motion.div>
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