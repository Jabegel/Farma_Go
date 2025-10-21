const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos (HTML, JS, CSS)
app.use(express.static(__dirname));

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
  db.query(sql, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro na query:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos.' });
    }

    const usuario = results[0];
    res.json({ success: true, tipo: usuario.tipo });
  });
});

// Servir página padrão
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://127.0.0.1:${PORT}`));
