const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express(); // ← ESSENCIAL
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
    console.error('Erro ao conectar no MySQL:', err);
  } else {
    console.log('Conectado ao MySQL!');
  }
});

// Rota de login
app.post('/login', (req, res) => {
  const { login, senha, tipoUsuario } = req.body;

  let query;
  let params;

  // Se o tipo for informado (cliente, farmacia, entregador)
  if (tipoUsuario) {
    query = 'SELECT * FROM usuarios WHERE login = ? AND senha = ? AND tipo = ?';
    params = [login, senha, tipoUsuario];
  } else {
    // Se não for informado (admin ou farmaceutico)
    query = 'SELECT * FROM usuarios WHERE login = ? AND senha = ?';
    params = [login, senha];
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Erro no banco:', err);
      return res.status(500).json({ message: 'Erro no servidor' });
    }

    if (results.length === 0) {
      return res.json({ success: false, message: 'Usuário ou senha incorretos!' });
    }

    const usuario = results[0];
    console.log(`🔍 Login bem-sucedido: ${usuario.login} (${usuario.tipo})`);

    // Retorna o tipo real do usuário
    res.json({ success: true, tipo: usuario.tipo });
  });
});


// Inicializar servidor
app.listen(3000, () => console.log('Servidor rodando em http://127.0.0.1:3000'));
