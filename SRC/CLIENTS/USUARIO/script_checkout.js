// =============================================
//  VERIFICAR LOGIN DO USUÁRIO
// =============================================
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario || !usuario.id) {
    alert("Você precisa estar logado!");
    window.location.href = "/SRC/LOGINS/login.html";
}



// =============================================
//  FUNÇÃO PRINCIPAL: CARREGAR CARRINHO
// =============================================
async function carregarCarrinho() {

    const lista = document.querySelector(".checkout-summary ul");

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
            const subtotal = Number(item.subtotal) || 0;
            total += subtotal;

            lista.innerHTML += `
                <li data-produto="${item.id_produto}">
                    <span>${item.nome}</span>

                    <div class="qtd-controls">
                        <button class="btn-menos" onclick="diminuirQtd(${item.id_produto}, ${item.quantidade})">-</button>
                        <span class="qtd">${item.quantidade}</span>
                        <button class="btn-mais" onclick="aumentarQtd(${item.id_produto})">+</button>
                    </div>

                    <strong>R$ ${subtotal.toFixed(2)}</strong>
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
                <span>Total</span>
                <strong>R$ ${(total + taxaEntrega).toFixed(2)}</strong>
            </li>
        `;

    } catch (err) {
        console.error("Erro ao carregar carrinho:", err);
        lista.innerHTML = "<li>Erro ao carregar itens.</li>";
    }
}



// =============================================
//  🔼 AUMENTAR QUANTIDADE
// =============================================
async function aumentarQtd(id_produto) {

    try {
        const res = await fetch("http://127.0.0.1:3000/api/carrinho/addQtd", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: usuario.id, id_produto })
        });

        const data = await res.json();

        if (!data.success) {
            alert("Erro ao adicionar quantidade.");
            return;
        }

        carregarCarrinho();

    } catch (err) {
        console.log(err);
    }
}



// =============================================
//  🔽 DIMINUIR QUANTIDADE
// =============================================
async function diminuirQtd(id_produto, qtdAtual) {

    // Se estiver 1 → perguntar se quer remover
    if (qtdAtual === 1) {
        if (!confirm("Deseja remover este item do carrinho?")) return;

        removerItem(id_produto);
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:3000/api/carrinho/removeQtd", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: usuario.id, id_produto })
        });

        const data = await res.json();

        if (!data.success) {
            alert("Erro ao diminuir quantidade.");
            return;
        }

        carregarCarrinho();

    } catch (err) {
        console.log(err);
    }
}



// =============================================
//  🗑 REMOVER ITEM DO CARRINHO
// =============================================
async function removerItem(id_produto) {

    try {
        const res = await fetch("http://127.0.0.1:3000/api/carrinho/removerItem", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario: usuario.id, id_produto })
        });

        const data = await res.json();

        if (!data.success) {
            alert("Falha ao remover item.");
            return;
        }

        carregarCarrinho();

    } catch (err) {
        console.error(err);
    }
}



// =============================================
//  CONFIRMAR PEDIDO
// =============================================
function finalizarPedido() {
    alert("Pedido confirmado!");

    window.location.href = "pedido_confirmado.html";
}



// =============================================
//  INICIAR
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    carregarCarrinho();
});
