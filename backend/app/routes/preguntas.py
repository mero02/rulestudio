from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Pregunta
from pydantic import BaseModel
import csv
import io

router = APIRouter()

class ResponderPreguntaRequest(BaseModel):
    id: int
    respuesta: str

@router.post("/importar_csv")
def importar_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="El archivo debe ser un CSV")

    content = file.file.read()
    text_content = content.decode('utf-8')
    csv_reader = csv.reader(io.StringIO(text_content))
    preguntas = []
    chunk_size = 100  # Procesar en chunks de 100

    for i, row in enumerate(csv_reader):
        if i == 0:  # Saltar header
            continue
        if not row or len(row) < 2:
            continue

        # Asumir formato: "número. frase","respuesta"
        line = ','.join(row)
        print(f"Procesando línea {i}: {line}")
        if '"' in line:
            parts = line.split('","')
            if len(parts) == 2:
                num_frase = parts[0].strip('"')
                respuesta = parts[1].strip('"')
                print(f"Partes: num_frase={num_frase}, respuesta={respuesta}")
                # Extraer número y frase
                if '. ' in num_frase:
                    num, frase = num_frase.split('. ', 1)
                    id_valor = int(num)
                    print(f"ID: {id_valor}, Frase: {frase}")
                else:
                    print("No tiene '. '")
                    continue
            else:
                print("No tiene 2 partes")
                continue
        else:
            print("No tiene comillas")
            continue

        primera_palabra = respuesta.split()[0].upper().rstrip('.')
        if primera_palabra not in ['VERDADERO', 'FALSO']:
            raise HTTPException(status_code=400, detail=f"Respuesta inválida en línea {i+1}: {line}")

        es_verdadero = primera_palabra == 'VERDADERO'
        pregunta = Pregunta(
            id=id_valor,
            frase=frase,
            respuesta=respuesta,
            verdadero=es_verdadero
        )
        preguntas.append(pregunta)
        print(f"Pregunta agregada: {pregunta.id}")

        # Procesar en chunks
        if len(preguntas) >= chunk_size:
            db.add_all(preguntas)
            db.commit()
            preguntas = []  # Reset para siguiente chunk

    # Procesar último chunk
    if preguntas:
        db.add_all(preguntas)
        db.commit()

    return {"message": "Preguntas importadas exitosamente"}

@router.get("/preguntas/activas")
def get_preguntas_activas(db: Session = Depends(get_db)):
    preguntas = db.query(Pregunta.id).filter(Pregunta.respondida == False).all()
    ids = [p.id for p in preguntas]
    return {"activas": ids}

@router.get("/preguntas/respondidas")
def get_preguntas_respondidas(db: Session = Depends(get_db)):
    preguntas = db.query(Pregunta.frase, Pregunta.respuesta).filter(Pregunta.respondida == True).all()
    return {"respondidas": [{"frase": p.frase, "respuesta": p.respuesta} for p in preguntas]}

@router.get("/preguntas/{pregunta_id}")
def get_pregunta(pregunta_id: int, db: Session = Depends(get_db)):
    pregunta = db.query(Pregunta).filter(Pregunta.id == pregunta_id).first()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    if pregunta.respondida:
        raise HTTPException(status_code=400, detail="Pregunta ya respondida")

    return {
        "id": pregunta.id,
        "frase": pregunta.frase,
        "opciones": ["VERDADERO", "FALSO"]
    }

@router.post("/preguntas/responder")
def responder_pregunta(data: ResponderPreguntaRequest, db: Session = Depends(get_db)):
    pregunta_id = data.id
    respuesta = data.respuesta

    pregunta = db.query(Pregunta).filter(Pregunta.id == pregunta_id).first()
    if not pregunta:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    if pregunta.respondida:
        raise HTTPException(status_code=400, detail="Pregunta ya respondida")

    # Verificar usando el booleano
    respuesta_usuario_limpia = respuesta.upper().rstrip('.')
    respuesta_usuario_bool = respuesta_usuario_limpia == 'VERDADERO'
    correcto = respuesta_usuario_bool == pregunta.verdadero
    if correcto:
        pregunta.respondida = True
    db.commit()  # Commit siempre para actualizar respondida si cambió

    return {"correcto": correcto, "respuesta_correcta": pregunta.respuesta}

@router.post("/reiniciar_preguntas")
def reiniciar_preguntas(db: Session = Depends(get_db)):
    db.query(Pregunta).update({"respondida": False})
    db.commit()
    return {"message": "Todas las preguntas han sido reiniciadas"}