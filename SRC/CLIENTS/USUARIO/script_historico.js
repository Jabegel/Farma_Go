const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario) {
    alert("Faça login!");
    location.href = "/SRC/LOGINS/login.html";
}

async function carregarHistorico() {
    const box = document.getElementById("listaPedidos");

    const req = await fetch(`http://127.0.0.1:3000/api/pedidos/${usuario.id}`);
    const pedidos = await req.json();

    if (!pedidos.length) {
        box.innerHTML = "<p>Você ainda não fez nenhum pedido.</p>";
        return;
    }

    box.innerHTML = "";

    pedidos.forEach(p => {
        let itensHTML = "";

        p.itens.forEach(i => {
            itensHTML += `
                <li>
                    ${i.nome} — ${i.quantidade}x (R$ ${(i.preco_unitario * i.quantidade).toFixed(2)})
                </li>
            `;
        });

        box.innerHTML += `
            <div class="pedido-card">
                <h3>Pedido #${p.id_pedido}</h3>
                <p><b>Data:</b> ${new Date(p.data_pedido).toLocaleString()}</p>
                <p><b>Pagamento:</b> ${p.pagamento}</p>
                <p><b>Total:</b> R$ ${p.total.toFixed(2)}</p>

                <p><b>Itens:</b></p>
                <ul>${itensHTML}</ul>
            </div>
        `;
    });
}

document.addEventListener("DOMContentLoaded", carregarHistorico);
