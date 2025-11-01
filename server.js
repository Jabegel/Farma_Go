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
  if (err) {
    console.error('❌ Erro ao conectar no MySQL:', err);
  } else {
    console.log('✅ Conectado ao MySQL!');
  }
});

// Rota de login
app.post('/login', (req, res) => {
  const { login, senha, tipoUsuario } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
  }

  let query;
  let params;

  // Se o tipo foi selecionado no checkbox (cliente, farmacia, entregador)
  if (tipoUsuario && tipoUsuario !== "admin" && tipoUsuario !== "farmaceutico") {
    query = 'SELECT * FROM usuarios WHERE login = ? AND senha = ? AND tipo = ?';
    params = [login, senha, tipoUsuario];
  } else {
    // Para admin e farmacêutico — ignora o tipo vindo do front
    query = 'SELECT * FROM usuarios WHERE login = ? AND senha = ?';
    params = [login, senha];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('❌ Erro no banco:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }

    if (results.length === 0) {
      return res.json({ success: false, message: 'Usuário ou senha incorretos!' });
    }

    const usuario = results[0];

    // Se o tipo não foi informado (caso admin ou farmaceutico)
    if (!tipoUsuario && (usuario.tipo === "admin" || usuario.tipo === "farmaceutico")) {
      console.log(`✅ Login bem-sucedido: ${usuario.login} (${usuario.tipo})`);
      return res.json({ success: true, tipo: usuario.tipo });
    }

    // Se o tipo informado for diferente do banco
    if (tipoUsuario && usuario.tipo !== tipoUsuario) {
      return res.json({ success: false, message: 'Tipo de usuário incorreto!' });
    }

    console.log(`✅ Login bem-sucedido: ${usuario.login} (${usuario.tipo})`);
    return res.json({ success: true, tipo: usuario.tipo });
  });
});

// Inicializar servidor
app.listen(3000, () => console.log('🚀 Servidor rodando em http://127.0.0.1:3000'));



// Rota de cadastro
app.post('/cadastro', (req, res) => {
  const { nomeExibicao, loginNome, cpf, email, senha, dataNascimento, tipoConta } = req.body;

  if (!nomeExibicao || !loginNome || !cpf || !email || !senha || !dataNascimento || !tipoConta) {
    return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
  }

  // Verifica duplicidade
  const checkQuery = 'SELECT * FROM cadastros WHERE login_nome = ? OR cpf = ? OR email = ?';
  db.query(checkQuery, [loginNome, cpf, email], (err, results) => {
    if (err) {
      console.error('❌ Erro no banco:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }

    if (results.length > 0) {
      return res.json({ success: false, message: 'Usuário, CPF ou e-mail já cadastrados.' });
    }

    // Cria o usuário base na tabela `usuarios`
    const insertUser = 'INSERT INTO usuarios (nome, login, senha, tipo) VALUES (?, ?, ?, ?)';
    db.query(insertUser, [nomeExibicao, loginNome, senha, tipoConta], (err2, userResult) => {
      if (err2) {
        console.error('❌ Erro ao criar usuário:', err2);
        return res.status(500).json({ success: false, message: 'Erro ao criar usuário.' });
      }

      const idUsuario = userResult.insertId;

      // Cria o cadastro completo na tabela `cadastros`
      const insertCadastro = `
        INSERT INTO cadastros 
        (id_usuario, nome_exibicao, login_nome, cpf, email, senha, data_nascimento, tipo_conta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(insertCadastro, [idUsuario, nomeExibicao, loginNome, cpf, email, senha, dataNascimento, tipoConta], (err3) => {
        if (err3) {
          console.error('❌ Erro ao salvar cadastro:', err3);
          return res.status(500).json({ success: false, message: 'Erro ao salvar cadastro completo.' });
        }

        console.log(`✅ Novo usuário cadastrado: ${loginNome} (${tipoConta})`);
        return res.json({ success: true, message: 'Usuário cadastrado com sucesso!' });
      });
    });
  });
});

