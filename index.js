const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


//TESTE
app.get('/', (req, res) => {
  res.json({ mensagem: 'API PCD funcionando!' });
});


app.post('/cadastro', async (req, res) => {
  const { nome, cpf, data_nasc, email, whatsapp, cidade, estado } = req.body;

  if (!nome || !cpf || !whatsapp) {
    return res.status(400).json({ erro: 'nome, cpf e whatsapp são obrigatórios' });
  }

  try {
    const pessoa = await pool.query(
      `INSERT INTO pessoas_pcd (nome, cpf, data_nasc)
       VALUES ($1, $2, $3) RETURNING id`,
      [nome, cpf, data_nasc]
    );

    const pessoa_id = pessoa.rows[0].id;

    await pool.query(
      `INSERT INTO contatos (pessoa_id, email, whatsapp, cidade, estado)
       VALUES ($1, $2, $3, $4, $5)`,
      [pessoa_id, email, whatsapp, cidade, estado]
    );

    res.status(201).json({ mensagem: 'Cadastro realizado!', id: pessoa_id });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'CPF já cadastrado' });
    }
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar' });
  }
});

// Adicionar deficiência a uma pessoa
app.post('/deficiencia', async (req, res) => {
  const { pessoa_id, cid_codigo, descricao, grau, laudo_url } = req.body;

  if (!pessoa_id || !cid_codigo) {
    return res.status(400).json({ erro: 'pessoa_id e cid_codigo são obrigatórios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO deficiencias (pessoa_id, cid_codigo, descricao, grau, laudo_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [pessoa_id, cid_codigo, descricao, grau, laudo_url]
    );

    res.status(201).json({ mensagem: 'Deficiência cadastrada!', id: result.rows[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar deficiência' });
  }
});

// Listar deficiências de uma pessoa
app.get('/deficiencia/:pessoa_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM deficiencias WHERE pessoa_id = $1`,
      [req.params.pessoa_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar deficiências' });
  }
});

// Adicionar habilidade a uma pessoa
app.post('/habilidade', async (req, res) => {
  const { pessoa_id, nome, nivel } = req.body;

  if (!pessoa_id || !nome) {
    return res.status(400).json({ erro: 'pessoa_id e nome são obrigatórios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO habilidades (pessoa_id, nome, nivel)
       VALUES ($1, $2, $3) RETURNING id`,
      [pessoa_id, nome, nivel]
    );

    res.status(201).json({ mensagem: 'Habilidade cadastrada!', id: result.rows[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar habilidade' });
  }
});

// Listar habilidades de uma pessoa
app.get('/habilidade/:pessoa_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM habilidades WHERE pessoa_id = $1`,
      [req.params.pessoa_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar habilidades' });
  }
});


// Adicionar formação
app.post('/formacao', async (req, res) => {
  const { pessoa_id, nivel, curso, instituicao, ano_conclusao, em_andamento } = req.body;

  if (!pessoa_id) {
    return res.status(400).json({ erro: 'pessoa_id é obrigatório' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO formacoes (pessoa_id, nivel, curso, instituicao, ano_conclusao, em_andamento)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [pessoa_id, nivel, curso, instituicao, ano_conclusao, em_andamento ?? false]
    );

    res.status(201).json({ mensagem: 'Formação cadastrada!', id: result.rows[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar formação' });
  }
});

// Adicionar experiência
app.post('/experiencia', async (req, res) => {
  const { pessoa_id, cargo, empresa, area, data_inicio, data_fim, descricao } = req.body;

  if (!pessoa_id || !cargo) {
    return res.status(400).json({ erro: 'pessoa_id e cargo são obrigatórios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO experiencias (pessoa_id, cargo, empresa, area, data_inicio, data_fim, descricao)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [pessoa_id, cargo, empresa, area, data_inicio, data_fim ?? null, descricao]
    );

    res.status(201).json({ mensagem: 'Experiência cadastrada!', id: result.rows[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar experiência' });
  }
});


// Cadastrar ou atualizar preferências
// POST /preferencias
app.post('/preferencias', async (req, res) => {
  const {
    pessoa_id, area_interesse, regime_preferido,
    modalidade, salario_minimo, salario_maximo, disponibilidade
  } = req.body;

  if (!pessoa_id) {
    return res.status(400).json({ erro: 'pessoa_id é obrigatório' });
  }

  try {
    await pool.query(
      `INSERT INTO preferencias_trabalho
         (pessoa_id, area_interesse, regime_preferido, modalidade, salario_minimo, salario_maximo, disponibilidade)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (pessoa_id) DO UPDATE SET
         area_interesse   = EXCLUDED.area_interesse,
         regime_preferido = EXCLUDED.regime_preferido,
         modalidade       = EXCLUDED.modalidade,
         salario_minimo   = EXCLUDED.salario_minimo,
         salario_maximo   = EXCLUDED.salario_maximo,
         disponibilidade  = EXCLUDED.disponibilidade`,
      [pessoa_id, area_interesse, regime_preferido, modalidade, salario_minimo, salario_maximo, disponibilidade]
    );

    res.status(201).json({ mensagem: 'Preferências salvas!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar preferências' });
  }
});

// Listar todas as pessoas com contato e preferências
app.get('/pessoas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.nome, p.cpf, c.email, c.whatsapp, c.cidade, c.estado,
              pt.area_interesse, pt.modalidade, pt.regime_preferido, pt.disponibilidade
       FROM pessoas_pcd p
       LEFT JOIN contatos c ON c.pessoa_id = p.id
       LEFT JOIN preferencias_trabalho pt ON pt.pessoa_id = p.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pessoas' });
  }
});

// Buscar perfil completo de uma pessoa
app.get('/pessoa/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pessoa = await pool.query(
      `SELECT p.*, c.email, c.whatsapp, c.telefone, c.cidade, c.estado
       FROM pessoas_pcd p
       LEFT JOIN contatos c ON c.pessoa_id = p.id
       WHERE p.id = $1`, [id]
    );

    if (pessoa.rows.length === 0) {
      return res.status(404).json({ erro: 'Pessoa não encontrada' });
    }

    const deficiencias = await pool.query(
      `SELECT * FROM deficiencias WHERE pessoa_id = $1`, [id]
    );
    const habilidades = await pool.query(
      `SELECT * FROM habilidades WHERE pessoa_id = $1`, [id]
    );
    const formacoes = await pool.query(
      `SELECT * FROM formacoes WHERE pessoa_id = $1`, [id]
    );
    const experiencias = await pool.query(
      `SELECT * FROM experiencias WHERE pessoa_id = $1`, [id]
    );
    const preferencias = await pool.query(
      `SELECT * FROM preferencias_trabalho WHERE pessoa_id = $1`, [id]
    );

    res.json({
      ...pessoa.rows[0],
      deficiencias: deficiencias.rows,
      habilidades: habilidades.rows,
      formacoes: formacoes.rows,
      experiencias: experiencias.rows,
      preferencias: preferencias.rows[0] ?? null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
});


app.listen(3000, () => console.log('API rodando em http://localhost:3000'));
