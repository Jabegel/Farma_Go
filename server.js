const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());

// ⚠️ Adicione exatamente isso:
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

  const query = 'SELECT * FROM usuarios WHERE login = ? AND senha = ? AND tipo = ?';
  db.query(query, [login, senha, tipoUsuario], (err, results) => {
    if (err) {
      console.error('Erro no banco:', err);
      res.status(500).json({ message: 'Erro no servidor' });
    } else if (results.length > 0) {
      res.json({ success: true, tipo: tipoUsuario });
    } else {
      res.json({ success: false, message: 'Usuário ou senha inválidos' });
    }
  });
});

app.listen(3000, () => console.log('Servidor rodando em http://127.0.0.1:3000'));
