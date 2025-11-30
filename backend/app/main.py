from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import preguntas
from .routes import autoevaluacion

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ruleta de Preguntas API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Origen del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas
app.include_router(preguntas.router, prefix="/api", tags=["preguntas"])
app.include_router(autoevaluacion.router, prefix="/api/autoevaluacion", tags=["autoevaluacion"])

@app.get("/")
def read_root():
    return {"message": "API de Ruleta de Preguntas"}