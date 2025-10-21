document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();

  try {
    const resposta = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await resposta.json();

    if (!data.success) {
      alert(data.message);
      return;
    }

    const tipo = data.tipo;

    // Redireciona conforme o tipo
    switch (tipo) {
      case 'cliente':
        window.location.href = './USUARIO/inicio.html';
        break;
      case 'farmacia':
        window.location.href = './FARMACIA/inicio_farmacia.html';
        break;
      case 'entregador':
        window.location.href = './ENTREGADOR/inicio_entregador.html';
        break;
      case 'farmaceutico':
        window.location.href = './FARMACEUTICO/inicio_farmaceutico.html';
        break;
      case 'admin':
        window.location.href = './MAX_ADMIN/inicio_admin.html';
        break;
      default:
        alert('Tipo de usuário inválido.');
    }

  } catch (error) {
    console.error('Erro no login:', error);
    alert('Erro ao conectar com o servidor.');
  }
});
