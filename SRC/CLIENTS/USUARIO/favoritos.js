// =============================================
//  VERIFICAR LOGIN
// =============================================
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario || !usuario.id) {
    alert("Você precisa estar logado!");
    window.location.href = "/SRC/LOGINS/login.html";
}


// =============================================
//  CARREGAR FAVORITOS DO USUÁRIO
// =============================================
async function carregarFavoritos() {

    const lista = document.getElementById("listaFavoritos");
    lista.innerHTML = "<p>Carregando favoritos...</p>";

    try {
        const req = await fetch(`http://127.0.0.1:3000/api/favoritos/${usuario.id}`);
        const itens = await req.json();

        if (!itens.length) {
            lista.innerHTML = `
                <p>Você não possui favoritos ainda.</p>
                <a href="inicio_usuario.html">Voltar à Loja</a>
            `;
            return;
        }

        lista.innerHTML = "";

        itens.forEach(prod => {
            lista.innerHTML += `
                <div class="favorito-item">
                    <img src="/IMG/${prod.imagem}" alt="${prod.nome}">

                    <div class="info">
                        <h3>${prod.nome}</h3>
                        <p class="preco">R$ ${Number(prod.preco).toFixed(2)}</p>

                        <button onclick="removerFavorito(${prod.id_produto})" class="btn-remover">
                            Remover dos Favoritos ❤️
                        </button>

                        <button onclick="verProduto(${prod.id_produto}, ${prod.id_farmacia})"
                            class="btn-ver">
                            Ver Produto
                        </button>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
        lista.innerHTML = "<p>Erro ao carregar favoritos...</p>";
    }
}



// =============================================
//  REMOVER FAVORITO
// =============================================
async function removerFavorito(id_produto) {

    try {
        await fetch("http://127.0.0.1:3000/api/favoritos/remover", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_usuario: usuario.id,
                id_produto
            })
        });

        carregarFavoritos();

    } catch (err) {
        console.log(err);
        alert("Erro ao remover dos favoritos.");
    }
}



// =============================================
//  REDIRECIONAR PARA A PÁGINA DO PRODUTO
// =============================================
function verProduto(id_produto, id_farmacia) {
    localStorage.setItem("produtoSelecionado", JSON.stringify({
        id_produto,
        id_farmacia
    }));

    window.location.href = "farmacia_produtos.html";
}



// =============================================
//  INICIALIZAR
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    carregarFavoritos();
});
