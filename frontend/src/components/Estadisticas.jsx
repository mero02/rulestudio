import { useState } from 'react';
import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import useStore from '../store';
import axios from 'axios';

const Estadisticas = () => {
  const { estadisticas, resetEstadisticas, setPreguntasActivas } = useStore();
  const [loading, setLoading] = useState(false);

  const handleReiniciarPreguntas = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/reiniciar_preguntas');
      // Refrescar preguntas activas
      const response = await axios.get('http://localhost:8000/api/preguntas/activas');
      setPreguntasActivas(response.data.activas);
      alert('Preguntas reiniciadas');
    } catch (error) {
      alert('Error al reiniciar preguntas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="lg">Estadísticas</Heading>
      <Flex gap={6} wrap="wrap">
        <Text fontSize="lg" fontWeight="bold">
          Total respondidas: {estadisticas.totalRespondidas}
        </Text>
        <Text fontSize="lg" color="green.500" fontWeight="bold">
          Correctas: {estadisticas.totalCorrectas}
        </Text>
        <Text fontSize="lg" color="red.500" fontWeight="bold">
          Incorrectas: {estadisticas.totalIncorrectas}
        </Text>
      </Flex>
      <Flex gap={4}>
        <Button onClick={resetEstadisticas} colorScheme="red">
          Reiniciar estadísticas
        </Button>
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
      </Flex>
    </VStack>
  );
};

export default Estadisticas;