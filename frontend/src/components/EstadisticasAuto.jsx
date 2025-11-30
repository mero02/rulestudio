import { useState, useEffect } from 'react';
import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import axios from 'axios';

const EstadisticasAuto = ({ refresh }) => {
  const [estadisticas, setEstadisticas] = useState({
    totalRespondidas: 0,
    bien: 0,
    mal: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEstadisticas();
  }, [refresh]);

  const fetchEstadisticas = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/autoevaluacion/preguntas/respondidas');
      const respondidas = response.data.respondidas;
      setEstadisticas({
        totalRespondidas: respondidas.length,
        bien: respondidas.length, // Todas las respondidas son "bien" en autoevaluación
        mal: 0 // No hay "mal" persistente
      });
    } catch (error) {
      console.error('Error fetching estadísticas autoevaluación', error);
    }
  };

  const handleReiniciarPreguntas = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/autoevaluacion/reiniciar_preguntas');
      fetchEstadisticas();
      alert('Preguntas de autoevaluación reiniciadas');
    } catch (error) {
      alert('Error al reiniciar preguntas de autoevaluación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="lg">Estadísticas Autoevaluación</Heading>
      <Flex gap={6} wrap="wrap">
        <Text fontSize="lg" fontWeight="bold">
          Total evaluadas: {estadisticas.totalRespondidas}
        </Text>
        <Text fontSize="lg" color="green.500" fontWeight="bold">
          Bien: {estadisticas.bien}
        </Text>
        <Text fontSize="lg" color="orange.500" fontWeight="bold">
          Mal: {estadisticas.mal}
        </Text>
      </Flex>
      <Button
        onClick={handleReiniciarPreguntas}
        isDisabled={loading}
        colorScheme="yellow"
        color="black"
        isLoading={loading}
        loadingText="Reiniciando..."
      >
        Reiniciar preguntas
      </Button>
    </VStack>
  );
};

export default EstadisticasAuto;