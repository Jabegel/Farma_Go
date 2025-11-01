document.getElementById("cadastroForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nomeExibicao = document.getElementById("nomeExibicao").value.trim();
  const loginNome = document.getElementById("loginNome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const confirmarSenha = document.getElementById("confirmarSenha").value.trim();
  const dataNascimento = document.getElementById("dataNascimento").value;
  const tipoConta = document.getElementById("tipoConta").value;

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
  }

  try {
    const resposta = await fetch("http://127.0.0.1:3000/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomeExibicao, loginNome, cpf, email, senha, dataNascimento, tipoConta })
    });

    const data = await resposta.json();
    alert(data.message);

    if (data.success) {
      window.location.href = "./login.html"; // redireciona para login após sucesso
    }

  } catch (error) {
    console.error("Erro no cadastro:", error);
    alert("Erro ao conectar com o servidor.");
  }
});
