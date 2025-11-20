// =============================================
//  VERIFICAR LOGIN
// =============================================
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario || !usuario.id) {
    alert("Você precisa estar logado!");
    window.location.href = "/SRC/LOGINS/login.html";
}


// =============================================
//  CARREGAR ENDEREÇOS
// =============================================
async function carregarEnderecos() {
    const box = document.getElementById("listaEnderecos");

    try {
        const req = await fetch(`http://127.0.0.1:3000/api/enderecos/${usuario.id}`);
        const enderecos = await req.json();

        if (!enderecos.length) {
            box.innerHTML = `
                <p>Você ainda não cadastrou nenhum endereço.</p>
                <a href="/SRC/CLIENTS/USUARIO/endereco_usuario_novo.html">+ Cadastrar novo endereço</a>
            `;
            return;
        }

        box.innerHTML = "";
        let primeiro = true;

        enderecos.forEach(end => {
            box.innerHTML += `
                <div class="form-group endereco-item">
                    <input type="radio" name="endereco" value="${end.id_endereco}" ${primeiro ? "checked" : ""}>
                    <label>
                        ${end.rua}, ${end.numero} — ${end.bairro}
                    </label>

                    <button class="info-btn" onclick="mostrarDetalhes(${end.id_endereco})">!</button>
                    <button class="remove-btn" onclick="removerEndereco(${end.id_endereco})">🗑</button>
                </div>
            `;
            primeiro = false;
        });

    } catch (err) {
        console.error("Erro ao carregar endereços:", err);
        box.innerHTML = "<p>Erro ao carregar endereços.</p>";
    }
}



// =============================================
//  DETALHES DO ENDEREÇO
// =============================================
async function mostrarDetalhes(id_endereco) {
    try {
        const req = await fetch(`http://127.0.0.1:3000/api/endereco/${id_endereco}`);
        const e = await req.json();

        alert(`
📍 Endereço Completo:

Rua: ${e.rua}, Nº ${e.numero}
Bairro: ${e.bairro}
Cidade: ${e.cidade} - ${e.estado}
CEP: ${e.cep}
Complemento: ${e.complemento || "(nenhum)"}
        `);
    } catch (err) {
        console.log(err);
        alert("Erro ao carregar os detalhes.");
    }
}



// =============================================
//  REMOVER ENDEREÇO
// =============================================
async function removerEndereco(id_endereco) {
    if (!confirm("Tem certeza que deseja remover este endereço?")) return;

    try {
        const req = await fetch("http://127.0.0.1:3000/api/enderecos/remover", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_endereco,
                id_usuario: usuario.id
            })
        });

        const data = await req.json();

        if (data.success) {
            carregarEnderecos();
        } else {
            alert("Não foi possível remover.");
        }

    } catch (err) {
        console.log(err);
    }
}



// =============================================
//  CARREGAR CARRINHO
// =============================================
async function carregarCarrinho() {

    const lista = document.querySelector(".checkout-list");

    lista.innerHTML = "<li>Carregando...</li>";

    try {
        const req = await fetch(`http://127.0.0.1:3000/api/carrinho/${usuario.id}`);
        const itens = await req.json();

        if (!itens.length) {
            lista.innerHTML = "<li>Seu carrinho está vazio.</li>";
            return;
        }

        lista.innerHTML = "";
        let total = 0;

        itens.forEach(item => {
            total += item.subtotal;

            lista.innerHTML += `
                <li data-produto="${item.id_produto}">
                    <span>${item.nome}</span>

                    <div class="qtd-controls">
                        <button onclick="diminuirQtd(${item.id_produto}, ${item.quantidade})">-</button>
                        <span>${item.quantidade}</span>
                        <button onclick="aumentarQtd(${item.id_produto})">+</button>
                    </div>

                    <strong>R$ ${item.subtotal.toFixed(2)}</strong>
                </li>
            `;
        });

        const taxaEntrega = 10;

        lista.innerHTML += `
            <li>
                <span>Taxa de Entrega</span>
                <strong>R$ ${taxaEntrega.toFixed(2)}</strong>
            </li>

            <li class="total">
                <span><b>Total</b></span>
                <strong id="totalFinal">R$ ${(total + taxaEntrega).toFixed(2)}</strong>
            </li>
        `;

    } catch (err) {
        console.error("Erro ao carregar carrinho:", err);
        lista.innerHTML = "<li>Erro ao carregar itens.</li>";
    }
}



// =============================================
//  AUMENTAR QUANTIDADE
// =============================================
async function aumentarQtd(id_produto) {

    await fetch("http://127.0.0.1:3000/api/carrinho/addQtd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_usuario: usuario.id,
            id_produto
        })
    });

    carregarCarrinho();
}



// =============================================
//  DIMINUIR QUANTIDADE
// =============================================
async function diminuirQtd(id_produto, qtdAtual) {

    if (qtdAtual === 1) {
        if (!confirm("Deseja remover este item do carrinho?")) return;
        return removerItem(id_produto);
    }

    await fetch("http://127.0.0.1:3000/api/carrinho/removeQtd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_usuario: usuario.id,
            id_produto
        })
    });

    carregarCarrinho();
}



// =============================================
//  REMOVER ITEM
// =============================================
async function removerItem(id_produto) {

    await fetch("http://127.0.0.1:3000/api/carrinho/removerItem", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_usuario: usuario.id,
            id_produto
        })
    });

    carregarCarrinho();
}



// =============================================
//  FINALIZAR PEDIDO
// =============================================
document.getElementById("btnConfirmarPedido").addEventListener("click", () => {
    alert("Pedido confirmado!");
    window.location.href = "pedido_confirmado.html";
});



// =============================================
//  INICIAR TUDO
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    carregarEnderecos();
    carregarCarrinho();
});
