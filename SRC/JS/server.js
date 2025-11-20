const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());

// Permitir requisições do frontend
app.use(cors({
  origin: "http://127.0.0.1:5500"
}));

// Conexão com o banco
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'farmago'
});

db.connect(err => {
  if (err) console.error('❌ Erro ao conectar no MySQL:', err);
  else console.log('✅ Conectado ao MySQL!');
});


/* ============================================================
   LOGIN
   ============================================================ */
app.post('/login', (req, res) => {
  const { login, senha, tipoUsuario } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
  }

  let query, params;

  if (tipoUsuario && tipoUsuario !== "admin" && tipoUsuario !== "farmaceutico") {
    query = 'SELECT * FROM usuarios WHERE login = ? AND senha = ? AND tipo = ?';
    params = [login, senha, tipoUsuario];
  } else {
    query = 'SELECT * FROM usuarios WHERE login = ? AND senha = ?';
    params = [login, senha];
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro no servidor.' });

    if (results.length === 0) {
      return res.json({ success: false, message: 'Usuário ou senha incorretos!' });
    }

    const usuario = results[0];

    if (tipoUsuario && usuario.tipo !== tipoUsuario) {
      return res.json({ success: false, message: 'Tipo de usuário incorreto!' });
    }

    return res.json({
      success: true,
      id_usuario: usuario.id,
      nome: usuario.nome,
      tipo: usuario.tipo
    });
  });
});


/* ============================================================
   CADASTRO (organizado)
   ============================================================ */
app.post('/cadastro', (req, res) => {
  const { nomeExibicao, loginNome, cpf, email, senha, dataNascimento, tipoConta } = req.body;

  if (!nomeExibicao || !loginNome || !cpf || !email || !senha || !dataNascimento || !tipoConta) {
    return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
  }

  const checkQuery = 'SELECT * FROM cadastros WHERE login_nome = ? OR cpf = ? OR email = ?';

  db.query(checkQuery, [loginNome, cpf, email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Erro no servidor.' });

    if (results.length > 0) {
      return res.json({ success: false, message: 'Usuário, CPF ou e-mail já cadastrados.' });
    }

    const insertUser = 'INSERT INTO usuarios (nome, login, senha, tipo) VALUES (?, ?, ?, ?)';
    db.query(insertUser, [nomeExibicao, loginNome, senha, tipoConta], (err2, resultUser) => {

      if (err2) return res.status(500).json({ success: false, message: 'Erro ao criar usuário.' });

      const idUsuario = resultUser.insertId;

      const insertCadastro = `
        INSERT INTO cadastros (id_usuario, nome_exibicao, login_nome, cpf, email, senha, data_nascimento, tipo_conta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(insertCadastro,
        [idUsuario, nomeExibicao, loginNome, cpf, email, senha, dataNascimento, tipoConta],
        (err3) => {

          if (err3) return res.status(500).json({
            success: false,
            message: 'Erro ao salvar cadastro completo.'
          });

          return res.json({ success: true, message: 'Usuário cadastrado com sucesso!' });
        });
    });
  });
});


/* ============================================================
   LISTAR PRODUTOS DA FARMÁCIA
   ============================================================ */
app.get('/api/produtos', (req, res) => {
  const farmaciaId = req.query.farmacia;

  if (!farmaciaId) {
    return res.status(400).json({ error: 'Parâmetro farmacia necessário' });
  }

  db.query(`SELECT * FROM produtos WHERE id_farmacia = ?`,
    [farmaciaId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Erro no servidor" });
      res.json(results);
    }
  );
});


/* ============================================================
   LISTAR DADOS DA FARMÁCIA
   ============================================================ */
app.get('/api/farmacia/:id', (req, res) => {
  db.query(`SELECT * FROM farmacias WHERE id_farmacia = ?`,
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro no servidor' });
      res.json(result[0] || {});
    }
  );
});


/* ============================================================
   ADICIONAR AO CARRINHO
   ============================================================ */
app.post('/api/carrinho/adicionar', (req, res) => {

  const { id_usuario, id_produto, quantidade } = req.body;

  if (!id_usuario || !id_produto) {
    return res.json({ success: false, message: "id_usuario e id_produto obrigatórios" });
  }

  db.query(
    `SELECT id_carrinho FROM carrinho WHERE id_usuario = ? AND status = 'aberto' LIMIT 1`,
    [id_usuario],
    (err, rows) => {

      if (err) return res.status(500).json({ success: false });

      // função criar item
      const criarItem = (id_carrinho) => {
        db.query(`SELECT preco FROM produtos WHERE id_produto = ?`,
          [id_produto],
          (err2, p) => {

            if (err2 || p.length === 0)
              return res.json({ success: false, message: "Produto não encontrado" });

            db.query(
              `INSERT INTO carrinho_itens (id_carrinho, id_produto, quantidade, preco_unitario)
               VALUES (?, ?, ?, ?)`,
              [id_carrinho, id_produto, quantidade || 1, p[0].preco],
              (err3) => {

                if (err3) return res.status(500).json({ success: false });

                res.json({ success: true, message: "Item adicionado!" });
              }
            );
          }
        );
      };

      if (rows.length > 0)
        criarItem(rows[0].id_carrinho);
      else {
        db.query(
          `INSERT INTO carrinho (id_usuario, status) VALUES (?, 'aberto')`,
          [id_usuario],
          (err4, r) => {
            if (err4) return res.status(500).json({ success: false });
            criarItem(r.insertId);
          }
        );
      }
    }
  );
});


/* ============================================================
   🔥 ROTA NOVA — BUSCAR ITENS DO CARRINHO
   ============================================================ */
app.get('/api/carrinho/:id_usuario', (req, res) => {

  db.query(`
      SELECT 
        c.id_carrinho,
        i.id_produto,
        p.nome,
        p.preco,
        i.quantidade,
        (i.quantidade * i.preco_unitario) AS subtotal
      FROM carrinho c
      LEFT JOIN carrinho_itens i ON c.id_carrinho = i.id_carrinho
      LEFT JOIN produtos p ON i.id_produto = p.id_produto
      WHERE c.id_usuario = ? AND c.status = 'aberto'
  `,
    [req.params.id_usuario],
    (err, rows) => {

      if (err) return res.status(500).json({ error: "Erro no servidor" });

      res.json(rows);
    }
  );
});


app.delete('/api/carrinho/remover', (req, res) => {
    const { id_usuario, id_produto } = req.body;

    if (!id_usuario || !id_produto) {
        return res.json({ success: false, message: "Dados insuficientes." });
    }

    db.query(`
        DELETE i FROM carrinho_itens i
        JOIN carrinho c ON c.id_carrinho = i.id_carrinho
        WHERE c.id_usuario = ? AND i.id_produto = ? AND c.status = 'aberto'
    `, [id_usuario, id_produto],
        (err, result) => {
            if (err) return res.json({ success: false, message: "Erro no servidor." });

            return res.json({ success: true, message: "Item removido!" });
        }
    );
});


/* ============================================================
   INICIAR SERVIDOR
   ============================================================ */
app.listen(3000, () =>
  console.log('🚀 Servidor rodando em http://127.0.0.1:3000')
);
