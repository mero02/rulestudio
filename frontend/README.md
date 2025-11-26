# Frontend Ruleta de Preguntas - React + Vite

Este es el frontend de la aplicación "Ruleta de Preguntas", construido con React, Vite y Chakra UI.

## Ejecutar localmente

1. Instalar dependencias:
   ```
   npm install
   ```

2. Ejecutar en modo desarrollo:
   ```
   npm run dev
   ```

La aplicación estará disponible en http://localhost:5173.

## Ejecutar con Docker

1. Construir la imagen:
   ```
   docker build -t ruleta-frontend .
   ```

2. Ejecutar el contenedor:
   ```
   docker run -p 5173:5173 ruleta-frontend
   ```

## Componentes

- **CargarCSV**: Para importar preguntas desde un archivo CSV.
- **Ruleta**: Muestra la ruleta con IDs de preguntas activas.
- **ModalPregunta**: Modal con la pregunta y opciones de respuesta.
- **Estadisticas**: Muestra estadísticas de respuestas.

## Estado

Gestionado con Zustand para preguntas activas, pregunta actual y estadísticas.
