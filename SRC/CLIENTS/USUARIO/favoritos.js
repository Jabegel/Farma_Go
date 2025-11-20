// ==========================
//  CARREGAR FAVORITOS
// ==========================
function carregarFavoritos() {
    const lista = document.getElementById("listaFavoritos");

    const favoritos = JSON.parse(localStorage.getItem("favoritosProdutos")) || [];

    if (favoritos.length === 0) {
        lista.innerHTML = `
            <p>Você não possui favoritos ainda.</p>
            <a href="inicio_usuario.html">Voltar à Loja</a>
        `;
        return;
    }

    lista.innerHTML = "";

    favoritos.forEach(prod => {
        lista.innerHTML += `
            <div class="produto-card favorito-item">

                <img src="/${prod.imagem}" class="produto-img">

                <h3>${prod.nome}</h3>

                <p>R$ ${Number(prod.preco).toFixed(2)}</p>

                <button class="btn-remover" onclick="removerFavorito(${prod.id_produto})">
                    Remover ❤️
                </button>

            </div>
        `;
    });
}

// ==========================
//  REMOVER FAVORITO
// ==========================
function removerFavorito(id) {
    let favoritos = JSON.parse(localStorage.getItem("favoritosProdutos")) || [];

    favoritos = favoritos.filter(p => p.id_produto !== id);

    localStorage.setItem("favoritosProdutos", JSON.stringify(favoritos));

    carregarFavoritos();
}

// ==========================
//  INICIAR
// ==========================
document.addEventListener("DOMContentLoaded", carregarFavoritos);
