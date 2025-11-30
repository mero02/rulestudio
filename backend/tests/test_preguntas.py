from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base, engine
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest

# Configuración de base de datos de prueba
TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

def test_importar_csv(setup_database):
    csv_content = "pregunta,respuesta\n¿Cuál es la capital de Francia?,VERDADERO. París es la capital\n¿Cuál es la capital de España?,FALSO. Madrid es la capital\n"
    response = client.post("/api/importar_csv", files={"file": ("test.csv", csv_content, "text/csv")})
    assert response.status_code == 200
    assert "Preguntas importadas exitosamente" in response.json()["message"]

def test_get_preguntas_activas(setup_database):
    response = client.get("/api/preguntas/activas")
    assert response.status_code == 200
    assert "activas" in response.json()

def test_get_pregunta(setup_database):
    response = client.get("/api/preguntas/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert "opciones" in data

def test_responder_pregunta_correcta(setup_database):
    response = client.post("/api/preguntas/responder", json={"id": 1, "respuesta": "VERDADERO"})
    assert response.status_code == 200
    assert response.json()["correcto"] == True

def test_responder_pregunta_incorrecta(setup_database):
    # Importar otra pregunta
    csv_content = "pregunta,respuesta\n¿Cuál es la capital de Italia?,FALSO. Roma es la capital\n"
    client.post("/api/importar_csv", files={"file": ("test2.csv", csv_content, "text/csv")})

    response = client.post("/api/preguntas/responder", json={"id": 2, "respuesta": "VERDADERO"})
    assert response.status_code == 200
    assert response.json()["correcto"] == False

# Tests para autoevaluación
def test_importar_csv_autoevaluacion(setup_database):
    csv_content = "pregunta,respuesta\n¿Cuál es la capital de Francia?,París\n¿Cuál es la capital de España?,Madrid\n"
    response = client.post("/api/autoevaluacion/importar_csv", files={"file": ("test.csv", csv_content, "text/csv")})
    assert response.status_code == 200
    assert "Preguntas de autoevaluación importadas exitosamente" in response.json()["message"]

def test_get_preguntas_activas_autoevaluacion(setup_database):
    response = client.get("/api/autoevaluacion/preguntas/activas")
    assert response.status_code == 200
    assert "activas" in response.json()

def test_get_pregunta_autoevaluacion(setup_database):
    response = client.get("/api/autoevaluacion/preguntas/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert "frase" in data
    assert "respuesta" in data
    assert "opciones" not in data  # No debe tener opciones en autoevaluación

def test_responder_pregunta_bien_autoevaluacion(setup_database):
    response = client.post("/api/autoevaluacion/preguntas/responder", json={"id": 1, "evaluacion": "bien"})
    assert response.status_code == 200
    assert response.json()["evaluacion"] == "bien"
    assert response.json()["respondida"] == True

def test_responder_pregunta_mal_autoevaluacion(setup_database):
    response = client.post("/api/autoevaluacion/preguntas/responder", json={"id": 2, "evaluacion": "mal"})
    assert response.status_code == 200
    assert response.json()["evaluacion"] == "mal"
    assert response.json()["respondida"] == False  # No se marca como respondida