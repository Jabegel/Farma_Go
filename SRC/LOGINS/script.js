document.getElementById("formLogin").addEventListener("submit", async function (e) {
    e.preventDefault();

    const login = document.getElementById("login").value;
    const senha = document.getElementById("senha").value;
    const tipoUsuario = document.getElementById("tipoUsuario").value;

    if (!login || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                login,
                senha,
                tipoUsuario
            })
        });

        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        // 🔥 SALVA O LOGIN LOCAL
        localStorage.setItem("id_usuario", data.id_usuario);
        localStorage.setItem("tipo_usuario", data.tipo);
        localStorage.setItem("nome_usuario", data.nome);

        console.log("Usuário logado:", data);

        // Redirecionar baseado no tipo
        switch (data.tipo) {
            case "cliente":
                window.location.href = "../USUARIO/inicio_usuario.html";
                break;
            case "farmacia":
                window.location.href = "../FARMACIA/inicio_farmacia.html";
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
                alert("Tipo de usuário inválido no banco!");
        }

    } catch (error) {
        console.error("Erro ao logar:", error);
        alert("Erro no servidor ao tentar realizar login.");
    }
});
