document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const login = document.getElementById("loginUser").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();
  const tipoRadio = document.querySelector('input[name="tipoUsuario"]:checked');
  const tipoUsuario = tipoRadio ? tipoRadio.value : null;

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

    // ⭐ SALVAR LOGIN AQUI ⭐
    localStorage.setItem("usuarioLogado", JSON.stringify({
      id: data.id,
      nome: data.nome,
      tipo: data.tipo
    }));

    // Redireciona conforme o tipo
    switch (data.tipo) {
      case "cliente":
        window.location.href = "../USUARIO/inicio_usuario.html";
        break;
      case "farmacia":
        window.location.href = "./FARMACIA/inicio_farmacia.html";
        break;
      case "entregador":
        window.location.href = "./ENTREGADOR/inicio_entregador.html";
        break;
      case "farmaceutico":
        window.location.href = "./FARMACEUTICO/inicio_farmaceutico.html";
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
