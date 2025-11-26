from fastapi.testclient import TestClient
from ..app.main import app
from ..app.database import get_db, Base, engine
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
    csv_content = "id,frase,respuesta\n1,¿Cuál es la capital de Francia?,París\n"
    response = client.post("/api/importar_csv", files={"file": ("test.csv", csv_content, "text/csv")})
    assert response.status_code == 200
    assert "1 preguntas importadas" in response.json()["message"]

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
    response = client.post("/api/preguntas/responder", json={"id": 1, "respuesta": "París"})
    assert response.status_code == 200
    assert response.json()["correcto"] == True

def test_responder_pregunta_incorrecta(setup_database):
    # Importar otra pregunta
    csv_content = "id,frase,respuesta\n2,¿Cuál es la capital de España?,Madrid\n"
    client.post("/api/importar_csv", files={"file": ("test2.csv", csv_content, "text/csv")})

    response = client.post("/api/preguntas/responder", json={"id": 2, "respuesta": "Barcelona"})
    assert response.status_code == 200
    assert response.json()["correcto"] == False