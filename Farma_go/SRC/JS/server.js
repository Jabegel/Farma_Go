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

// ===========================
// ROTAS ADMIN → FARMÁCIAS
// ===========================

// Listar todas as farmácias
app.get('/admin/farmacias', (req, res) => {
  const query = 'SELECT * FROM farmacias';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Erro ao buscar farmácias:', err);
      return res.status(500).json({ message: 'Erro ao buscar farmácias' });
    }
    res.json(results);
  });
});

// Atualizar dados da farmácia
app.put('/admin/farmacias/:id', (req, res) => {
  const { id } = req.params;
  const { nome, endereco, cep, cnpj, telefone, email } = req.body;

  const query = `
    UPDATE farmacias 
    SET nome = ?, endereco = ?, cep = ?, cnpj = ?, telefone = ?, email = ?
    WHERE id_farmacia = ?
  `;
  db.query(query, [nome, endereco, cep, cnpj, telefone, email, id], (err, result) => {
    if (err) {
      console.error('❌ Erro ao atualizar farmácia:', err);
      return res.status(500).json({ message: 'Erro ao atualizar farmácia' });
    }
    res.json({ success: true, message: 'Farmácia atualizada com sucesso!' });
  });
});

// Excluir farmácia
app.delete('/admin/farmacias/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM farmacias WHERE id_farmacia = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ Erro ao excluir farmácia:', err);
      return res.status(500).json({ message: 'Erro ao excluir farmácia' });
    }
    res.json({ success: true, message: 'Farmácia excluída com sucesso!' });
  });
});

// ===========================
// ROTAS ADMIN → USUÁRIOS
// ===========================

// Listar todos os usuários
app.get('/admin/usuarios', (req, res) => {
  db.query('SELECT id, nome, login, email, tipo FROM usuarios', (err, results) => {
    if (err) {
      console.error('❌ Erro ao buscar usuários:', err);
      return res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
    res.json(results);
  });
});

// Atualizar usuário
app.put('/admin/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const { nome, login, email, tipo } = req.body;

  const query = `
    UPDATE usuarios 
    SET nome = ?, login = ?, email = ?, tipo = ?
    WHERE id = ?
  `;
  db.query(query, [nome, login, email, tipo, id], (err, result) => {
    if (err) {
      console.error('❌ Erro ao atualizar usuário:', err);
      return res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
    res.json({ success: true, message: 'Usuário atualizado com sucesso!' });
  });
});

// Excluir usuário
app.delete('/admin/usuarios/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ Erro ao excluir usuário:', err);
      return res.status(500).json({ message: 'Erro ao excluir usuário' });
    }
    res.json({ success: true, message: 'Usuário excluído com sucesso!' });
  });
});


// ===========================
// ROTAS ADMIN → ENTREGADORES
// ===========================

// Listar entregadores
app.get('/admin/entregadores', (req, res) => {
  db.query('SELECT * FROM entregadores', (err, results) => {
    if (err) {
      console.error('❌ Erro ao buscar entregadores:', err);
      return res.status(500).json({ message: 'Erro ao buscar entregadores' });
    }
    res.json(results);
  });
});

// Atualizar entregador
app.put('/admin/entregadores/:id', (req, res) => {
  const { id } = req.params;
  const { nome, login, cpf, telefone, veiculo, email } = req.body;

  const query = `
    UPDATE entregadores
    SET nome = ?, login = ?, cpf = ?, telefone = ?, veiculo = ?, email = ?
    WHERE id_entregador = ?
  `;
  db.query(query, [nome, login, cpf, telefone, veiculo, email, id], (err, result) => {
    if (err) {
      console.error('❌ Erro ao atualizar entregador:', err);
      return res.status(500).json({ message: 'Erro ao atualizar entregador' });
    }
    res.json({ success: true, message: 'Entregador atualizado com sucesso!' });
  });
});

// Excluir entregador
app.delete('/admin/entregadores/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM entregadores WHERE id_entregador = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ Erro ao excluir entregador:', err);
      return res.status(500).json({ message: 'Erro ao excluir entregador' });
    }
    res.json({ success: true, message: 'Entregador excluído com sucesso!' });
  });
});

// ===========================
// ROTAS ADMIN → FARMACÊUTICOS
// ===========================

// Listar farmacêuticos
app.get('/admin/farmaceuticos', (req, res) => {
  db.query('SELECT * FROM farmaceuticos', (err, results) => {
    if (err) {
      console.error('❌ Erro ao buscar farmacêuticos:', err);
      return res.status(500).json({ message: 'Erro ao buscar farmacêuticos' });
    }
    res.json(results);
  });
});

// Atualizar farmacêutico
app.put('/admin/farmaceuticos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, login, crm, email } = req.body;

  db.query(
    'UPDATE farmaceuticos SET nome=?, login=?, crm=?, email=? WHERE id_farmaceutico=?',
    [nome, login, crm, email, id],
    (err, result) => {
      if (err) {
        console.error('❌ Erro ao atualizar farmacêutico:', err);
        return res.status(500).json({ message: 'Erro ao atualizar farmacêutico' });
      }
      res.json({ success: true, message: 'Farmacêutico atualizado com sucesso!' });
    }
  );
});

// Excluir farmacêutico
app.delete('/admin/farmaceuticos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM farmaceuticos WHERE id_farmaceutico=?', [id], (err) => {
    if (err) {
      console.error('❌ Erro ao excluir farmacêutico:', err);
      return res.status(500).json({ message: 'Erro ao excluir farmacêutico' });
    }
    res.json({ success: true, message: 'Farmacêutico excluído com sucesso!' });
  });
});

// ===========================
// ROTAS ADMIN → RECEITAS
// ===========================

// Listar receitas aceitas
app.get('/admin/receitas', (req, res) => {
  const query = `
    SELECT r.id_receita, r.nome_medicamento, r.quantidade, r.data_aceite,
           f.nome AS nome_farmaceutico, f.crm
    FROM receitas r
    JOIN farmaceuticos f ON r.farmaceutico_id = f.id_farmaceutico
    ORDER BY r.data_aceite DESC;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Erro ao buscar receitas:', err);
      return res.status(500).json({ message: 'Erro ao buscar receitas' });
    }
    res.json(results);
  });
});


// ===========================
// ROTAS ADMIN → COMPRAS DE USUÁRIOS
// ===========================

// Listar compras
app.get('/admin/compras', (req, res) => {
  const query = `
    SELECT c.id_compra, c.item, c.quantidade, c.data_compra,
           u.nome AS usuario_nome, f.nome AS farmacia_nome
    FROM compras c
    JOIN usuarios u ON c.id_usuario = u.id
    JOIN farmacias f ON c.id_farmacia = f.id_farmacia
    ORDER BY c.data_compra DESC;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Erro ao buscar compras:', err);
      return res.status(500).json({ message: 'Erro ao buscar compras' });
    }
    res.json(results);
  });
});

// =============================
// Funcionalidades da Página de Compras (usuarios_compras_admin.html)
// =============================


async function carregarCompras() {
  const resposta = await fetch("http://127.0.0.1:3000/admin/compras");
  const compras = await resposta.json();

  const tbody = document.getElementById("listaCompras");
  tbody.innerHTML = "";

  compras.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.usuario_nome}</td>
      <td>${c.farmacia_nome}</td>
      <td>${c.item}</td>
      <td>${c.quantidade}</td>
      <td>${new Date(c.data_compra).toLocaleString()}</td>
      <td><button class="btn btn-sm btn-info text-white" onclick="verDetalhesCompra(${c.id_compra})"><i class="bi bi-exclamation-circle"></i></button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function verDetalhesCompra(id) {
  const resposta = await fetch("http://127.0.0.1:3000/admin/compras");
  const compras = await resposta.json();
  const c = compras.find(x => x.id_compra === id);

  const conteudo = `
    <p><strong>Usuário:</strong> ${c.usuario_nome}</p>
    <p><strong>Farmácia:</strong> ${c.farmacia_nome}</p>
    <p><strong>Item:</strong> ${c.item}</p>
    <p><strong>Quantidade:</strong> ${c.quantidade}</p>
    <p><strong>Data:</strong> ${new Date(c.data_compra).toLocaleString()}</p>
  `;

  document.getElementById("detalheCompraConteudo").innerHTML = conteudo;

  const modal = new bootstrap.Modal(document.getElementById("detalheCompraModal"));
  modal.show();
}


// ===========================
// ROTA GERAL → REGISTRAR COMPRA
// ===========================
app.post('/comprar', (req, res) => {
  const { id_usuario, id_farmacia, item, quantidade } = req.body;

  if (!id_usuario || !id_farmacia || !item || !quantidade) {
    return res.status(400).json({ success: false, message: 'Dados incompletos da compra.' });
  }

  const query = `
    INSERT INTO compras (id_usuario, id_farmacia, item, quantidade)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [id_usuario, id_farmacia, item, quantidade], (err, result) => {
    if (err) {
      console.error('❌ Erro ao registrar compra:', err);
      return res.status(500).json({ success: false, message: 'Erro ao registrar compra.' });
    }

    console.log(`🛒 Nova compra registrada -> Usuário ${id_usuario} comprou ${quantidade}x ${item}`);
    res.json({ success: true, message: 'Compra registrada com sucesso!' });
  });
});
