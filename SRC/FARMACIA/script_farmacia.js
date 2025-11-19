// ===============================
// PEGAR O ID DA FARMÁCIA DA URL
// ===============================
const params = new URLSearchParams(window.location.search);
const farmaciaId = params.get("id");

// Se não tiver ID, mostra erro
if (!farmaciaId) {
    const el = document.querySelector(".produtos-container");
    if (el) el.innerHTML = "<p>Erro: Nenhuma farmácia selecionada.</p>";
    throw new Error("ID da farmácia não encontrado");
}

// ===============================
// BUSCAR OS PRODUTOS DA FARMÁCIA
// ===============================
function carregarProdutos() {
    fetch(`http://127.0.0.1:3000/api/produtos?farmacia=${farmaciaId}`)
        .then(res => {
            if (!res.ok) throw new Error('Resposta do servidor não OK');
            return res.json();
        })
        .then(produtos => {
            const container = document.querySelector(".produtos-container");

            if (!container) {
                console.error("Container .produtos-container não encontrado");
                return;
            }

            if (!produtos || produtos.length === 0) {
                container.innerHTML = "<p>Esta farmácia ainda não cadastrou produtos.</p>";
                return;
            }

            container.innerHTML = ""; // Limpa antes de adicionar

            produtos.forEach(produto => {
                const precoFormat = Number(produto.preco).toFixed(2);
                const imagem = produto.imagem ? produto.imagem : '/SRC/IMG/placeholder.png';

                const card = document.createElement('article');
                card.className = 'card card-produto';

                card.innerHTML = `
                    <img src="${imagem}" class="card-image produto-img" alt="${produto.nome}">
                    <div class="card-content">
                        <h3>${produto.nome}</h3>
                        <p>${produto.descricao || ''}</p>
                        <p class="product-price"><strong>R$ ${precoFormat}</strong></p>
                        <button class="btn btn-primary btn-add" data-id="${produto.id_produto}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                `;

                container.appendChild(card);
            });

            // adicionar evento aos botões
            document.querySelectorAll('.btn-add').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    adicionarCarrinho(Number(id));
                });
            });
        })
        .catch(err => {
            console.error("Erro ao carregar produtos:", err);
            const container = document.querySelector(".produtos-container");
            if (container) container.innerHTML = "<p>Erro ao carregar produtos.</p>";
        });
}

// Chamar ao carregar a página
carregarProdutos();

// ===============================
// ADICIONAR AO CARRINHO
// ===============================
function adicionarCarrinho(idProduto) {

    const idUsuario = localStorage.getItem("id_usuario");
    if (!idUsuario) {
        alert("Você precisa estar logado para adicionar ao carrinho!");
        return;
    }

    fetch(`http://127.0.0.1:3000/api/carrinho/adicionar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_usuario: Number(idUsuario),
            id_produto: idProduto,
            quantidade: 1
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.success) {
                alert(data.message || "Produto adicionado ao carrinho!");
            } else {
                alert(data.message || "Não foi possível adicionar ao carrinho.");
            }
        })
        .catch(err => {
            console.error("Erro ao adicionar ao carrinho:", err);
            alert("Erro ao adicionar ao carrinho.");
        });
}
