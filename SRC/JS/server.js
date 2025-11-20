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
   CADASTRO
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

      db.query(
        insertCadastro,
        [idUsuario, nomeExibicao, loginNome, cpf, email, senha, dataNascimento, tipoConta],
        (err3) => {
          if (err3) {
            return res.status(500).json({
              success: false,
              message: 'Erro ao salvar cadastro completo.'
            });
          }

          return res.json({ success: true, message: 'Usuário cadastrado com sucesso!' });
        }
      );
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

  db.query(
    'SELECT * FROM produtos WHERE id_farmacia = ?',
    [farmaciaId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro no servidor' });
      res.json(results);
    }
  );
});

/* ============================================================
   LISTAR DADOS DA FARMÁCIA
   ============================================================ */
app.get('/api/farmacia/:id', (req, res) => {
  db.query(
    'SELECT * FROM farmacias WHERE id_farmacia = ?',
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro no servidor' });
      res.json(result[0] || {});
    }
  );
});

/* ============================================================
   ADICIONAR AO CARRINHO
   - Se já existir o produto no carrinho aberto, só soma a quantidade
   ============================================================ */
app.post('/api/carrinho/adicionar', (req, res) => {
  const { id_usuario, id_produto, quantidade } = req.body;

  if (!id_usuario || !id_produto) {
    return res.json({ success: false, message: 'id_usuario e id_produto obrigatórios' });
  }

  const qtd = quantidade && quantidade > 0 ? quantidade : 1;

  // 1) Buscar carrinho aberto do usuário (ou criar)
  db.query(
    'SELECT id_carrinho FROM carrinho WHERE id_usuario = ? AND status = "aberto" LIMIT 1',
    [id_usuario],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar carrinho.' });

      const continuarComCarrinho = (id_carrinho) => {
        // 2) Verificar se já existe esse produto no carrinho
        db.query(
          'SELECT quantidade FROM carrinho_itens WHERE id_carrinho = ? AND id_produto = ? LIMIT 1',
          [id_carrinho, id_produto],
          (errSel, itens) => {
            if (errSel) {
              return res.status(500).json({ success: false, message: 'Erro ao buscar itens do carrinho.' });
            }

            // 2.a) Se já existe: atualiza quantidade
            if (itens.length > 0) {
              db.query(
                'UPDATE carrinho_itens SET quantidade = quantidade + ? WHERE id_carrinho = ? AND id_produto = ?',
                [qtd, id_carrinho, id_produto],
                (errUpd) => {
                  if (errUpd) {
                    return res.status(500).json({ success: false, message: 'Erro ao atualizar item.' });
                  }
                  return res.json({ success: true, message: 'Quantidade atualizada no carrinho!' });
                }
              );
            } else {
              // 2.b) Não existe ainda → inserir novo item
              db.query(
                'SELECT preco FROM produtos WHERE id_produto = ?',
                [id_produto],
                (errProd, p) => {
                  if (errProd || p.length === 0) {
                    return res.json({ success: false, message: 'Produto não encontrado.' });
                  }

                  db.query(
                    `INSERT INTO carrinho_itens (id_carrinho, id_produto, quantidade, preco_unitario)
                     VALUES (?, ?, ?, ?)`,
                    [id_carrinho, id_produto, qtd, p[0].preco],
                    (errIns) => {
                      if (errIns) {
                        return res.status(500).json({ success: false, message: 'Erro ao adicionar item.' });
                      }
                      return res.json({ success: true, message: 'Item adicionado ao carrinho!' });
                    }
                  );
                }
              );
            }
          }
        );
      };

      // Se já existe carrinho aberto, usa ele; senão cria
      if (rows.length > 0) {
        continuarComCarrinho(rows[0].id_carrinho);
      } else {
        db.query(
          'INSERT INTO carrinho (id_usuario, status) VALUES (?, "aberto")',
          [id_usuario],
          (errCar, resultCar) => {
            if (errCar) {
              return res.status(500).json({ success: false, message: 'Erro ao criar carrinho.' });
            }
            continuarComCarrinho(resultCar.insertId);
          }
        );
      }
    }
  );
});

/* ============================================================
   BUSCAR ITENS DO CARRINHO — CRIA AUTOMATICAMENTE SE NÃO EXISTE
   ============================================================ */
app.get('/api/carrinho/:id_usuario', (req, res) => {

    const id_usuario = req.params.id_usuario;

    db.query(
        `SELECT * FROM carrinho WHERE id_usuario = ? AND status = 'aberto' LIMIT 1`,
        [id_usuario],
        (err, carrinho) => {

            if (err) return res.status(500).json({ error: "Erro ao buscar carrinho." });

            if (carrinho.length === 0) {

                db.query(
                    `INSERT INTO carrinho (id_usuario, status) VALUES (?, 'aberto')`,
                    [id_usuario],
                    (err2, novo) => {
                        if (err2) return res.status(500).json({ error: "Erro ao criar carrinho." });
                        return res.json([]);
                    }
                );

            } else {

                const id_carrinho = carrinho[0].id_carrinho;

                db.query(
                    `
                    SELECT 
                        c.id_carrinho,
                        i.id_produto,
                        p.nome,
                        i.quantidade,
                        i.preco_unitario,
                        CAST(i.quantidade * i.preco_unitario AS DECIMAL(10,2)) AS subtotal
                    FROM carrinho c
                    LEFT JOIN carrinho_itens i ON c.id_carrinho = i.id_carrinho
                    LEFT JOIN produtos p ON i.id_produto = p.id_produto
                    WHERE c.id_carrinho = ?
                    `,
                    [id_carrinho],
                    (err3, itens) => {
                        if (err3) return res.status(500).json({ error: "Erro ao buscar itens." });

                        // CONVERTER strings para número antes de enviar
                        itens = itens.map(i => ({
                            ...i,
                            preco_unitario: Number(i.preco_unitario),
                            subtotal: Number(i.subtotal)
                        }));

                        res.json(itens);
                    }
                );
            }
        }
    );
});



/* ============================================================
   AUMENTAR QUANTIDADE (BOTÃO "+")
   ============================================================ */
app.post('/api/carrinho/addQtd', (req, res) => {
  const { id_usuario, id_produto } = req.body;

  if (!id_usuario || !id_produto) {
    return res.json({ success: false, message: 'Dados inválidos.' });
  }

  const sql = `
    UPDATE carrinho_itens ci
    JOIN carrinho c ON ci.id_carrinho = c.id_carrinho
    SET ci.quantidade = ci.quantidade + 1
    WHERE c.id_usuario = ? AND ci.id_produto = ? AND c.status = 'aberto'
  `;

  db.query(sql, [id_usuario, id_produto], (err) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: 'Erro ao atualizar quantidade.' });
    }
    res.json({ success: true });
  });
});

/* ============================================================
   DIMINUIR QUANTIDADE (BOTÃO "-")
   - Só diminui se quantidade > 1 (se for 1, o front chama removerItem)
   ============================================================ */
app.post('/api/carrinho/removeQtd', (req, res) => {
  const { id_usuario, id_produto } = req.body;

  if (!id_usuario || !id_produto) {
    return res.json({ success: false, message: 'Dados inválidos.' });
  }

  const sql = `
    UPDATE carrinho_itens ci
    JOIN carrinho c ON ci.id_carrinho = c.id_carrinho
    SET ci.quantidade = ci.quantidade - 1
    WHERE c.id_usuario = ? 
      AND ci.id_produto = ? 
      AND ci.quantidade > 1
      AND c.status = 'aberto'
  `;

  db.query(sql, [id_usuario, id_produto], (err, result) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: 'Erro ao atualizar quantidade.' });
    }
    // se não afetou nenhuma linha, provavelmente já estava em 1
    res.json({ success: true, affectedRows: result.affectedRows });
  });
});

/* ============================================================
   REMOVER ITEM DO CARRINHO
   ============================================================ */
function removerItemHandler(req, res) {
  const { id_usuario, id_produto } = req.body;

  if (!id_usuario || !id_produto) {
    return res.json({ success: false, message: 'Dados insuficientes.' });
  }

  const sql = `
    DELETE ci FROM carrinho_itens ci
    JOIN carrinho c ON c.id_carrinho = ci.id_carrinho
    WHERE c.id_usuario = ? 
      AND ci.id_produto = ? 
      AND c.status = 'aberto'
  `;

  db.query(sql, [id_usuario, id_produto], (err) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: 'Erro no servidor.' });
    }

    return res.json({ success: true, message: 'Item removido!' });
  });
}

// rota nova usada pelo front atual
app.delete('/api/carrinho/removerItem', removerItemHandler);

// alias para compatibilidade com o que já existia
app.delete('/api/carrinho/remover', removerItemHandler);

/* ============================================================
   ENDEREÇOS — ADICIONAR
   ============================================================ */
app.post('/api/enderecos/adicionar', (req, res) => {
    const { id_usuario, cep, rua, numero, bairro, cidade, estado, complemento } = req.body;

    if (!id_usuario || !cep || !rua || !numero || !bairro || !cidade || !estado) {
        return res.json({ success: false, message: "Dados incompletos." });
    }

    db.query(`
        INSERT INTO enderecos 
        (id_usuario, cep, rua, numero, bairro, cidade, estado, complemento)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id_usuario, cep, rua, numero, bairro, cidade, estado, complemento || ""],
        (err) => {
            if (err) return res.json({ success: false, message: "Erro ao salvar endereço." });
            return res.json({ success: true, message: "Endereço cadastrado com sucesso!" });
        });
});


/* ============================================================
   ENDEREÇOS — LISTAR DO USUÁRIO
   ============================================================ */
app.get('/api/enderecos/:id_usuario', (req, res) => {
    db.query(`
        SELECT * FROM enderecos 
        WHERE id_usuario = ?
        ORDER BY id_endereco DESC
    `, [req.params.id_usuario],
        (err, rows) => {
            if (err) return res.json({ success: false, message: "Erro ao buscar endereços." });
            res.json(rows);
        }
    );
});


/* ============================================================
   ENDEREÇOS — REMOVER
   ============================================================ */
app.delete('/api/enderecos/remover', (req, res) => {
    const { id_endereco, id_usuario } = req.body;

    if (!id_endereco || !id_usuario)
        return res.json({ success: false, message: "Dados inválidos." });

    db.query(`
        DELETE FROM enderecos 
        WHERE id_endereco = ? AND id_usuario = ?
    `, [id_endereco, id_usuario],
        (err, result) => {
            if (err) return res.json({ success: false, message: "Erro ao remover endereço." });

            res.json({ success: true, message: "Endereço removido." });
        }
    );
});


/* ============================================================
   ENDEREÇOS — DETALHAR
   ============================================================ */
app.get('/api/endereco/:id_endereco', (req, res) => {
    db.query(`
        SELECT * FROM enderecos WHERE id_endereco = ?
    `, [req.params.id_endereco],
        (err, rows) => {
            if (err) return res.json({ success: false });
            res.json(rows[0] || {});
        }
    );
});


/* ============================================================
   INICIAR SERVIDOR
   ============================================================ */
app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://127.0.0.1:3000');
});
