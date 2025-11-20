// ===============================
//  VERIFICAR LOGIN
// ===============================
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario || !usuario.id) {
  alert("Você precisa estar logado!");
  window.location.href = "/SRC/LOGINS/login.html";
}

// ===============================
//  UTIL: mascarar número do cartão
// ===============================
function mascararNumero(numero) {
  const limpo = numero.replace(/\D/g, "");
  if (limpo.length <= 4) return limpo;
  const ultimos = limpo.slice(-4);
  return "**** **** **** " + ultimos;
}

// ===============================
//  CARREGAR PERFIL
// ===============================
async function carregarPerfil() {
  try {
    const req = await fetch(`http://127.0.0.1:3000/api/usuario/${usuario.id}`);
    const data = await req.json();

    document.getElementById("nome").value = data.nome || "";
    document.getElementById("apelido").value = data.apelido || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("dataNascimento").value = data.data_nascimento
      ? data.data_nascimento.split("T")[0]  // caso venha com hora
      : "";

    document.getElementById("alergias").value = data.alergias || "";
    document.getElementById("obsMedicas").value = data.obs_medicas || "";

    document.getElementById("tituloNome").textContent = data.apelido || data.nome || "Usuário";
    document.getElementById("badgeTipo").textContent = data.tipo || "Cliente";

    if (data.foto_perfil) {
      document.getElementById("fotoPerfil").src = `http://127.0.0.1:3000/${data.foto_perfil}`;
    }
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
}

// ===============================
//  SALVAR DADOS BÁSICOS
// ===============================
async function salvarPerfil() {
  const body = {
    id_usuario: usuario.id,
    nome: document.getElementById("nome").value,
    apelido: document.getElementById("apelido").value,
    data_nascimento: document.getElementById("dataNascimento").value
  };

  const req = await fetch("http://127.0.0.1:3000/api/usuario/atualizar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const res = await req.json();
  if (!res.success) {
    alert("Erro ao salvar dados: " + res.message);
    return;
  }

  alert("Dados atualizados!");
  carregarPerfil();
}

// ===============================
//  SALVAR INFO MÉDICA
// ===============================
async function salvarMedico() {
  const body = {
    id_usuario: usuario.id,
    alergias: document.getElementById("alergias").value,
    obs_medicas: document.getElementById("obsMedicas").value
  };

  const req = await fetch("http://127.0.0.1:3000/api/usuario/medico", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const res = await req.json();
  if (!res.success) {
    alert("Erro ao salvar informações médicas: " + res.message);
    return;
  }

  alert("Informações médicas atualizadas!");
}

// ===============================
//  FOTO DE PERFIL
// ===============================
const inputFoto = document.getElementById("uploadFoto");
if (inputFoto) {
  inputFoto.addEventListener("change", async (e) => {
    if (!e.target.files[0]) return;

    const form = new FormData();
    form.append("id_usuario", usuario.id);
    form.append("foto", e.target.files[0]);

    const req = await fetch("http://127.0.0.1:3000/api/usuario/foto", {
      method: "POST",
      body: form
    });

    const res = await req.json();
    if (!res.success) {
      alert("Erro ao enviar foto: " + res.message);
      return;
    }

    alert("Foto atualizada!");
    carregarPerfil();
  });
}

// ===============================
//  ENDEREÇOS
// ===============================
async function carregarEnderecosPerfil() {
  const box = document.getElementById("listaEnderecos");
  box.innerHTML = "Carregando...";

  const req = await fetch(`http://127.0.0.1:3000/api/enderecos/${usuario.id}`);
  const lista = await req.json();

  if (!lista.length) {
    box.innerHTML = "<p>Você ainda não cadastrou endereços.</p>";
    return;
  }

  box.innerHTML = "";
  lista.forEach(e => {
    box.innerHTML += `
      <div class="endereco-item">
        <strong>${e.rua}, ${e.numero}</strong> — ${e.bairro}<br>
        ${e.cidade} - ${e.estado} <br>
        CEP: ${e.cep}
        <br>
        <button class="btn btn-secondary" onclick="removerEnderecoPerfil(${e.id_endereco})">Remover</button>
      </div>
    `;
  });
}

async function removerEnderecoPerfil(id_endereco) {
  if (!confirm("Remover este endereço?")) return;

  await fetch("http://127.0.0.1:3000/api/enderecos/remover", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_endereco,
      id_usuario: usuario.id
    })
  });

  carregarEnderecosPerfil();
}

// ===============================
//  CARTÕES
// ===============================
async function carregarCartoes() {
  const box = document.getElementById("listaCartoes");
  box.innerHTML = "Carregando...";

  const req = await fetch(`http://127.0.0.1:3000/api/cartoes/${usuario.id}`);
  const lista = await req.json();

  if (!lista.length) {
    box.innerHTML = "<p>Nenhum cartão salvo.</p>";
    return;
  }

  box.innerHTML = "";
  lista.forEach(c => {
    box.innerHTML += `
      <div class="cartao-item">
        <strong>${c.numero_mascarado}</strong><br>
        ${c.nome_impresso} — ${c.bandeira || "Cartão"}<br>
        Validade: ${String(c.validade_mes).padStart(2,"0")}/${c.validade_ano}
        <br>
        <button class="btn btn-secondary" onclick="removerCartao(${c.id_cartao})">Remover</button>
      </div>
    `;
  });
}

async function salvarCartao() {
  const nome = document.getElementById("nomeCartao").value.trim();
  const numero = document.getElementById("numeroCartao").value.trim();
  const bandeira = document.getElementById("bandeiraCartao").value.trim();
  const mes = parseInt(document.getElementById("mesValidade").value);
  const ano = parseInt(document.getElementById("anoValidade").value);

  if (!nome || !numero || !mes || !ano) {
    alert("Preencha nome, número, mês e ano.");
    return;
  }

  const mascarado = mascararNumero(numero);

  const body = {
    id_usuario: usuario.id,
    nome_impresso: nome,
    numero_mascarado: mascarado,
    bandeira,
    validade_mes: mes,
    validade_ano: ano
  };

  const req = await fetch("http://127.0.0.1:3000/api/cartoes/adicionar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const res = await req.json();
  if (!res.success) {
    alert("Erro ao salvar cartão: " + res.message);
    return;
  }

  document.getElementById("numeroCartao").value = "";
  alert("Cartão salvo!");
  carregarCartoes();
}

async function removerCartao(id_cartao) {
  if (!confirm("Remover este cartão?")) return;

  await fetch("http://127.0.0.1:3000/api/cartoes/remover", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_cartao, id_usuario: usuario.id })
  });

  carregarCartoes();
}

// ===============================
//  INICIAR
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnSalvarPerfil").addEventListener("click", salvarPerfil);
  document.getElementById("btnSalvarMedico").addEventListener("click", salvarMedico);
  document.getElementById("btnSalvarCartao").addEventListener("click", salvarCartao);

  carregarPerfil();
  carregarEnderecosPerfil();
  carregarCartoes();
});

// Deixar as funções globais para os botões inline
window.removerEnderecoPerfil = removerEnderecoPerfil;
window.removerCartao = removerCartao;
