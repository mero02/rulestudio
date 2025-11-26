# Ruleta de Preguntas

Este proyecto es una aplicación web que implementa un juego de ruleta interactiva para preguntas de verdadero o falso. La idea surgió de querer crear una herramienta divertida para eventos o clases donde se puedan cargar preguntas desde un archivo CSV y jugar girando una ruleta para seleccionar preguntas al azar.

## Funcionalidades Principales

- **Carga de Preguntas**: Sube un archivo CSV con preguntas en formato específico (número. frase,"VERDADERO/FALSO") para poblar la base de datos.
- **Ruleta Interactiva**: Una ruleta visual que gira y selecciona una pregunta aleatoria entre las no respondidas.
- **Respuestas**: Modal que muestra la pregunta y opciones de verdadero/falso. Solo se marca como respondida si aciertas.
- **Estadísticas**: Muestra el total de preguntas, respondidas y activas.
- **Historial**: Lista de preguntas ya respondidas con sus respuestas correctas.
- **Reinicio**: Opción para resetear todas las preguntas a no respondidas.

## Tecnologías Usadas

- **Backend**: FastAPI con SQLAlchemy y SQLite para la API REST.
- **Frontend**: React con Vite, usando componentes como react-custom-roulette para la ruleta.
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

El archivo CSV debe tener el siguiente formato (sin header):
```
"1. ¿Las vacas tienen 4 estomagos?","VERDADERO. porque son rumentes"
"2. ¿Los peces vuelan?","FALSO. no tienen alas"
```

Cada línea: `"número. pregunta","VERDADERO/FALSO. respuesta"`

## Mejoras Futuras

- **Tipos de Preguntas**: Extender a preguntas de opción múltiple o abiertas.
- **Puntuación y Rankings**: Sistema de puntos, vidas o leaderboard.
- **Sonidos y Animaciones**: Mejorar UX con más sonidos o animaciones en la ruleta.
