from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
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

class Jugador(Base):
    __tablename__ = "jugadores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    puntaje = Column(Integer, default=0)
    consecutivas = Column(Integer, default=0)  # Respuestas correctas consecutivas
    created_at = Column(DateTime, default=datetime.utcnow)

class PreguntaJugador(Base):
    __tablename__ = "preguntas_jugadores"

    id = Column(Integer, primary_key=True, index=True)
    jugador_id = Column(Integer, ForeignKey("jugadores.id"), nullable=False)
    pregunta_id = Column(Integer, ForeignKey("preguntas_autoevaluacion.id"), nullable=False)
    respondida = Column(Boolean, default=False)

    jugador = relationship("Jugador")
    pregunta = relationship("PreguntaAutoevaluacion")