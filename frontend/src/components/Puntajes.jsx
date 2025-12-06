import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  VStack,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Puntajes = ({ refreshTrigger }) => {
  const [jugadores, setJugadores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    cargarPuntajes();
  }, [refreshTrigger]);

  const cargarPuntajes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8000/api/jugadores/');
      // Ordenar por puntaje descendente
      const sortedJugadores = response.data.sort((a, b) => b.puntaje - a.puntaje);
      setJugadores(sortedJugadores);
    } catch (error) {
      console.error('Error cargando puntajes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPosicionBadge = (index) => {
    switch (index) {
      case 0:
        return <Badge colorScheme="yellow" variant="solid">🥇 1er</Badge>;
      case 1:
        return <Badge colorScheme="gray" variant="solid">🥈 2do</Badge>;
      case 2:
        return <Badge colorScheme="orange" variant="solid">🥉 3er</Badge>;
      default:
        return <Badge variant="outline">{index + 1}°</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Center p={8}>
        <Spinner size="lg" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold" textAlign="center">
          🏆 Tabla de Puntajes
        </Text>

        {jugadores.length === 0 ? (
          <Text textAlign="center" color="gray.500" py={8}>
            No hay jugadores registrados
          </Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Posición</Th>
                  <Th>Jugador</Th>
                  <Th isNumeric>Puntaje</Th>
                  <Th isNumeric>Consecutivas</Th>
                  <Th>Estado</Th>
                </Tr>
              </Thead>
              <Tbody>
                {jugadores.map((jugador, index) => (
                  <motion.tr
                    key={jugador.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Td>{getPosicionBadge(index)}</Td>
                    <Td fontWeight="bold">{jugador.nombre}</Td>
                    <Td isNumeric>
                      <Text fontSize="lg" fontWeight="bold" color="blue.500">
                        {jugador.puntaje}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Badge
                        colorScheme={jugador.consecutivas > 0 ? "green" : "gray"}
                        variant="subtle"
                      >
                        {jugador.consecutivas}
                      </Badge>
                    </Td>
                    <Td>
                      {jugador.consecutivas > 0 && (
                        <Badge colorScheme="green" variant="solid">
                          🔥 Racha activa
                        </Badge>
                      )}
                    </Td>
                  </motion.tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        <Text fontSize="sm" color="gray.600" textAlign="center">
          Sistema de puntos: +1 por respuesta correcta + bono por consecutivas
        </Text>
      </VStack>
    </Box>
  );
};

export default Puntajes;