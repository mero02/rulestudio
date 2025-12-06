import { useState } from 'react';
import { Box, Grid, GridItem, useColorModeValue, Button, HStack, Text, VStack, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
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
  // Estado del store para modo multi-jugador - MOVER AL PRINCIPIO
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
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} p={4}>
      <ThemeToggle />

      {/* Toggle de modo */}
      <Box textAlign="center" mb={6}>
        <HStack justify="center" spacing={4}>
          <Button
            colorScheme={!modoMultiJugador ? "blue" : "gray"}
            variant={!modoMultiJugador ? "solid" : "outline"}
            onClick={() => setModoMultiJugador(false)}
          >
            Modo Clásico
          </Button>
          <Button
            colorScheme={modoMultiJugador ? "green" : "gray"}
            variant={modoMultiJugador ? "solid" : "outline"}
            onClick={toggleModoMultiJugador}
          >
            Modo Multi-Jugador
          </Button>
        </HStack>
      </Box>

      {!modoMultiJugador ? (
        /* Modo Clásico */
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
      ) : (
        /* Modo Multi-Jugador */
        <Grid templateColumns={{ base: '1fr', md: '300px 400px 1fr' }} gap={6} alignItems="start">
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
              <GestionJugadores onJugadoresChange={handleJugadoresChange} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <VStack spacing={4} mt={6}>
                <Button
                  colorScheme="green"
                  onClick={iniciarJuego}
                  isDisabled={juegoIniciado}
                  width="100%"
                >
                  {juegoIniciado ? 'Juego Iniciado' : 'Iniciar Juego'}
                </Button>
                <Button
                  colorScheme="red"
                  variant="outline"
                  onClick={reiniciarJuego}
                  width="100%"
                >
                  Reiniciar Juego
                </Button>
              </VStack>
            </motion.div>
          </GridItem>

          <GridItem>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Box p={6} borderRadius="lg" shadow="md" mb={6}>
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
                  borderRadius="lg"
                  shadow="md"
                  border="3px solid"
                  borderColor="green.400"
                  bg="green.50"
                  _dark={{ bg: "green.900", borderColor: "green.300" }}
                >
                  <VStack spacing={4}>
                    <HStack spacing={3} justify="center">
                      <Text fontSize="lg" fontWeight="bold">
                        🎯 Turno de: {jugadorActual.nombre}
                      </Text>
                      <Badge colorScheme="green" variant="solid" fontSize="sm">
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
          </GridItem>

          <GridItem>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Puntajes refreshTrigger={refreshRuleta} />
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