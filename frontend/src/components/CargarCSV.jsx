import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import axios from 'axios';

const CargarCSV = ({ onCargar }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingQuestions, setExistingQuestions] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const checkExistingQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/contar_preguntas');
      setExistingQuestions(response.data);
      if (response.data.total > 0) {
        onOpen(); // Mostrar modal si hay preguntas existentes
      } else {
        handleUpload(false); // Importar directamente si no hay preguntas
      }
    } catch (error) {
      console.error('Error checking existing questions', error);
      handleUpload(false); // Proceder de todas formas
    }
  };

  const handleUpload = async (clearExisting = false) => {
    if (!file) return;
    setLoading(true);

    if (clearExisting) {
      try {
        await axios.delete('http://localhost:8000/api/eliminar_todas_preguntas');
      } catch (error) {
        console.error('Error clearing existing questions', error);
      }
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8000/api/importar_csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('CSV importado exitosamente');
      onCargar(); // Refrescar preguntas activas
      onClose(); // Cerrar modal
    } catch (error) {
      alert('Error al importar CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    if (!file) return;
    checkExistingQuestions();
  };

  return (
    <>
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">Cargar archivo CSV con preguntas</Text>
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          size="md"
        />
        <Button
          onClick={handleImportClick}
          isDisabled={loading || !file}
          colorScheme="brand"
          isLoading={loading}
          loadingText="Importando..."
        >
          Importar CSV
        </Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preguntas existentes detectadas</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Alert status="info" mb={4}>
              <AlertIcon />
              Ya hay {existingQuestions?.total || 0} preguntas en la base de datos
              ({existingQuestions?.activas || 0} activas, {existingQuestions?.respondidas || 0} respondidas).
            </Alert>
            <Text mb={4}>¿Qué desea hacer con el nuevo archivo CSV?</Text>
            <VStack spacing={3}>
              <Button
                colorScheme="red"
                width="full"
                onClick={() => handleUpload(true)}
                isLoading={loading}
              >
                Borrar preguntas existentes y agregar nuevas
              </Button>
              <Button
                colorScheme="blue"
                width="full"
                onClick={() => handleUpload(false)}
                isLoading={loading}
              >
                Agregar preguntas nuevas (mantener existentes)
              </Button>
              <Button variant="ghost" width="full" onClick={onClose}>
                Cancelar
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CargarCSV;