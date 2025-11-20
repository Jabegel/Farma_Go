// =============================================
//  🔐 VERIFICAR LOGIN DO USUÁRIO
// =============================================
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario) {
    alert("Você precisa estar logado!");
    window.location.href = "../LOGINS/login.html";
}

console.log("Usuário logado:", usuario);


// =============================================
//  PEGAR O ID DA FARMÁCIA DA URL
// =============================================
document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const farmaciaId = params.get("id");

    if (!farmaciaId) {
        document.querySelector(".produtos-container").innerHTML =
            "<p>Erro: Nenhuma farmácia selecionada.</p>";
        return;
    }

    carregarNomeFarmacia(farmaciaId);
    carregarProdutos(farmaciaId);
});


// =============================================
//  BUSCAR NOME DA FARMÁCIA
// =============================================
function carregarNomeFarmacia(farmaciaId) {
    fetch(`http://127.0.0.1:3000/api/farmacia/${farmaciaId}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("nomeFarmacia").innerText =
                data.nome || "Farmácia";
        })
        .catch(err => {
            console.error("Erro ao carregar nome:", err);
            document.getElementById("nomeFarmacia").innerText = "Farmácia";
        });
}


// =============================================
//  BUSCAR OS PRODUTOS DA FARMÁCIA
// =============================================
function carregarProdutos(farmaciaId) {

    fetch(`http://127.0.0.1:3000/api/produtos?farmacia=${farmaciaId}`)
        .then(res => res.json())
        .then(produtos => {

            const container = document.querySelector(".produtos-container");

            if (!produtos.length) {
                container.innerHTML = "<p>Esta farmácia ainda não cadastrou produtos.</p>";
                return;
            }

            container.innerHTML = "";

            produtos.forEach(produto => {

                const card = `
                    <article class="card card-produto">
                        <img src="${produto.imagem || '/SRC/IMG/placeholder.png'}" 
                             class="card-image produto-img">

                        <div class="card-content">
                            <h3>${produto.nome}</h3>
                            <p>${produto.descricao || ""}</p>
                            <p class="product-price"><strong>R$ ${Number(produto.preco).toFixed(2)}</strong></p>

                            <button class="btn btn-primary btn-add" onclick="adicionarCarrinho(${produto.id_produto})">
                                Adicionar ao Carrinho
                            </button>
                        </div>
                    </article>
                `;

                container.innerHTML += card;
            });
        })
        .catch(err => {
            console.error(err);
            document.querySelector(".produtos-container").innerHTML =
                "<p>Erro ao carregar produtos.</p>";
        });
}


// =============================================
//  ADICIONAR ITEM AO CARRINHO
// =============================================
function adicionarCarrinho(idProduto) {

    if (!usuario || !usuario.id) {
        alert("Você precisa estar logado!");
        return;
    }

    fetch("http://127.0.0.1:3000/api/carrinho/adicionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_usuario: usuario.id,
            id_produto: idProduto,
            quantidade: 1
        })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message || "Item adicionado ao carrinho!");
        })
        .catch(err => {
            console.error("Erro ao adicionar ao carrinho:", err);
            alert("Erro ao adicionar ao carrinho.");
        });
}
