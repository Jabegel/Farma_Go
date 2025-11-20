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
//  FAVORITOS - LOCALSTORAGE
// =====================================================
function getFavoritosProdutos() {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    return JSON.parse(localStorage.getItem(`favoritosProdutos_${usuario.id}`)) || [];
}


function salvarFavoritosProdutos(lista) {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    localStorage.setItem(`favoritosProdutos_${usuario.id}`, JSON.stringify(lista));
}


function toggleFavorito(produto) {

    let favoritos = getFavoritosProdutos();

    const existe = favoritos.find(f => f.id_produto === produto.id_produto);

    if (existe) {
        favoritos = favoritos.filter(f => f.id_produto !== produto.id_produto);
    } else {
        favoritos.push(produto);
    }

    salvarFavoritosProdutos(favoritos);
    pintarFavoritos();
}

function pintarFavoritos() {
    const favoritos = getFavoritosProdutos();

    document.querySelectorAll(".fav-btn").forEach(btn => {

        const id = Number(btn.dataset.idProduto);
        const estaNosFavoritos = favoritos.some(f => f.id_produto === id);

        if (estaNosFavoritos) {
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

            lista.innerHTML += `
                <div class="produto-card">

                    <img src="/${prod.imagem}" class="produto-img">

                    <div class="produto-info-top">
                        <h3>${prod.nome}</h3>

                        <button class="fav-btn"
                                data-id-produto="${prod.id_produto}"
                                onclick='toggleFavorito(${JSON.stringify(prod)})'>
                            🤍
                        </button>
                    </div>

                    <p>${prod.descricao || ""}</p>

                    <strong>R$ ${Number(prod.preco).toFixed(2)}</strong>

                    <button class="btn" onclick="adicionarCarrinho(${prod.id_produto})">
                        Adicionar ao Carrinho
                    </button>

                </div>
            `;
        });

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
