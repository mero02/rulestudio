import { useState, useEffect } from 'react';
import { Box, Button, Text, VStack, HStack, Badge, useColorModeValue, useToast, SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import useStore from '../store';

const RuletaJugadores = ({ onJugadorSeleccionado, juegoIniciado, onTurnoCompletado }) => {
  const [estadoJuego, setEstadoJuego] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);

  // Usar estado global para turnoBloqueado
  const { turnoBloqueado, setTurnoBloqueado } = useStore();
  const toast = useToast();

  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('blue.800', 'blue.200');

  useEffect(() => {
    if (juegoIniciado) {
      cargarEstadoJuego();
    }
  }, [juegoIniciado]);

  const cargarEstadoJuego = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/jugadores/juego/estado');
      setEstadoJuego(response.data);
    } catch (error) {
      console.error('Error cargando estado del juego:', error);
    }
  };

  const girarRuleta = async () => {
    if (turnoBloqueado) {
      toast({
        title: 'Turno en progreso',
        description: 'Espera a que el jugador actual termine su turno',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    if (!estadoJuego?.cola_pendientes?.length) {
      toast({
        title: 'No hay jugadores pendientes',
        description: 'Todos los jugadores han tenido su turno',
        status: 'info',
        duration: 3000,
      });
      return;
    }

    setIsSpinning(true);
    setJugadorSeleccionado(null);

    try {
      // Simular giro de ruleta
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await axios.post('http://localhost:8000/api/jugadores/juego/seleccionar_jugador');
      const jugadorId = response.data.jugador_seleccionado;

      // Encontrar el jugador seleccionado
      const jugador = estadoJuego.jugadores.find(j => j.id === jugadorId);
      setJugadorSeleccionado(jugador);
      setTurnoBloqueado(true); // Bloquear giros hasta que termine el turno

      // Actualizar estado
      await cargarEstadoJuego();

      // Notificar al componente padre
      onJugadorSeleccionado?.(jugador);

      toast({
        title: `¡Turno de ${jugador.nombre}!`,
        description: 'Ahora debe girar su ruleta individual',
        status: 'success',
        duration: 4000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo seleccionar jugador',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSpinning(false);
    }
  };

  const liberarTurno = () => {
    setTurnoBloqueado(false);
    setJugadorSeleccionado(null);
    onTurnoCompletado?.();
  };

  if (!juegoIniciado) {
    return (
      <Box textAlign="center" p={6}>
        <Text color="gray.500">
          Inicia el juego para comenzar con la selección de jugadores
        </Text>
      </Box>
    );
  }

  const jugadoresPendientes = estadoJuego?.jugadores?.filter(j =>
    estadoJuego.cola_pendientes.includes(j.id)
  ) || [];

  return (
    <Box textAlign="center">
      <VStack spacing={6}>
        {/* Cola de Jugadores Pendientes */}
        {jugadoresPendientes.length > 0 && (
          <Box>
            <Text fontSize="md" fontWeight="bold" mb={3}>
              Cola de Jugadores Pendientes:
            </Text>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2} maxW="400px" mx="auto">
              {jugadoresPendientes.map((jugador, index) => (
                <motion.div
                  key={jugador.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge
                    colorScheme="blue"
                    variant="subtle"
                    p={2}
                    borderRadius="md"
                    fontSize="sm"
                    display="block"
                  >
                    {index + 1}. {jugador.nombre}
                  </Badge>
                </motion.div>
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Box
          bg={bgColor}
          p={8}
          borderRadius="full"
          width="300px"
          height="300px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          overflow="hidden"
        >
          {isSpinning ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            >
              <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                🎯
              </Text>
            </motion.div>
          ) : jugadorSeleccionado ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <VStack spacing={2}>
                <Text fontSize="3xl">🎉</Text>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  {jugadorSeleccionado.nombre}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  ¡Es tu turno!
                </Text>
                <Badge colorScheme="green" variant="solid">
                  Turno Activo
                </Badge>
              </VStack>
            </motion.div>
          ) : turnoBloqueado ? (
            <VStack spacing={2}>
              <Text fontSize="3xl">⏳</Text>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Turno en Progreso
              </Text>
              <Text fontSize="sm" color="gray.600">
                Esperando que termine el jugador actual
              </Text>
            </VStack>
          ) : (
            <VStack spacing={2}>
              <Text fontSize="4xl">🎲</Text>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                {jugadoresPendientes.length} jugadores pendientes
              </Text>
            </VStack>
          )}
        </Box>

        <VStack spacing={3}>
          <Button
            as={motion.button}
            whileHover={{ scale: turnoBloqueado ? 1 : 1.05 }}
            whileTap={{ scale: turnoBloqueado ? 1 : 0.95 }}
            colorScheme={turnoBloqueado ? "orange" : "blue"}
            size="lg"
            onClick={girarRuleta}
            isDisabled={isSpinning || turnoBloqueado || !jugadoresPendientes.length}
            isLoading={isSpinning}
            loadingText="Seleccionando jugador..."
          >
            {turnoBloqueado ? '⏳ Turno en Progreso' : '🎯 Seleccionar Jugador'}
          </Button>

          {turnoBloqueado && (
            <VStack spacing={1}>
              <Text fontSize="sm" color="orange.600" fontWeight="bold">
                🎪 Jugador activo respondiendo pregunta
              </Text>
              <Text fontSize="xs" color="gray.500">
                El turno se liberará automáticamente al completar la respuesta
              </Text>
            </VStack>
          )}

          {!turnoBloqueado && jugadoresPendientes.length > 0 && (
            <Text fontSize="sm" color="blue.600">
              👆 Haz clic para seleccionar el siguiente jugador al azar
            </Text>
          )}
        </VStack>

        {estadoJuego?.cola_pendientes?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Text color="green.500" fontWeight="bold">
              ¡Todos los jugadores han tenido su turno! La cola se reiniciará automáticamente.
            </Text>
          </motion.div>
        )}
      </VStack>
    </Box>
  );
};

export default RuletaJugadores;