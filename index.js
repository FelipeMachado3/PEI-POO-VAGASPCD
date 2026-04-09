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

// ================= TESTE =================
app.get('/', (req, res) => {
  res.json({ mensagem: 'API PCD funcionando!' });
});


// ================= CADASTRO =================
app.post('/cadastro', async (req, res) => {
  const { nome, cpf, data_nasc, email, telefone, cidade, estado } = req.body;

  if (!nome || !cpf || !telefone) {
    return res.status(400).json({ erro: 'nome, cpf e telefone são obrigatórios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cadastro_pcd 
       (nome, cpf, data_nasc, email, telefone, cidade, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [nome, cpf, data_nasc, email, telefone, cidade, estado]
    );

    res.status(201).json({
      mensagem: 'Cadastro realizado!',
      id: result.rows[0].id
    });

  } catch (err) {
    console.error(err);

    if (err.code === '23505') {
      return res.status(409).json({ erro: 'CPF já cadastrado' });
    }

    res.status(500).json({ erro: err.message });
  }
});


// ================= DADOS COMPLEMENTARES =================

// DEFICIÊNCIA
app.post('/deficiencia', async (req, res) => {
  const { cadastro_pcd_id, cid_codigo, descricao, grau } = req.body;

  if (!cadastro_pcd_id || !cid_codigo) {
    return res.status(400).json({ erro: 'cadastro_pcd_id e cid_codigo são obrigatórios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO dados_complementares 
       (cadastro_pcd_id, cid_codigo, descricao, grau)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [cadastro_pcd_id, cid_codigo, descricao, grau]
    );

    res.status(201).json({
      mensagem: 'Deficiência cadastrada!',
      id: result.rows[0].id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar deficiência' });
  }
});

// LISTAR DEFICIÊNCIAS
app.get('/deficiencia/:cadastro_pcd_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM dados_complementares 
       WHERE cadastro_pcd_id = $1 AND cid_codigo IS NOT NULL`,
      [req.params.cadastro_pcd_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar deficiências' });
  }
});


// EXPERIÊNCIA
app.post('/experiencia', async (req, res) => {
  const { cadastro_pcd_id, cargo, empresa, area, data_inicio, data_fim, descricao } = req.body;

  if (!cadastro_pcd_id || !cargo) {
    return res.status(400).json({ erro: 'cadastro_pcd_id e cargo são obrigatórios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO dados_complementares 
       (cadastro_pcd_id, cargo, empresa, area, data_inicio, data_fim, descricao)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [cadastro_pcd_id, cargo, empresa, area, data_inicio, data_fim ?? null, descricao]
    );

    res.status(201).json({
      mensagem: 'Experiência cadastrada!',
      id: result.rows[0].id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar experiência' });
  }
});


// ================= HABILIDADES =================

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

    res.status(201).json({
      mensagem: 'Habilidade cadastrada!',
      id: result.rows[0].id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar habilidade' });
  }
});

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


// ================= FORMAÇÃO =================

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

    res.status(201).json({
      mensagem: 'Formação cadastrada!',
      id: result.rows[0].id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar formação' });
  }
});


// ================= PREFERÊNCIAS =================

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


// ================= LISTAR PESSOAS =================

app.get('/pessoas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM cadastro_pcd ORDER BY id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pessoas' });
  }
});


// ================= PERFIL COMPLETO =================

app.get('/pessoa/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pessoa = await pool.query(
      `SELECT * FROM cadastro_pcd WHERE id = $1`,
      [id]
    );

    if (pessoa.rows.length === 0) {
      return res.status(404).json({ erro: 'Pessoa não encontrada' });
    }

    const dados = await pool.query(
      `SELECT * FROM dados_complementares WHERE cadastro_pcd_id = $1`,
      [id]
    );

    const habilidades = await pool.query(
      `SELECT * FROM habilidades WHERE pessoa_id = $1`, [id]
    );

    const formacoes = await pool.query(
      `SELECT * FROM formacoes WHERE pessoa_id = $1`, [id]
    );

    const preferencias = await pool.query(
      `SELECT * FROM preferencias_trabalho WHERE pessoa_id = $1`, [id]
    );

    const deficiencias = dados.rows.filter(d => d.cid_codigo !== null);
    const experiencias = dados.rows.filter(d => d.cargo !== null);

    res.json({
      ...pessoa.rows[0],
      deficiencias,
      habilidades: habilidades.rows,
      formacoes: formacoes.rows,
      experiencias,
      preferencias: preferencias.rows[0] ?? null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
});


// ================= START =================
app.listen(3000, () => {
  console.log('API rodando em http://localhost:3000');
});