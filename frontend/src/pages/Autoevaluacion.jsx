import { useState } from 'react';
import { Box, Grid, GridItem, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import CargarCSVAuto from '../components/CargarCSVAuto';
import RuletaAuto from '../components/RuletaAuto';
import ModalPreguntaAuto from '../components/ModalPreguntaAuto';
import EstadisticasAuto from '../components/EstadisticasAuto';
import PreguntasRespondidasAuto from '../components/PreguntasRespondidasAuto';
import ThemeToggle from '../components/ThemeToggle';
import axios from 'axios';

const Autoevaluacion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPregunta, setCurrentPregunta] = useState(null);
  const [refreshRuleta, setRefreshRuleta] = useState(0);

  const handleSeleccionarPregunta = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/autoevaluacion/preguntas/${id}`);
      setCurrentPregunta(response.data);
      setIsOpen(true);
    } catch (error) {
      alert('Error al cargar pregunta de autoevaluación');
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
              <CargarCSVAuto onCargar={handleCargar} />
            </Box>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box p={6} borderRadius="lg" shadow="md">
              <RuletaAuto key={refreshRuleta} onSeleccionarPregunta={handleSeleccionarPregunta} />
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
              <EstadisticasAuto refresh={refreshRuleta} />
            </Box>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Box bg={useColorModeValue('gray.50', 'gray.700')} p={6} borderRadius="lg" shadow="md">
              <PreguntasRespondidasAuto refresh={refreshRuleta} />
            </Box>
          </motion.div>
        </GridItem>
      </Grid>
      <ModalPreguntaAuto
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pregunta={currentPregunta}
        onRespuesta={handleRespuesta}
      />
    </Box>
  );
};

export default Autoevaluacion;