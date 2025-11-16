// ===============================
// PEGAR O ID DA FARMÁCIA DA URL
// ===============================
const params = new URLSearchParams(window.location.search);
const farmaciaId = params.get("id");

// Se não tiver ID, mostra erro
if (!farmaciaId) {
    document.querySelector(".produtos-container").innerHTML =
        "<p>Erro: Nenhuma farmácia selecionada.</p>";
    throw new Error("ID da farmácia não encontrado");
}

// ===============================
// BUSCAR OS PRODUTOS DA FARMÁCIA
// ===============================
function carregarProdutos() {
    fetch(`/api/produtos?farmacia=${farmaciaId}`)
        .then(res => res.json())
        .then(produtos => {
            const container = document.querySelector(".produtos-container");

            if (!produtos || produtos.length === 0) {
                container.innerHTML = "<p>Esta farmácia ainda não cadastrou produtos.</p>";
                return;
            }

            container.innerHTML = ""; // Limpa antes de adicionar

            produtos.forEach(produto => {
                container.innerHTML += `
                    <div class="card-produto">
                        <img src="${produto.imagem}" class="produto-img">
                        <h3>${produto.nome}</h3>
                        <p>${produto.descricao}</p>
                        <p><strong>R$ ${produto.preco.toFixed(2)}</strong></p>
                        <button class="btn-add" onclick="adicionarCarrinho(${produto.id_produto})">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                `;
            });
        })
        .catch(err => {
            console.error("Erro ao carregar produtos:", err);
            document.querySelector(".produtos-container").innerHTML =
                "<p>Erro ao carregar produtos.</p>";
        });
}

// Chamar ao carregar a página
carregarProdutos();

// ===============================
// ADICIONAR AO CARRINHO
// ===============================
function adicionarCarrinho(idProduto) {
    fetch("/api/carrinho/adicionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_produto: idProduto })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.mensagem || "Produto adicionado ao carrinho!");
    })
    .catch(err => console.error("Erro ao adicionar ao carrinho:", err));
}
