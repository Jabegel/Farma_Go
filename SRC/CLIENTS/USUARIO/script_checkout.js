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

            // Garantir que subtotal seja número
            const subtotalNum = Number(item.subtotal);

            total += subtotalNum;

            lista.innerHTML += `
                <li>
                    <span>${item.nome} (${item.quantidade}x)</span>
                    <strong>R$ ${subtotalNum.toFixed(2)}</strong>

                    <!-- Botão remover -->
                    <button class="btn-remove"
                        onclick="removerItem(${item.id_produto})">
                        Remover
                    </button>
                </li>
            `;
        });

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
//  REMOVER ITEM DO CARRINHO
// =============================================
async function removerItem(id_produto) {

    if (!confirm("Remover este item?")) return;

    try {
        const req = await fetch("http://127.0.0.1:3000/api/carrinho/remover", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_usuario: usuario.id,
                id_produto
            })
        });

        const res = await req.json();

        if (res.success) {
            alert("Item removido!");
            carregarCarrinho(); // recarrega
        } else {
            alert(res.message || "Erro ao remover item.");
        }

    } catch (err) {
        console.error("Erro:", err);
        alert("Falha ao remover item.");
    }
}



// =============================================
//  FINALIZAR PEDIDO
// =============================================
async function finalizarPedido() {
    alert("Pedido confirmado! (a rota será criada depois)");
    window.location.href = "pedido_confirmado.html";
}



// =============================================
//  INICIAR AO CARREGAR A PÁGINA
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    carregarCarrinho();

    const botao = document.querySelector("#btnConfirmarPedido");
    if (botao) botao.addEventListener("click", finalizarPedido);
});
