# Ruleta de Preguntas

Este proyecto es una aplicación web que implementa un juego de ruleta interactiva con dos modos de juego: **Clásico** (verdadero/falso) y **Autoevaluación**. La idea surgió de querer crear una herramienta divertida para eventos o clases donde se puedan cargar preguntas desde un archivo CSV y jugar girando una ruleta para seleccionar preguntas al azar.

## Funcionalidades Principales

### Modo Clásico
- **Carga de Preguntas**: Sube un archivo CSV con preguntas verdadero/falso.
- **Ruleta Interactiva**: Una ruleta visual que gira y selecciona una pregunta aleatoria entre las no respondidas.
- **Respuestas**: Modal que muestra la pregunta y opciones de verdadero/falso. Solo se marca como respondida si aciertas.
- **Estadísticas**: Muestra el total de preguntas, respondidas y activas.
- **Historial**: Lista de preguntas ya respondidas con sus respuestas correctas.
- **Reinicio**: Opción para resetear todas las preguntas a no respondidas.
- **Gestión de Base de Datos**: Modal inteligente que detecta preguntas existentes y permite elegir entre borrar/agregar o solo agregar.

### Modo Autoevaluación
- **Carga de Preguntas**: Sube un archivo CSV con preguntas abiertas.
- **Ruleta Interactiva**: Gira y selecciona preguntas al azar.
- **Autoevaluación**: Después de responder, eliges "Respondí bien" (descarta) o "Respondí mal" (permanece activa).
- **Estadísticas**: Conteo de evaluaciones bien/mal.
- **Historial**: Lista de preguntas evaluadas como bien.
- **Gestión de Base de Datos**: Modal inteligente que detecta preguntas existentes y permite elegir entre borrar/agregar o solo agregar.

## Tecnologías Usadas

- **Backend**: FastAPI con SQLAlchemy y PostgreSQL para la API REST.
- **Frontend**: React con Vite, Chakra UI, Zustand, usando componentes como react-custom-roulette para la ruleta.
- **Contenedorización**: Docker y Docker Compose para facilitar el despliegue.

## Cómo Levantarlo

Asegúrate de tener Docker y Docker Compose instalados. Luego:

1. Clona el repositorio.
2. En la raíz del proyecto, ejecuta:
   ```bash
   docker-compose up --build
   ```
3. El backend estará en `http://localhost:8000` y el frontend en `http://localhost:5173`.

La aplicación se conecta automáticamente entre frontend y backend a través de la configuración de CORS.

## Estructura del Proyecto

- `backend/`: API en Python con FastAPI.
- `frontend/`: Interfaz en React.
- `docker-compose.yml`: Configuración para levantar ambos servicios.

## Formato del CSV

### Modo Clásico (Verdadero/Falso)
El archivo CSV debe tener el siguiente formato (sin header):
```
pregunta,respuesta
¿Las vacas tienen 4 estómagos?,VERDADERO. porque son rumiantes
¿Los peces vuelan?,FALSO. no tienen alas
```

Cada línea: `pregunta,VERDADERO/FALSO. respuesta`

### Modo Autoevaluación
El archivo CSV debe tener el siguiente formato (sin header):
```
pregunta,respuesta
¿Cuál es la capital de Francia?,París
¿Cuánto es 2+2?,4
```

Cada línea: `pregunta,respuesta`

## Mejoras Futuras

- **Tipos de Preguntas**: Extender a preguntas de opción múltiple o abiertas.
- **Puntuación y Rankings**: Sistema de puntos, vidas o leaderboard.
- **Sonidos y Animaciones**: Mejorar UX con más sonidos o animaciones en la ruleta.
