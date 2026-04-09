import os
from twilio.rest import Client
import schedule
import time
from dotenv import load_dotenv

# Carregar variáveis do .env
load_dotenv()

# Pegar dados do .env
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
from_whatsapp = os.getenv("TWILIO_WHATSAPP_FROM")
to_whatsapp = os.getenv("TWILIO_WHATSAPP_TO")

# Criar cliente
client = Client(account_sid, auth_token)

def enviar():
    try:
        print("Tentando enviar...")

        message = client.messages.create(
            from_=from_whatsapp,
            body="""Lista oficial - LINE UP 21:30 :🐦‍⬛💜

🧤 GK
- Pdrzin 
- Miguel

⚓️ ZAGUEIROS
- Bigodz 
- Blackzao_ 
- mSe virgil 
- ygustinha 
- bandskkj 

🚧 MEIAS
- Dtr yemejota 
- LEOZINTHEGOAT 
- wHyunjinn 
- Mgzin_mt 
- GM 

🏹 ALAS
- WJapa7K 
- Lukinhas 
- Ousado30 
- Cadu 

🎯 ST
- Chinelli 
- Silva 

On hoje ✅
Off hoje ❌
""",
            to=to_whatsapp
        )

        print("Mensagem enviada:", message.sid)

    except Exception as e:
        print("ERRO:", e)


# schedule.every().day.at("07:00").do(enviar)

print("Bot rodando...")

# 🚀 TESTE IMEDIATO
enviar()

# 🔁 LOOP
while True:
    schedule.run_pending()
    time.sleep(1)