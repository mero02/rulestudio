# Backend Ruleta de Preguntas - FastAPI

Este es el backend de la aplicación "Ruleta de Preguntas", construido con FastAPI y SQLite.

## Ejecutar con Docker

1. Construir la imagen:
   ```
   docker build -t ruleta-backend .
   ```

2. Ejecutar el contenedor:
   ```
   docker run -p 8000:8000 ruleta-backend
   ```

La API estará disponible en http://localhost:8000.

## Documentación API

Visita http://localhost:8000/docs para la documentación interactiva de Swagger.

## Endpoints

- `POST /api/importar_csv`: Importar preguntas desde un archivo CSV con columnas: frase, respuesta (IDs asignados automáticamente).
- `GET /api/preguntas/activas`: Obtener IDs de preguntas no respondidas.
- `GET /api/preguntas/{id}`: Obtener detalles de una pregunta específica (frase y opciones: VERDADERO, FALSO, NO SE).
- `POST /api/preguntas/responder`: Enviar respuesta a una pregunta (JSON: {"id": int, "respuesta": string}).

## Testing

Para ejecutar pruebas:
```
docker run ruleta-backend pytest tests/