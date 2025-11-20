// =============================================
//  VERIFICAR LOGIN
// =============================================
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario || !usuario.id) {
    alert("Você precisa estar logado!");
    window.location.href = "/SRC/LOGINS/login.html";
}



// =============================================
//  CARREGAR ENDEREÇOS DINÂMICOS
// =============================================
async function carregarEnderecos() {

    const lista = document.getElementById("listaEnderecos");
    lista.innerHTML = "Carregando endereços...";

    const req = await fetch(`http://127.0.0.1:3000/api/enderecos/${usuario.id}`);
    const enderecos = await req.json();

    if (!enderecos.length) {
        lista.innerHTML = `
            <p>Nenhum endereço cadastrado.</p>
            <a href="endereco_usuario.html">Adicionar agora</a>
        `;
        return;
    }

    lista.innerHTML = "";

    enderecos.forEach(end => {
        lista.innerHTML += `
            <div class="form-group endereco-item">
                <input type="radio" name="endereco" value="${end.id_endereco}">
                <label>
                    ${end.rua}, ${end.numero} — ${end.bairro}
                    <span class="detalhes" onclick="mostrarDetalhes(${end.id_endereco})">❗</span>
                </label>
            </div>
        `;
    });
}



// =============================================
//  DETALHES DO ENDEREÇO + REMOVER
// =============================================
async function mostrarDetalhes(id_endereco) {

    const req = await fetch(`http://127.0.0.1:3000/api/endereco/${id_endereco}`);
    const end = await req.json();

    const texto = `
Rua: ${end.rua}, ${end.numero}
Bairro: ${end.bairro}
Cidade: ${end.cidade} - ${end.estado}
CEP: ${end.cep}
Complemento: ${end.complemento || "Nenhum"}
    `;

    if (confirm(texto + "\n\nDeseja remover este endereço?")) {
        removerEndereco(id_endereco);
    }
}


async function removerEndereco(id_endereco) {
    const req = await fetch("http://127.0.0.1:3000/api/enderecos/remover", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_endereco,
            id_usuario: usuario.id
        })
    });

    const data = await req.json();
    alert(data.message);

    carregarEnderecos();
}



// =============================================
//  CARREGAR CARRINHO
// =============================================
async function carregarCarrinho() {

    const lista = document.querySelector(".checkout-list");
    lista.innerHTML = "<li>Carregando...</li>";

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
                    <span class="qtd">${item.quantidade}</span>
                    <button onclick="aumentarQtd(${item.id_produto})">+</button>
                </div>

                <strong>R$ ${item.subtotal.toFixed(2)}</strong>
            </li>
        `;
    });

    const taxa = 10;

    lista.innerHTML += `
        <li>
            <span>Taxa de Entrega</span>
            <strong>R$ ${taxa.toFixed(2)}</strong>
        </li>

        <li class="total">
            <span>Total</span>
            <strong>R$ ${(total + taxa).toFixed(2)}</strong>
        </li>
    `;
}



// =============================================
//  AUMENTAR QUANTIDADE
// =============================================
async function aumentarQtd(id_produto) {
    await fetch("http://127.0.0.1:3000/api/carrinho/addQtd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: usuario.id, id_produto })
    });

    carregarCarrinho();
}



// =============================================
//  DIMINUIR QUANTIDADE
// =============================================
async function diminuirQtd(id_produto, atual) {

    if (atual === 1) {
        if (!confirm("Remover item do carrinho?")) return;
        removerItem(id_produto);
        return;
    }

    await fetch("http://127.0.0.1:3000/api/carrinho/removeQtd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: usuario.id, id_produto })
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
        body: JSON.stringify({ id_usuario: usuario.id, id_produto })
    });

    carregarCarrinho();
}




// =============================================
//  FINALIZAR PEDIDO
// =============================================
function finalizarPedido() {
    alert("Pedido concluído!");
    window.location.href = "pedido_confirmado.html";
}



// =============================================
//  INICIAR
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    carregarEnderecos();
    carregarCarrinho();
});
