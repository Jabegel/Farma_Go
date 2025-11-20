// ============================================
// VERIFICAR LOGIN
// ============================================
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) {
    alert("Você precisa estar logado.");
    window.location.href = "/SRC/LOGINS/login.html";
}

// ============================================
// PEGAR ID DA FARMÁCIA
// ============================================
const url = new URLSearchParams(window.location.search);
const farmaciaId = url.get("id");

// ============================================
// CARREGAR PRODUTOS
// ============================================
async function carregarProdutos() {
    const lista = document.getElementById("listaProdutos");

    const req = await fetch(`http://127.0.0.1:3000/api/produtos?farmacia=${farmaciaId}`);
    const produtos = await req.json();

    lista.innerHTML = "";

    produtos.forEach(prod => {
        lista.innerHTML += `
            <div class="produto-card">

                <img src="/${prod.imagem}" class="produto-img">

                <div class="produto-info-top">
                    <h3>${prod.nome}</h3>

                    <button class="fav-btn" onclick="toggleFavorito(${prod.id_produto})">
                        🤍
                    </button>
                </div>

                <p>${prod.descricao || ""}</p>

                <strong>R$ ${prod.preco.toFixed(2)}</strong>

                <button class="btn" onclick="adicionarCarrinho(${prod.id_produto})">
                    Adicionar ao Carrinho
                </button>
            </div>
        `;
    });

    pintarFavoritos();
}

// ============================================
// FAVORITOS LOCALSTORAGE
// ============================================
function toggleFavorito(id_produto) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if (favoritos.includes(id_produto)) {
        favoritos = favoritos.filter(id => id !== id_produto);
    } else {
        favoritos.push(id_produto);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    pintarFavoritos();
}

function pintarFavoritos() {
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    document.querySelectorAll(".fav-btn").forEach(btn => {
        const produtoId = Number(btn.getAttribute("onclick").match(/\((.*?)\)/)[1]);

        if (favoritos.includes(produtoId)) {
            btn.textContent = "❤️";
            btn.style.color = "red";
        } else {
            btn.textContent = "🤍";
            btn.style.color = "#888";
        }
    });
}

// ============================================
// CARRINHO
// ============================================
function adicionarCarrinho(id_produto) {
    fetch("http://127.0.0.1:3000/api/carrinho/adicionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_usuario: usuario.id,
            id_produto
        })
    });

    alert("Adicionado ao carrinho!");
}

// ============================================
// INICIAR
// ============================================
document.addEventListener("DOMContentLoaded", carregarProdutos);
