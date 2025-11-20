// ======================================================
// FAVORITOS LOCALSTORAGE — NOVA VERSÃO
// ======================================================

function carregarFavoritos() {
    const lista = document.getElementById("listaFavoritos");

    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

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
            <div class="favorito-item">
                <img src="/${prod.imagem}" class="fav-img">

                <div class="fav-info">
                    <h3>${prod.nome}</h3>
                    <p>R$ ${prod.preco.toFixed(2)}</p>

                    <button class="btn-remover" onclick="removerFavorito(${prod.id_produto})">
                        Remover ❤️
                    </button>
                </div>
            </div>
        `;
    });
}

function removerFavorito(id) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    favoritos = favoritos.filter(f => f.id_produto !== id);

    localStorage.setItem("favoritos", JSON.stringify(favoritos));

    carregarFavoritos();
}

document.addEventListener("DOMContentLoaded", carregarFavoritos);
