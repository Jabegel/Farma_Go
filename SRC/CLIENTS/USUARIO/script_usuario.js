async function comprarItem(idUsuario, idFarmacia, nomeItem) {
  const quantidade = parseInt(document.getElementById('quantidadeDipirona').value);

  if (isNaN(quantidade) || quantidade <= 0) {
    alert('Informe uma quantidade válida.');
    return;
  }

  try {
    const resposta = await fetch('http://127.0.0.1:3000/comprar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: idUsuario,
        id_farmacia: idFarmacia,
        item: nomeItem,
        quantidade
      })
    });

    const data = await resposta.json();

    if (data.success) {
      alert(`✅ Compra registrada: ${quantidade}x ${nomeItem}`);
    } else {
      alert(`❌ Erro: ${data.message}`);
    }
  } catch (error) {
    console.error('Erro ao registrar compra:', error);
    alert('Falha na conexão com o servidor.');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("listaCompras")) {
    carregarCompras();
  }
});