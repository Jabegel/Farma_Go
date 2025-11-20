// =============================================
//  VERIFICAR LOGIN DO USUÁRIO
// =============================================
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario || !usuario.id) {
    alert("Você precisa estar logado!");
    window.location.href = "/SRC/LOGINS/login.html";
}



// =============================================
//  CARREGAR ITENS DO CARRINHO
// =============================================
async function carregarCarrinho() {

    const lista = document.querySelector(".checkout-summary ul");
    const totalFinal = document.querySelector("#totalFinal");

    lista.innerHTML = "<li>Carregando...</li>";

    try {
        const req = await fetch(`http://127.0.0.1:3000/api/carrinho/${usuario.id}`);
        const itens = await req.json();

        if (!itens.length) {
            lista.innerHTML = "<li>Seu carrinho está vazio.</li>";
            totalFinal.textContent = "R$ 0,00";
            return;
        }

        lista.innerHTML = "";
        let total = 0;

        itens.forEach(item => {
            total += item.subtotal;

            lista.innerHTML += `
                <li>
                    <span>${item.nome} (${item.quantidade}x)</span>
                    <strong>R$ ${item.subtotal.toFixed(2)}</strong>
                </li>
            `;
        });

        // Taxa fixa de entrega
        const taxaEntrega = 5;

        lista.innerHTML += `
            <li>
                <span>Taxa de Entrega</span>
                <strong>R$ ${taxaEntrega.toFixed(2)}</strong>
            </li>
            <li class="total">
                <span>Total</span>
                <strong id="totalFinal">R$ ${(total + taxaEntrega).toFixed(2)}</strong>
            </li>
        `;

    } catch (err) {
        console.error("Erro ao carregar carrinho:", err);
        lista.innerHTML = "<li>Erro ao carregar itens.</li>";
    }
}



// =============================================
//  FINALIZAR PEDIDO
// =============================================
async function finalizarPedido() {
    alert("Pedido confirmado! (a rota de confirmar será adicionada depois)");

    // opcional: limpar carrinho no backend futuramente

    window.location.href = "pedido_confirmado.html";
}



// =============================================
//  INICIAR AO CARREGAR A PÁGINA
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    carregarCarrinho();

    const botao = document.querySelector("#btnConfirmarPedido");
    if (botao) {
        botao.addEventListener("click", finalizarPedido);
    }
});