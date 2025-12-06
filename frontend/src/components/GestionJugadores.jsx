import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  List,
  ListItem,
  Text,
  HStack,
  VStack,
  IconButton,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';

const GestionJugadores = ({ onJugadoresChange }) => {
  const [jugadores, setJugadores] = useState([]);
  const [nuevoJugador, setNuevoJugador] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    cargarJugadores();
  }, []);

  const cargarJugadores = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/jugadores/');
      setJugadores(response.data);
      onJugadoresChange?.(response.data);
    } catch (error) {
      console.error('Error cargando jugadores:', error);
    }
  };

  const agregarJugador = async () => {
    if (!nuevoJugador.trim()) return;

    setIsLoading(true);
    try {
      await axios.post('http://localhost:8000/api/jugadores/', {
        nombre: nuevoJugador.trim(),
      });
      setNuevoJugador('');
      await cargarJugadores();
      toast({
        title: 'Jugador agregado',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'No se pudo agregar el jugador',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarJugador = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/jugadores/${id}`);
      await cargarJugadores();
      toast({
        title: 'Jugador eliminado',
        status: 'info',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el jugador',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      agregarJugador();
    }
  };

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" shadow="md">
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold" textAlign="center">
          Gestión de Jugadores
        </Text>

        <HStack>
          <Input
            placeholder="Nombre del jugador"
            value={nuevoJugador}
            onChange={(e) => setNuevoJugador(e.target.value)}
            onKeyPress={handleKeyPress}
            flex={1}
          />
          <IconButton
            icon={<AddIcon />}
            colorScheme="blue"
            onClick={agregarJugador}
            isLoading={isLoading}
            aria-label="Agregar jugador"
          />
        </HStack>

        <List spacing={2}>
          {jugadores.map((jugador) => (
            <ListItem
              key={jugador.id}
              p={3}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{jugador.nombre}</Text>
                  <HStack spacing={4}>
                    <Text fontSize="sm" color="gray.600">
                      Puntaje: {jugador.puntaje}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Consecutivas: {jugador.consecutivas}
                    </Text>
                  </HStack>
                </VStack>
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarJugador(jugador.id)}
                  aria-label="Eliminar jugador"
                />
              </HStack>
            </ListItem>
          ))}
        </List>

        {jugadores.length === 0 && (
          <Text textAlign="center" color="gray.500" py={4}>
            No hay jugadores. Agrega algunos para comenzar.
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default GestionJugadores;