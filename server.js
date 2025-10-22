app.post('/login', (req, res) => {
  const { login, senha, tipoUsuario } = req.body;
  console.log("Dados recebidos:", req.body);

  const query = 'SELECT * FROM usuarios WHERE login = ? AND senha = ? AND tipo = ?';
  db.query(query, [login, senha, tipoUsuario], (err, results) => {
    if (err) {
      console.error('Erro no banco:', err);
      return res.status(500).json({ success: false, message: 'Erro no servidor' });
    }

    if (results.length > 0) {
      console.log("Usuário autenticado:", results[0]);
      return res.json({ success: true, tipo: results[0].tipo });
    } else {
      console.log("Falha no login:", login, senha, tipoUsuario);
      return res.json({ success: false, message: 'Usuário ou senha inválidos' });
    }
  });
});
