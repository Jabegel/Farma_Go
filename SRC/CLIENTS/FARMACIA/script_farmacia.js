// =====================================================
//  VERIFICAR LOGIN (usa o mesmo localStorage da app)
// =====================================================
const usuarioFarm = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuarioFarm || !usuarioFarm.id) {
    alert("Você precisa estar logado para ver os produtos.");
    window.location.href = "/SRC/LOGINS/login.html";
}

// =====================================================
//  QUANDO A PÁGINA CARREGAR
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const farmaciaId = params.get("id");

    if (!farmaciaId) {
        alert("Farmácia não informada.");
        window.location.href = "inicio_usuario.html";
        return;
    }

    carregarNomeFarmacia(farmaciaId);
    carregarProdutos(farmaciaId);
});

// =====================================================
//  CARREGAR NOME DA FARMÁCIA
// =====================================================
function carregarNomeFarmacia(idFarmacia) {
    fetch(`http://127.0.0.1:3000/api/farmacia/${idFarmacia}`)
        .then(r => r.json())
        .then(dados => {
            const titulo = document.getElementById("nomeFarmacia");
            if (!dados || !dados.nome) {
                titulo.textContent = "Farmácia não encontrada";
            } else {
                titulo.textContent = dados.nome;
            }
        })
        .catch(err => {
            console.error("Erro ao buscar farmácia:", err);
            document.getElementById("nomeFarmacia").textContent =
                "Erro ao carregar farmácia.";
        });
}

// =====================================================
//  FAVORITOS (LOCALSTORAGE) - PRODUTOS
// =====================================================
function getFavoritosProdutos() {
    return JSON.parse(localStorage.getItem("favoritosProdutos")) || [];
}

function salvarFavoritosProdutos(lista) {
    localStorage.setItem("favoritosProdutos", JSON.stringify(lista));
}

function toggleFavorito(id_produto) {
    let favoritos = getFavoritosProdutos();

    if (favoritos.includes(id_produto)) {
        // remover
        favoritos = favoritos.filter(id => id !== id_produto);
    } else {
        // adicionar
        favoritos.push(id_produto);
    }

    salvarFavoritosProdutos(favoritos);
    pintarFavoritos();
}

function pintarFavoritos() {
    const favoritos = getFavoritosProdutos();

    // todos os botões de coração
    document.querySelectorAll(".fav-btn").forEach(btn => {
        const match = btn.dataset.idProduto;
        if (!match) return;

        const id = Number(match);

        if (favoritos.includes(id)) {
            btn.textContent = "❤️";
            btn.style.color = "red";
        } else {
            btn.textContent = "🤍";
            btn.style.color = "#888";
        }
    });
}

// =====================================================
//  CARREGAR PRODUTOS DA FARMÁCIA
// =====================================================
async function carregarProdutos(idFarmacia) {
    const lista = document.getElementById("listaProdutos");
    lista.innerHTML = "<p>Carregando produtos...</p>";

    try {
        const resp = await fetch(
            `http://127.0.0.1:3000/api/produtos?farmacia=${idFarmacia}`
        );
        const produtos = await resp.json();

        if (!produtos || produtos.length === 0) {
            lista.innerHTML = "<p>Essa farmácia ainda não cadastrou produtos.</p>";
            return;
        }

        lista.innerHTML = "";

        produtos.forEach(prod => {
            // monta o card do produto
            lista.innerHTML += `
    <div class="produto-card">

        <img src="/${prod.imagem}" class="produto-img">

        <div class="produto-info-top">
            <h3>${prod.nome}</h3>

            <button class="fav-btn" onclick='toggleFavorito(${JSON.stringify(prod)})'>
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

        // depois de desenhar todos, pinta os corações corretos
        pintarFavoritos();

    } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        lista.innerHTML = "<p>Erro ao carregar produtos.</p>";
    }
}

// =====================================================
//  ADICIONAR AO CARRINHO
// =====================================================
function adicionarCarrinho(id_produto) {
    fetch("http://127.0.0.1:3000/api/carrinho/adicionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_usuario: usuarioFarm.id,
            id_produto
        })
    })
        .then(r => r.json())
        .then(() => {
            alert("Adicionado ao carrinho!");
        })
        .catch(err => {
            console.error("Erro ao adicionar no carrinho:", err);
            alert("Erro ao adicionar no carrinho.");
        });
}
