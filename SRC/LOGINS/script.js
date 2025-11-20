document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const login = document.getElementById("loginUser").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();
  const tipoRadio = document.querySelector('input[name="tipoUsuario"]:checked');
  const tipoUsuario = tipoRadio ? tipoRadio.value : null; // pode ser null

  try {
    const resposta = await fetch("http://127.0.0.1:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, senha, tipoUsuario })
    });

    const data = await resposta.json();

    if (!data.success) {
      alert("⚠️ " + (data.message || "Usuário ou senha incorretos!"));
      return;
    }

    // ⭐ SALVAR O USUÁRIO AQUI ⭐
    localStorage.setItem("usuarioLogado", JSON.stringify({
      id: data.id_usuario,
      nome: data.nome,
      tipo: data.tipo
    }));

    // Redirecionamento conforme tipo real do banco
    switch (data.tipo) {
  case "cliente":
    window.location.href = "../CLIENTS/USUARIO/inicio_usuario.html";
    break;

  case "farmacia":
    window.location.href = "../CLIENTS/FARMACIA/inicio_farmacia.html";
    break;

  case "entregador":
    window.location.href = "../CLIENTS/ENTREGADOR/inicio_entregador.html";
    break;

  case "farmaceutico":
    window.location.href = "../CLIENTS/FARMACEUTICO/inicio_farmaceutico.html";
    break;

  case "admin":
    window.location.href = "../MAX_ADMIN/inicio_admin.html";
    break;

  default:
    alert("Tipo de usuário inválido.");
}


  } catch (error) {
    console.error("❌ Erro no login:", error);
    alert("Erro ao conectar com o servidor.");
  }
});