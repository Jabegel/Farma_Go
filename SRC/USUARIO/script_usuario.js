const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// =================================================
// 1. CONFIGURAÇÕES INICIAIS
// =================================================

// Habilita JSON e dados de formulário
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Conexão com o Banco de Dados
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       
    password: '',       
    database: 'farmago' 
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar no banco:', err);
    } else {
        console.log('Conectado ao MySQL com sucesso!');
    }
});

// =================================================
// 2. ROTAS E LÓGICA DO SISTEMA
// =================================================

// Rota: Abre a página HTML
app.get('/checkout', (req, res) => {
    // Ajuste o caminho conforme suas pastas. 
    // Se estiver tudo na mesma pasta, use: path.join(__dirname, 'checkout.html')
    res.sendFile(path.join(__dirname, '../CHECKOUT/checkout.html'));
});

// API: Calcular Parcelamento
app.post('/api/checkout/parcelamento', (req, res) => {
    const { total } = req.body;
    const value = parseFloat(total);
    
    if (!value || value <= 0) {
        return res.json({ success: false, message: "Valor inválido" });
    }

    const options = [];
    const maxInstallments = 12;
    const minInstallmentValue = 5.00;
    const INTEREST_RATE = 0.0199; 

    for (let i = 1; i <= maxInstallments; i++) {
        let finalTotal = value;
        let infoText = 'sem juros';

        if (i >= 5) {
            const interestPeriods = i - 4;
            const interestAmount = value * interestPeriods * INTEREST_RATE;
            finalTotal = value + interestAmount;
            const totalInterestPercent = (interestPeriods * 1.99).toFixed(2).replace('.', ',');
            infoText = `c/ juros (${totalInterestPercent}%)`;
        }

        const installmentValue = finalTotal / i;

        if (installmentValue >= minInstallmentValue) {
            options.push({
                installments: i,
                valuePerInstallment: installmentValue.toFixed(2),
                total: finalTotal.toFixed(2),
                info: `${i}x de R$ ${installmentValue.toFixed(2).replace('.', ',')} (${infoText})`
            });
        }
    }
    res.json({ success: true, options: options });
});

// API: Listar itens do carrinho
app.get('/api/carrinho/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const sql = `
        SELECT ci.id_item, ci.quantidade, ci.preco_unitario,
               p.id_produto, p.nome, p.imagem,
               (ci.quantidade * ci.preco_unitario) as subtotal_item
        FROM carrinho c
        JOIN carrinho_itens ci ON c.id_carrinho = ci.id_carrinho
        JOIN produtos p ON ci.id_produto = p.id_produto
        WHERE c.id_usuario = ? AND c.status = 'aberto'
    `;
    db.query(sql, [id_usuario], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        let totalGeral = 0;
        results.forEach(item => totalGeral += item.subtotal_item);
        res.json({ success: true, itens: results, total: totalGeral });
    });
});

// API: Adicionar ao Carrinho
app.post('/api/carrinho/add', (req, res) => {
    const { id_usuario, id_produto, quantidade } = req.body;
    
    const sqlCheckCart = "SELECT id_carrinho FROM carrinho WHERE id_usuario = ? AND status = 'aberto'";
    db.query(sqlCheckCart, [id_usuario], (err, resultCart) => {
        if (err) return res.status(500).json({ success: false });

        const addItemToCart = (cartId) => {
            const sqlPrice = "SELECT preco FROM produtos WHERE id_produto = ?";
            db.query(sqlPrice, [id_produto], (errPrice, resPrice) => {
                if (errPrice || !resPrice.length) return res.status(400).json({ success: false });
                const preco = resPrice[0].preco;

                // Verifica se item já existe para somar quantidade
                const sqlCheckItem = "SELECT id_item, quantidade FROM carrinho_itens WHERE id_carrinho = ? AND id_produto = ?";
                db.query(sqlCheckItem, [cartId, id_produto], (errItem, resItem) => {
                    if (errItem) return res.status(500).json({ success: false });

                    if (resItem.length > 0) {
                        const novaQtd = resItem[0].quantidade + parseInt(quantidade);
                        db.query("UPDATE carrinho_itens SET quantidade = ? WHERE id_item = ?", [novaQtd, resItem[0].id_item], (errUp) => {
                            if (errUp) return res.status(500).json({ success: false });
                            res.json({ success: true, message: "Quantidade atualizada!" });
                        });
                    } else {
                        db.query("INSERT INTO carrinho_itens (id_carrinho, id_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?)", 
                        [cartId, id_produto, quantidade, preco], (errIns) => {
                            if (errIns) return res.status(500).json({ success: false });
                            res.json({ success: true, message: "Item adicionado!" });
                        });
                    }
                });
            });
        };

        if (resultCart.length > 0) {
            addItemToCart(resultCart[0].id_carrinho);
        } else {
            db.query("INSERT INTO carrinho (id_usuario, status) VALUES (?, 'aberto')", [id_usuario], (errCr, resCr) => {
                if (errCr) return res.status(500).json({ success: false });
                addItemToCart(resCr.insertId);
            });
        }
    });
});

// API: Remover Item do Carrinho (ESTA É A PARTE QUE FALTAVA)
app.delete('/api/carrinho/remove/:id_item', (req, res) => {
    const { id_item } = req.params;
    const sql = "DELETE FROM carrinho_itens WHERE id_item = ?";
    
    db.query(sql, [id_item], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Erro ao remover" });
        res.json({ success: true, message: "Item removido." });
    });
});

// API: Finalizar Pedido
app.post('/api/carrinho/finalizar', (req, res) => {
    const { id_usuario } = req.body;
    const sql = "UPDATE carrinho SET status = 'finalizado' WHERE id_usuario = ? AND status = 'aberto'";
    
    db.query(sql, [id_usuario], (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: "Pedido realizado com sucesso!" });
    });
});

// =================================================
// 3. RODAR O SERVIDOR
// =================================================
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});