from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PreguntaAutoevaluacion
from pydantic import BaseModel
import csv
import io

router = APIRouter()

class ResponderAutoevaluacionRequest(BaseModel):
    id: int
    evaluacion: str  # "bien" o "mal"

@router.post("/importar_csv")
def importar_csv_autoevaluacion(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="El archivo debe ser un CSV")

    content = file.file.read()
    text_content = content.decode('utf-8')
    csv_reader = csv.reader(io.StringIO(text_content))
    preguntas = []
    chunk_size = 100  # Procesar en chunks de 100

    for i, row in enumerate(csv_reader):
        if i == 0:  # Saltar header si existe
            continue
        if not row or len(row) < 2:
            continue

        # Formato simple: pregunta,respuesta
        pregunta_texto = row[0].strip()
        respuesta_texto = row[1].strip()

        if not pregunta_texto or not respuesta_texto:
            continue

        pregunta = PreguntaAutoevaluacion(
            frase=pregunta_texto,
            respuesta=respuesta_texto
        )
        preguntas.append(pregunta)

        # Procesar en chunks
        if len(preguntas) >= chunk_size:
            db.add_all(preguntas)
            db.commit()
            preguntas = []  # Reset para siguiente chunk

    # Procesar último chunk
    if preguntas:
        db.add_all(preguntas)
        db.commit()

    return {"message": "Preguntas de autoevaluación importadas exitosamente"}

@router.get("/preguntas/activas")
def get_preguntas_activas_autoevaluacion(db: Session = Depends(get_db)):
    preguntas = db.query(PreguntaAutoevaluacion.id).filter(PreguntaAutoevaluacion.respondida == False).all()
    ids = [p.id for p in preguntas]
    return {"activas": ids}

@router.get("/preguntas/respondidas")
def get_preguntas_respondidas_autoevaluacion(db: Session = Depends(get_db)):
    preguntas = db.query(PreguntaAutoevaluacion.frase, PreguntaAutoevaluacion.respuesta).filter(PreguntaAutoevaluacion.respondida == True).all()
    return {"respondidas": [{"frase": p.frase, "respuesta": p.respuesta} for p in preguntas]}

@router.get("/preguntas/{pregunta_id}")
def get_pregunta_autoevaluacion(pregunta_id: int, db: Session = Depends(get_db)):
    pregunta = db.query(PreguntaAutoevaluacion).filter(PreguntaAutoevaluacion.id == pregunta_id).first()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    if pregunta.respondida:
        raise HTTPException(status_code=400, detail="Pregunta ya respondida")

    return {
        "id": pregunta.id,
        "frase": pregunta.frase,
        "respuesta": pregunta.respuesta
    }

@router.post("/preguntas/responder")
def responder_pregunta_autoevaluacion(data: ResponderAutoevaluacionRequest, db: Session = Depends(get_db)):
    pregunta_id = data.id
    evaluacion = data.evaluacion.lower()

    if evaluacion not in ["bien", "mal"]:
        raise HTTPException(status_code=400, detail="Evaluación debe ser 'bien' o 'mal'")

    pregunta = db.query(PreguntaAutoevaluacion).filter(PreguntaAutoevaluacion.id == pregunta_id).first()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    if pregunta.respondida:
        raise HTTPException(status_code=400, detail="Pregunta ya respondida")

    # Solo marcar como respondida si evaluó como "bien"
    if evaluacion == "bien":
        pregunta.respondida = True
        db.commit()

    return {"evaluacion": evaluacion, "respondida": pregunta.respondida, "respuesta_correcta": pregunta.respuesta}

@router.post("/reiniciar_preguntas")
def reiniciar_preguntas_autoevaluacion(db: Session = Depends(get_db)):
    db.query(PreguntaAutoevaluacion).update({"respondida": False})
    db.commit()
    return {"message": "Todas las preguntas de autoevaluación han sido reiniciadas"}

@router.delete("/eliminar_todas_preguntas")
def eliminar_todas_preguntas_autoevaluacion(db: Session = Depends(get_db)):
    count = db.query(PreguntaAutoevaluacion).delete()
    db.commit()
    return {"message": f"Se eliminaron {count} preguntas de autoevaluación"}

@router.get("/contar_preguntas")
def contar_preguntas_autoevaluacion(db: Session = Depends(get_db)):
    total = db.query(PreguntaAutoevaluacion).count()
    activas = db.query(PreguntaAutoevaluacion).filter(PreguntaAutoevaluacion.respondida == False).count()
    respondidas = db.query(PreguntaAutoevaluacion).filter(PreguntaAutoevaluacion.respondida == True).count()
    return {"total": total, "activas": activas, "respondidas": respondidas}