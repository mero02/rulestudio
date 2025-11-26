import { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Text } from '@chakra-ui/react';
import axios from 'axios';

const PreguntasRespondidas = ({ refresh }) => {
  const [preguntas, setPreguntas] = useState([]);

  useEffect(() => {
    fetchPreguntasRespondidas();
  }, [refresh]);

  const fetchPreguntasRespondidas = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/preguntas/respondidas');
      setPreguntas(response.data.respondidas);
    } catch (error) {
      console.error('Error fetching preguntas respondidas', error);
    }
  };

  return (
    <Box mt={2}>
      <Text fontSize="xl" mb={0}>Preguntas Respondidas Correctamente</Text>
      {preguntas.length > 0 ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Pregunta</Th>
              <Th>Respuesta</Th>
            </Tr>
          </Thead>
          <Tbody>
            {preguntas.map((p, index) => (
              <Tr key={index}>
                <Td>{p.frase}</Td>
                <Td>{p.respuesta}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>No hay preguntas respondidas aún.</Text>
      )}
    </Box>
  );
};

export default PreguntasRespondidas;