import { useState } from 'react';
import { Box, Grid, GridItem, useColorModeValue, Button, HStack, Text, VStack, Badge, Flex, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaUsers, FaTrophy, FaGamepad, FaChartBar, FaPlay } from 'react-icons/fa';
import CargarCSVAuto from '../components/CargarCSVAuto';
import RuletaAuto from '../components/RuletaAuto';
import ModalPreguntaAuto from '../components/ModalPreguntaAuto';
import EstadisticasAuto from '../components/EstadisticasAuto';
import PreguntasRespondidasAuto from '../components/PreguntasRespondidasAuto';
import GestionJugadores from '../components/GestionJugadores';
import RuletaJugadores from '../components/RuletaJugadores';
import Puntajes from '../components/Puntajes';
import ThemeToggle from '../components/ThemeToggle';
import useStore from '../store';
import axios from 'axios';

const Autoevaluacion = () => {
  // TODOS los hooks deben estar al principio y en el mismo orden siempre
  const {
    modoMultiJugador,
    setModoMultiJugador,
    jugadorActual,
    setJugadorActual,
    juegoIniciado,
    setJuegoIniciado,
    preguntasJugadorActivas,
    setPreguntasJugadorActivas,
    turnoBloqueado,
    setTurnoBloqueado,
    resetModoMultiJugador,
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [currentPregunta, setCurrentPregunta] = useState(null);
  const [refreshRuleta, setRefreshRuleta] = useState(0);

  // Chakra UI hooks - deben estar después de los hooks de estado pero antes de cualquier return
  const bgGradient = useColorModeValue(
    'linear(to-br, gray.50, green.50)',
    'linear(to-br, gray.900, green.900)'
  );

  const toggleBg = useColorModeValue('white', 'gray.800');
  const toggleBorderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const playerCardBg = useColorModeValue(
    'linear(to-br, success.50, success.100)',
    'linear(to-br, success.900, success.800)'
  );

  const handleSeleccionarPregunta = async (id) => {
    try {
      const endpoint = modoMultiJugador && jugadorActual
        ? `http://localhost:8000/api/autoevaluacion/preguntas/${id}`
        : `http://localhost:8000/api/autoevaluacion/preguntas/${id}`;

      const response = await axios.get(endpoint);
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

  const toggleModoMultiJugador = () => {
    if (modoMultiJugador) {
      // Salir del modo multi-jugador
      resetModoMultiJugador();
    } else {
      // Entrar al modo multi-jugador
      setModoMultiJugador(true);
    }
  };

  const handleJugadoresChange = (jugadores) => {
    // Actualizar lista de jugadores en el store
    useStore.getState().setJugadores(jugadores);
  };

  const handleJugadorSeleccionado = async (jugador) => {
    setJugadorActual(jugador);

    // Cargar preguntas activas del jugador
    try {
      const response = await axios.get(`http://localhost:8000/api/jugadores/${jugador.id}/preguntas/activas`);
      setPreguntasJugadorActivas(response.data.activas);
    } catch (error) {
      console.error('Error cargando preguntas del jugador:', error);
    }
  };

  const iniciarJuego = async () => {
    try {
      await axios.post('http://localhost:8000/api/jugadores/juego/iniciar');
      setJuegoIniciado(true);
      setRefreshRuleta(prev => prev + 1);
    } catch (error) {
      alert('Error al iniciar el juego: ' + error.response?.data?.detail);
    }
  };

  const reiniciarJuego = async () => {
    try {
      await axios.post('http://localhost:8000/api/jugadores/juego/reiniciar');
      resetModoMultiJugador();
      setRefreshRuleta(prev => prev + 1);
    } catch (error) {
      alert('Error al reiniciar el juego');
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      p={{ base: 4, md: 6 }}
    >
      <Flex justify="flex-end" mb={6}>
        <ThemeToggle />
      </Flex>

      {/* Toggle de modo */}
      <Box textAlign="center" mb={8}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <HStack
            justify="center"
            spacing={4}
            bg={toggleBg}
            p={4}
            borderRadius="2xl"
            shadow="lg"
            border="1px solid"
            borderColor={toggleBorderColor}
            backdropFilter="blur(10px)"
          >
            <Button
              colorScheme={!modoMultiJugador ? "brand" : "gray"}
              variant={!modoMultiJugador ? "solid" : "outline"}
              onClick={() => setModoMultiJugador(false)}
              leftIcon={<Icon as={FaGamepad} />}
              size="lg"
              px={6}
              borderRadius="xl"
            >
              Modo Clásico
            </Button>
            <Button
              colorScheme={modoMultiJugador ? "success" : "gray"}
              variant={modoMultiJugador ? "solid" : "outline"}
              onClick={toggleModoMultiJugador}
              leftIcon={<Icon as={FaUsers} />}
              size="lg"
              px={6}
              borderRadius="xl"
            >
              Modo Multi-Jugador
            </Button>
          </HStack>
        </motion.div>
      </Box>

      {!modoMultiJugador ? (
        /* Modo Clásico */
        <Grid
          templateColumns={{ base: '1fr', lg: '450px 1fr' }}
          gap={{ base: 6, md: 8 }}
          alignItems="start"
          maxW="1400px"
          mx="auto"
        >
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
                    <CargarCSVAuto onCargar={handleCargar} />
                  </VStack>
                </Box>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="2xl"
                  shadow="xl"
                  border="1px solid"
                  borderColor={cardBorderColor}
                  backdropFilter="blur(10px)"
                >
                  <RuletaAuto key={refreshRuleta} onSeleccionarPregunta={handleSeleccionarPregunta} />
                </Box>
              </motion.div>
            </VStack>
          </GridItem>
          <GridItem>
            <VStack spacing={6} align="stretch">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="2xl"
                  shadow="xl"
                  border="1px solid"
                  borderColor={cardBorderColor}
                  backdropFilter="blur(10px)"
                >
                  <VStack spacing={4} align="start">
                    <HStack>
                      <Icon as={FaChartBar} color="brand.500" />
                      <Text fontSize="lg" fontWeight="bold">Estadísticas</Text>
                    </HStack>
                    <EstadisticasAuto refresh={refreshRuleta} />
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
                  <PreguntasRespondidasAuto refresh={refreshRuleta} />
                </Box>
              </motion.div>
            </VStack>
          </GridItem>
        </Grid>
      ) : (
        /* Modo Multi-Jugador */
        <Grid
          templateColumns={{ base: '1fr', lg: '320px 450px 1fr' }}
          gap={{ base: 6, md: 8 }}
          alignItems="start"
          maxW="1400px"
          mx="auto"
        >
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
                    <CargarCSVAuto onCargar={handleCargar} />
                  </VStack>
                </Box>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="2xl"
                  shadow="xl"
                  border="1px solid"
                  borderColor={cardBorderColor}
                  backdropFilter="blur(10px)"
                >
                  <VStack spacing={4} align="start">
                    <HStack>
                      <Icon as={FaUsers} color="brand.500" />
                      <Text fontSize="lg" fontWeight="bold">Jugadores</Text>
                    </HStack>
                    <GestionJugadores onJugadoresChange={handleJugadoresChange} />
                  </VStack>
                </Box>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <VStack spacing={4}>
                  <Button
                    colorScheme="success"
                    variant="gradient"
                    onClick={iniciarJuego}
                    isDisabled={juegoIniciado}
                    width="100%"
                    size="lg"
                    leftIcon={<Icon as={FaPlay} />}
                  >
                    {juegoIniciado ? 'Juego Iniciado' : 'Iniciar Juego'}
                  </Button>
                  <Button
                    colorScheme="error"
                    variant="outline"
                    onClick={reiniciarJuego}
                    width="100%"
                    size="lg"
                    leftIcon={<Icon as={FaTrophy} />}
                    _hover={{ bg: "error.50" }}
                  >
                    Reiniciar Juego
                  </Button>
                </VStack>
              </motion.div>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack spacing={6} align="stretch">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="2xl"
                  shadow="xl"
                  border="1px solid"
                  borderColor={cardBorderColor}
                  backdropFilter="blur(10px)"
                >
                  <RuletaJugadores
                    onJugadorSeleccionado={handleJugadorSeleccionado}
                    juegoIniciado={juegoIniciado}
                  />
                </Box>
              </motion.div>

              {jugadorActual && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Box
                    p={6}
                    borderRadius="2xl"
                    shadow="2xl"
                    border="3px solid"
                    borderColor="success.400"
                    bgGradient={playerCardBg}
                    backdropFilter="blur(10px)"
                  >
                    <VStack spacing={4}>
                      <HStack spacing={3} justify="center">
                        <Icon as={FaTrophy} color="success.600" />
                        <Text fontSize="lg" fontWeight="bold">
                          Turno de: {jugadorActual.nombre}
                        </Text>
                        <Badge colorScheme="success" variant="solid" fontSize="sm" borderRadius="lg">
                          ACTIVO
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        Solo se muestran las preguntas asignadas a este jugador
                      </Text>
                      <RuletaAuto
                        key={`jugador-${jugadorActual.id}-${refreshRuleta}`}
                        onSeleccionarPregunta={handleSeleccionarPregunta}
                        preguntasActivas={preguntasJugadorActivas}
                      />
                    </VStack>
                  </Box>
                </motion.div>
              )}
            </VStack>
          </GridItem>

          <GridItem>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Box
                bg={cardBg}
                p={6}
                borderRadius="2xl"
                shadow="xl"
                border="1px solid"
                borderColor={cardBorderColor}
                backdropFilter="blur(10px)"
                height="fit-content"
              >
                <VStack spacing={4} align="start">
                  <HStack>
                    <Icon as={FaTrophy} color="gold.500" />
                    <Text fontSize="lg" fontWeight="bold">Puntuaciones</Text>
                  </HStack>
                  <Puntajes refreshTrigger={refreshRuleta} />
                </VStack>
              </Box>
            </motion.div>
          </GridItem>
        </Grid>
      )}

      <ModalPreguntaAuto
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pregunta={currentPregunta}
        onRespuesta={handleRespuesta}
        modoMultiJugador={modoMultiJugador}
        jugadorActual={jugadorActual}
      />
    </Box>
  );
};

export default Autoevaluacion;