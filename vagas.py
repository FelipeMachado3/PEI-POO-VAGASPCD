import requests
import os
import psycopg2
from dotenv import load_dotenv

# Carrega variáveis do .env
load_dotenv()
APP_ID = os.getenv("APP_ID")
APP_KEY = os.getenv("APP_KEY")

# Configuração do banco (coloque no seu .env também)
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

print("APP_ID:", APP_ID)
print("APP_KEY:", APP_KEY)
print("DB_HOST:", DB_HOST)
print("DB_NAME:", DB_NAME)
print("DB_USER:", DB_USER)
print("DB_PASSWORD:", DB_PASSWORD)


url_base = "https://api.adzuna.com/v1/api/jobs/br/search/"
params_base = {
    "app_id": APP_ID,
    "app_key": APP_KEY,
    "where": "Espírito Santo",
    "results_per_page": 50,
    "sort_by": "date"
}

pcd_vagas = []
page = 1

while len(pcd_vagas) < 10:
    print(f"Buscando página {page}...")
    response = requests.get(url_base + str(page), params=params_base)
    data = response.json()

    if "results" not in data or not data["results"]:
        print("Não há mais resultados disponíveis.")
        break

    for vaga in data["results"]:
        descricao = vaga.get("description", "").lower()
        titulo = vaga.get("title", "").lower()

        if any(palavra in descricao or palavra in titulo for palavra in ["pcd", "deficiência", "inclusiva", "portadores de deficiência"]):
            pcd_vagas.append({
                "titulo": vaga.get("title"),
                "empresa": vaga.get("company", {}).get("display_name"),
                "local": vaga.get("location", {}).get("display_name"),
                "salario_min": vaga.get("salary_min"),
                "salario_max": vaga.get("salary_max"),
                "data_publicacao": vaga.get("created"),
                "url_vaga": vaga.get("redirect_url"),
                "pcd_exclusiva": True
            })
            if len(pcd_vagas) >= 10:
                break

    page += 1

# Conecta ao banco e insere os dados
conn = psycopg2.connect(
    host=DB_HOST,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD
)
cur = conn.cursor()

for vaga in pcd_vagas:
    cur.execute("""
        INSERT INTO vagas_cache (titulo, empresa, area, salario_min, salario_max, recebida_em, url_vaga, pcd_exclusiva)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        vaga["titulo"],
        vaga["empresa"],
        vaga["local"],
        vaga["salario_min"],
        vaga["salario_max"],
        vaga["data_publicacao"],
        vaga["url_vaga"],
        vaga["pcd_exclusiva"]
    ))

conn.commit()
cur.close()
conn.close()

print(f"Foram inseridas {len(pcd_vagas)} vagas PCD no banco de dados.")
