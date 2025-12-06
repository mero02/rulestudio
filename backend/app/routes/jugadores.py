from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Jugador, PreguntaJugador, PreguntaAutoevaluacion
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter()

class CrearJugadorRequest(BaseModel):
    nombre: str

class ResponderPreguntaRequest(BaseModel):
    evaluacion: str  # "bien" o "mal"

class EstadoJuego(BaseModel):
    jugadores: List[dict]
    turno_actual: Optional[int] = None
    cola_pendientes: List[int] = []

# Estado del juego en memoria (para simplificar, en producción usar Redis o DB)
estado_juego = EstadoJuego(jugadores=[], turno_actual=None, cola_pendientes=[])

@router.post("/")
def crear_jugador(data: CrearJugadorRequest, db: Session = Depends(get_db)):
    if not data.nombre.strip():
        raise HTTPException(status_code=400, detail="Nombre no puede estar vacío")

    # Verificar si ya existe
    existente = db.query(Jugador).filter(Jugador.nombre == data.nombre.strip()).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un jugador con ese nombre")

    jugador = Jugador(nombre=data.nombre.strip())
    db.add(jugador)
    db.commit()
    db.refresh(jugador)

    # Actualizar estado en memoria
    estado_juego.jugadores.append({
        "id": jugador.id,
        "nombre": jugador.nombre,
        "puntaje": jugador.puntaje,
        "consecutivas": jugador.consecutivas
    })

    return {
        "id": jugador.id,
        "nombre": jugador.nombre,
        "puntaje": jugador.puntaje,
        "consecutivas": jugador.consecutivas
    }

@router.get("/")
def listar_jugadores(db: Session = Depends(get_db)):
    jugadores = db.query(Jugador).all()
    return [{
        "id": j.id,
        "nombre": j.nombre,
        "puntaje": j.puntaje,
        "consecutivas": j.consecutivas
    } for j in jugadores]

@router.delete("/{jugador_id}")
def eliminar_jugador(jugador_id: int, db: Session = Depends(get_db)):
    jugador = db.query(Jugador).filter(Jugador.id == jugador_id).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")

    # Eliminar preguntas asignadas
    db.query(PreguntaJugador).filter(PreguntaJugador.jugador_id == jugador_id).delete()

    db.delete(jugador)
    db.commit()

    # Actualizar estado en memoria
    estado_juego.jugadores = [j for j in estado_juego.jugadores if j["id"] != jugador_id]
    if estado_juego.turno_actual == jugador_id:
        estado_juego.turno_actual = None
    estado_juego.cola_pendientes = [id for id in estado_juego.cola_pendientes if id != jugador_id]

    return {"message": "Jugador eliminado"}

@router.get("/{jugador_id}")
def obtener_jugador(jugador_id: int, db: Session = Depends(get_db)):
    jugador = db.query(Jugador).filter(Jugador.id == jugador_id).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")

    return {
        "id": jugador.id,
        "nombre": jugador.nombre,
        "puntaje": jugador.puntaje,
        "consecutivas": jugador.consecutivas
    }

@router.post("/juego/iniciar")
def iniciar_juego(db: Session = Depends(get_db)):
    jugadores = db.query(Jugador).all()
    if len(jugadores) < 2:
        raise HTTPException(status_code=400, detail="Se necesitan al menos 2 jugadores")

    preguntas_activas = db.query(PreguntaAutoevaluacion).filter(PreguntaAutoevaluacion.respondida == False).all()
    if not preguntas_activas:
        raise HTTPException(status_code=400, detail="No hay preguntas activas")

    # Limpiar asignaciones anteriores
    db.query(PreguntaJugador).delete()

    # Asignar preguntas aleatoriamente a jugadores
    num_jugadores = len(jugadores)
    preguntas_por_jugador = len(preguntas_activas) // num_jugadores
    resto = len(preguntas_activas) % num_jugadores

    random.shuffle(preguntas_activas)

    idx = 0
    for i, jugador in enumerate(jugadores):
        num_preguntas = preguntas_por_jugador + (1 if i < resto else 0)
        for j in range(num_preguntas):
            pregunta_jugador = PreguntaJugador(
                jugador_id=jugador.id,
                pregunta_id=preguntas_activas[idx].id
            )
            db.add(pregunta_jugador)
            idx += 1

    # Resetear puntajes y consecutivas
    for jugador in jugadores:
        jugador.puntaje = 0
        jugador.consecutivas = 0

    db.commit()

    # Inicializar estado del juego
    estado_juego.jugadores = [{
        "id": j.id,
        "nombre": j.nombre,
        "puntaje": 0,
        "consecutivas": 0
    } for j in jugadores]
    estado_juego.cola_pendientes = [j.id for j in jugadores]
    estado_juego.turno_actual = None

    return {"message": "Juego iniciado", "jugadores": len(jugadores), "preguntas_asignadas": len(preguntas_activas)}

@router.get("/juego/estado")
def obtener_estado_juego():
    return {
        "jugadores": estado_juego.jugadores,
        "turno_actual": estado_juego.turno_actual,
        "cola_pendientes": estado_juego.cola_pendientes
    }

@router.post("/juego/seleccionar_jugador")
def seleccionar_jugador():
    if not estado_juego.cola_pendientes:
        raise HTTPException(status_code=400, detail="No hay jugadores pendientes")

    # Seleccionar aleatoriamente
    jugador_id = random.choice(estado_juego.cola_pendientes)
    estado_juego.cola_pendientes.remove(jugador_id)
    estado_juego.turno_actual = jugador_id

    # Si cola vacía, resetear con todos los jugadores
    if not estado_juego.cola_pendientes:
        estado_juego.cola_pendientes = [j["id"] for j in estado_juego.jugadores]

    return {"jugador_seleccionado": jugador_id}

@router.post("/juego/reiniciar")
def reiniciar_juego(db: Session = Depends(get_db)):
    # Resetear preguntas de jugadores
    db.query(PreguntaJugador).update({"respondida": False})

    # Resetear puntajes
    db.query(Jugador).update({"puntaje": 0, "consecutivas": 0})
    db.commit()

    # Resetear estado
    estado_juego.turno_actual = None
    estado_juego.cola_pendientes = [j["id"] for j in estado_juego.jugadores]
    for j in estado_juego.jugadores:
        j["puntaje"] = 0
        j["consecutivas"] = 0

    return {"message": "Juego reiniciado"}

@router.get("/{jugador_id}/preguntas/activas")
def get_preguntas_activas_jugador(jugador_id: int, db: Session = Depends(get_db)):
    preguntas = db.query(PreguntaAutoevaluacion.id).join(PreguntaJugador).filter(
        PreguntaJugador.jugador_id == jugador_id,
        PreguntaJugador.respondida == False
    ).all()

    ids = [p.id for p in preguntas]
    return {"activas": ids}

@router.post("/{jugador_id}/preguntas/{pregunta_id}/responder")
def responder_pregunta_jugador(jugador_id: int, pregunta_id: int, data: ResponderPreguntaRequest, db: Session = Depends(get_db)):
    evaluacion = data.evaluacion.lower()
    if evaluacion not in ["bien", "mal"]:
        raise HTTPException(status_code=400, detail="Evaluación debe ser 'bien' o 'mal'")

    # Verificar que la pregunta pertenece al jugador
    pregunta_jugador = db.query(PreguntaJugador).filter(
        PreguntaJugador.jugador_id == jugador_id,
        PreguntaJugador.pregunta_id == pregunta_id
    ).first()
    if not pregunta_jugador:
        raise HTTPException(status_code=404, detail="Pregunta no asignada a este jugador")
    if pregunta_jugador.respondida:
        raise HTTPException(status_code=400, detail="Pregunta ya respondida")

    # Obtener pregunta completa
    pregunta = db.query(PreguntaAutoevaluacion).filter(PreguntaAutoevaluacion.id == pregunta_id).first()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")

    # Obtener jugador
    jugador = db.query(Jugador).filter(Jugador.id == jugador_id).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")

    # Calcular puntaje
    puntos_ganados = 0
    if evaluacion == "bien":
        puntos_ganados = 1 + jugador.consecutivas  # Bono por consecutivas
        jugador.puntaje += puntos_ganados
        jugador.consecutivas += 1
        pregunta_jugador.respondida = True
    else:
        if jugador.puntaje > 0:
            jugador.puntaje -= 1
        jugador.consecutivas = 0
        # Pregunta permanece activa

    db.commit()

    # Actualizar estado en memoria
    for j in estado_juego.jugadores:
        if j["id"] == jugador_id:
            j["puntaje"] = jugador.puntaje
            j["consecutivas"] = jugador.consecutivas
            break

    return {
        "evaluacion": evaluacion,
        "puntos_ganados": puntos_ganados if evaluacion == "bien" else -1 if jugador.puntaje > 0 else 0,
        "puntaje_total": jugador.puntaje,
        "consecutivas": jugador.consecutivas,
        "respondida": pregunta_jugador.respondida,
        "respuesta_correcta": pregunta.respuesta
    }