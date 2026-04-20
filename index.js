const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://127.0.0.1:5500',
}));

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


// ================= CADASTRO COMPLETO =================
app.post('/cadastro-completo', async (req, res) => {
  const client = await pool.connect();

  try {
    const {
  nome, cpf, data_nasc, email, telefone, cidade, estado,
  dados_complementares, habilidade, formacao, preferencias
} = req.body;

    if (!nome || !cpf || !telefone) {
      return res.status(400).json({ erro: 'nome, cpf e telefone são obrigatórios' });
    }

    await client.query('BEGIN');

    // ================= PESSOA =================
    const result = await client.query(
      `INSERT INTO cadastro_pcd 
       (nome, cpf, data_nasc, email, telefone, cidade, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [nome, cpf, data_nasc, email, telefone, cidade, estado]
    );

    const id = result.rows[0].id;

   // ================= DADOS COMPLEMENTARES (1 REGISTRO) =================
if (dados_complementares) {
  await client.query(
    `INSERT INTO dados_complementares 
     (cadastro_pcd_id, cid_codigo, descricao, grau, cargo, empresa, area)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      dados_complementares.cid_codigo,
      dados_complementares.descricao,
      dados_complementares.grau,
      dados_complementares.cargo,
      dados_complementares.empresa,
      dados_complementares.area
    ]
  );
}

    // ================= HABILIDADE =================
    if (habilidade) {
      await client.query(
        `INSERT INTO habilidades (pessoa_id, descricao, nivel)
          VALUES ($1, $2, $3)`,
        [id, habilidade.nome, habilidade.nivel]
      );
    }

    // ================= FORMAÇÃO =================
    if (formacao) {
      await client.query(
        `INSERT INTO formacoes (pessoa_id, curso, instituicao, ano_conclusao)
         VALUES ($1, $2, $3, $4)`,
        [id, formacao.curso, formacao.instituicao, formacao.ano_conclusao]
      );
    }

    // ================= PREFERÊNCIAS =================
    if (preferencias) {
      await client.query(
        `INSERT INTO preferencias_trabalho
         (pessoa_id, area_interesse, regime_preferido, modalidade)
         VALUES ($1, $2, $3, $4)`,
        [
          id,
          preferencias.area_interesse,
          preferencias.regime_preferido,
          preferencias.modalidade
        ]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      mensagem: 'Cadastro completo realizado!',
      id
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);

    if (err.code === '23505') {
      return res.status(409).json({ erro: 'CPF já cadastrado' });
    }

    res.status(500).json({ erro: err.message });

  } finally {
    client.release();
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
    res.status(500).json({ erro: err.message });
  }
});

// ================= DELETAR PESSOA =================
app.delete('/pessoa/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // deletar dependências primeiro (ordem importa)
    await client.query(`DELETE FROM dados_complementares WHERE cadastro_pcd_id = $1`, [id]);
    await client.query(`DELETE FROM habilidades WHERE pessoa_id = $1`, [id]);
    await client.query(`DELETE FROM formacoes WHERE pessoa_id = $1`, [id]);
    await client.query(`DELETE FROM preferencias_trabalho WHERE pessoa_id = $1`, [id]);

    // depois a pessoa
    await client.query(`DELETE FROM cadastro_pcd WHERE id = $1`, [id]);

    await client.query('COMMIT');

    res.json({ mensagem: 'Cadastro deletado com sucesso' });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally {
    client.release();
  }
});


// ================= LISTAR VAGAS =================
app.get('/vagas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, titulo, empresa, area, salario_min, salario_max, pcd_exclusiva, url_vaga, recebida_em
       FROM vagas_cache
       ORDER BY recebida_em DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
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

    const dados = await pool.query(
      `SELECT * FROM dados_complementares WHERE cadastro_pcd_id = $1`,
      [id]
    );

    const habilidades = await pool.query(
      `SELECT * FROM habilidades WHERE pessoa_id = $1`,
      [id]
    );

    const formacoes = await pool.query(
      `SELECT * FROM formacoes WHERE pessoa_id = $1`,
      [id]
    );

    const preferencias = await pool.query(
      `SELECT * FROM preferencias_trabalho WHERE pessoa_id = $1`,
      [id]
    );

    res.json({
      ...pessoa.rows[0],
      deficiencias: dados.rows.filter(d => d.cid_codigo),
      experiencias: dados.rows.filter(d => d.cargo),
      habilidades: habilidades.rows,
      formacoes: formacoes.rows,
      preferencias: preferencias.rows[0] ?? null
    });

  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});


// ================= START =================
app.listen(3000, () => {
  console.log('API rodando em http://localhost:3000');
});