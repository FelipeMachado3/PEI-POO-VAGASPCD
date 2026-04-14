## API PCD

API REST em Node.js (Express) com persistencia em PostgreSQL.

## Requisitos

- Node.js
- PostgreSQL
- Tabelas no banco (exemplos usados nas queries do codigo):
  - `pessoas_pcd`
  - `contatos`
  - `deficiencias`
  - `habilidades`
  - `formacoes`
  - `experiencias`
  - `preferencias_trabalho`

## Instalacao

1. Instale dependencias:
   - `npm install`

2. Crie um arquivo `.env` na raiz do projeto com as variaveis abaixo:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

> Dica: o `.env` nao deve ser enviado ao GitHub.

## Rodando localmente

- `npm start` (se existir no seu package.json) ou, como neste projeto a aplicacao inicia direto:
- `node index.js`

O servidor sobe em:
- `http://localhost:3000`

## Endpoints

### Teste

- `GET /`
  - Retorna `{ "mensagem": "API PCD funcionando!" }`

### Cadastro e dados pessoais

- `POST /cadastro`
  - Body:
    - `nome` (obrigatorio)
    - `cpf` (obrigatorio)
    - `data_nasc` (opcional)
    - `email` (opcional)
    - `whatsapp` (obrigatorio)
    - `cidade` (opcional)
    - `estado` (opcional)
  - Respostas:
    - `201` cadastro realizado (`id` gerado)
    - `409` CPF ja cadastrado

### Deficiencias

- `POST /deficiencia`
  - Body: `pessoa_id` (obrigatorio), `cid_codigo` (obrigatorio), `descricao`, `grau`, `laudo_url`
  - Resposta: `201` com `id`

- `GET /deficiencia/:pessoa_id`
  - Retorna array com as deficiencias da pessoa

### Habilidades

- `POST /habilidade`
  - Body: `pessoa_id` (obrigatorio), `nome` (obrigatorio), `nivel` (opcional)

- `GET /habilidade/:pessoa_id`
  - Retorna array com as habilidades da pessoa

### Formacao

- `POST /formacao`
  - Body: `pessoa_id` (obrigatorio), `nivel`, `curso`, `instituicao`, `ano_conclusao`, `em_andamento`

### Experiencia

- `POST /experiencia`
  - Body: `pessoa_id` (obrigatorio), `cargo` (obrigatorio), `empresa`, `area`, `data_inicio`, `data_fim`, `descricao`

### Preferencias de trabalho

- `POST /preferencias`
  - Body:
    - `pessoa_id` (obrigatorio)
    - `area_interesse`
    - `regime_preferido`
    - `modalidade`
    - `salario_minimo`
    - `salario_maximo`
    - `disponibilidade`

> Este endpoint usa `ON CONFLICT (pessoa_id) DO UPDATE` para criar ou atualizar.

### Consultas

- `GET /pessoas`
  - Retorna lista de pessoas com `contatos` e algumas preferencias de trabalho

- `GET /pessoa/:id`
  - Retorna perfil completo, incluindo:
    - `deficiencias`
    - `habilidades`
    - `formacoes`
    - `experiencias`
    - `preferencias` (ou `null`)

## Observacoes

- O codigo usa `pg` com `Pool` e as queries assumem que as colunas existem conforme os nomes usados nas queries.
- Se quiser, posso gerar um script SQL (DDL) de exemplo baseado nas tabelas/colunas esperadas pelo codigo.

