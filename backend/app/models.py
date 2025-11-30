from sqlalchemy import Column, Integer, String, Boolean
from .database import Base

class Pregunta(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    frase = Column(String, nullable=False)
    respuesta = Column(String, nullable=False)
    verdadero = Column(Boolean, nullable=False)
    respondida = Column(Boolean, default=False, index=True)

class PreguntaAutoevaluacion(Base):
    __tablename__ = "preguntas_autoevaluacion"

    id = Column(Integer, primary_key=True, index=True)
    frase = Column(String, nullable=False)
    respuesta = Column(String, nullable=False)
    respondida = Column(Boolean, default=False, index=True)