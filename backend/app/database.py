from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# URL de la base de datos PostgreSQL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db/preguntas_db")

# Crear el engine con pool de conexiones
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=10,  # Número de conexiones en el pool
    max_overflow=20,  # Conexiones adicionales permitidas
    pool_pre_ping=True,  # Verificar conexión antes de usar
)

# Crear SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

# Función para obtener una sesión de DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()