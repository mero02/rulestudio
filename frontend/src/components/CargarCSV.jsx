import { useState } from 'react';
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';
import axios from 'axios';

const CargarCSV = ({ onCargar }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8000/api/importar_csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('CSV importado exitosamente');
      onCargar(); // Refrescar preguntas activas
    } catch (error) {
      alert('Error al importar CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="bold">Cargar archivo CSV con preguntas</Text>
      <Input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        size="md"
      />
      <Button
        onClick={handleUpload}
        isDisabled={loading}
        colorScheme="brand"
        isLoading={loading}
        loadingText="Importando..."
      >
        Importar CSV
      </Button>
    </VStack>
  );
};

export default CargarCSV;