// Espera o HTML ser totalmente carregado antes de fazer qualquer coisa
document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Encontra o seu formulário de login pelo ID
  const loginForm = document.getElementById("loginForm");

  // 2. Adiciona um "ouvinte" para quando o botão "Entrar" (submit) for clicado
  loginForm.addEventListener("submit", (event) => {
    
    // 3. A LINHA MAIS IMPORTANTE:
    // Impede que a página recarregue sozinha (o que faz parecer que "nada aconteceu")
    event.preventDefault(); 

    // 4. Pega os valores que o usuário digitou nos campos
    const loginUser = document.getElementById("loginUser").value;
    const loginSenha = document.getElementById("loginSenha").value;

    // 5. Prepara para enviar os dados para o seu Backend
    const dadosLogin = {
      login: loginUser,
      senha: loginSenha
      // OBS: Seu backend também espera um 'tipoUsuario'
      // Se você tiver um <select> ou radio button no HTML, capture o valor
      // e adicione aqui, por exemplo: tipoUsuario: valorDoSeletor
    };

    // 6. Envia os dados para o Backend (O "Porteiro")
    // Note o endereço completo: 'http://127.0.0.1:3000/login'
    fetch('http://127.0.0.1:3000/login', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosLogin),
    })
    .then(response => response.json()) // Converte a resposta do servidor de texto para JSON
    .then(data => {
      // 7. Recebe a resposta do servidor (o 'data' é o { success: true, ... } ou { success: false, ... })
      
      if (data.success) {
        // Deu certo!
        alert('Login bem-sucedido! Tipo: ' + data.tipo);
        
        // **AQUI VOCÊ REDIRECIONA O USUÁRIO**
        // Exemplo:
        // if (data.tipo === 'admin') {
        //   window.location.href = 'admin.html'; // Leva o admin para a página de admin
        // } else {
        //   window.location.href = 'pagina_cliente.html'; // Leva os outros para a página de cliente
        // }

      } else {
        // O servidor disse que deu errado (data.success === false)
        alert('Erro: ' + data.message); // Mostra a mensagem de erro vinda do backend (ex: "Usuário ou senha incorretos!")
      }
    })
    .catch(error => {
      // Isso acontece se o servidor estiver DESLIGADO ou houver um erro de rede
      console.error('Erro na requisição:', error);
      alert('Não foi possível conectar ao servidor. Verifique o console (F12).');
    });
  });
});