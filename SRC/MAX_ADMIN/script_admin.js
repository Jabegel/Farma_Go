// =============================
// Redirecionamento dos Cards (Tela Principal - inicio_admin.html)
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".module-card");
  if (cards.length > 0) {
    cards.forEach(card => {
      card.addEventListener("click", () => {
        const target = card.getAttribute("data-target");
        if (target) window.location.href = target;
      });
    });
  }
});

// =============================
// Funcionalidades da Página de Farmácias (farmacias_admin.html)
// =============================
document.addEventListener("DOMContentLoaded", () => {
  // Verifica se estamos na página de farmácias
  if (document.getElementById("listaFarmacias")) {
    carregarFarmacias();
  }

  // Salvar alterações do modal
  const btnSalvar = document.getElementById('salvarEdicao');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', async () => {
      const id = document.getElementById('editId').value;
      const nome = document.getElementById('editNome').value;
      const endereco = document.getElementById('editEndereco').value;
      const cep = document.getElementById('editCep').value;
      const cnpj = document.getElementById('editCnpj').value;
      const telefone = document.getElementById('editTelefone').value;
      const email = document.getElementById('editEmail').value;

      try {
        const resposta = await fetch(`http://127.0.0.1:3000/admin/farmacias/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, endereco, cep, cnpj, telefone, email })
        });

        const data = await resposta.json();
        alert(data.message);
        carregarFarmacias();

        const modal = bootstrap.Modal.getInstance(document.getElementById('editarModal'));
        modal.hide();
      } catch (error) {
        console.error("Erro ao salvar edição:", error);
        alert("Erro ao salvar alterações.");
      }
    });
  }
});

// =============================
// Função: Carregar Farmácias
// =============================
async function carregarFarmacias() {
  try {
    const resposta = await fetch('http://127.0.0.1:3000/admin/farmacias');
    const farmacias = await resposta.json();

    const tbody = document.getElementById('listaFarmacias');
    tbody.innerHTML = '';

    farmacias.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${f.nome}</td>
        <td>${f.endereco || '-'}</td>
        <td>${f.cep || '-'}</td>
        <td>${f.cnpj || '-'}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="abrirModal(${f.id_farmacia})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deletarFarmacia(${f.id_farmacia})"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar farmácias:", error);
  }
}

// =============================
// Função: Abrir Modal para Edição
// =============================
async function abrirModal(id) {
  try {
    const resposta = await fetch('http://127.0.0.1:3000/admin/farmacias');
    const farmacias = await resposta.json();
    const f = farmacias.find(x => x.id_farmacia === id);

    if (!f) return alert("Erro: farmácia não encontrada.");

    document.getElementById('editId').value = f.id_farmacia;
    document.getElementById('editNome').value = f.nome;
    document.getElementById('editEndereco').value = f.endereco || '';
    document.getElementById('editCep').value = f.cep || '';
    document.getElementById('editCnpj').value = f.cnpj || '';
    document.getElementById('editTelefone').value = f.telefone || '';
    document.getElementById('editEmail').value = f.email || '';

    const modal = new bootstrap.Modal(document.getElementById('editarModal'));
    modal.show();
  } catch (error) {
    console.error("Erro ao abrir modal:", error);
  }
}

// =============================
// Função: Deletar Farmácia
// =============================
async function deletarFarmacia(id) {
  if (!confirm('Tem certeza que deseja excluir esta farmácia?')) return;

  try {
    const resposta = await fetch(`http://127.0.0.1:3000/admin/farmacias/${id}`, { method: 'DELETE' });
    const data = await resposta.json();
    alert(data.message);
    carregarFarmacias();
  } catch (error) {
    console.error("Erro ao deletar farmácia:", error);
    alert("Erro ao excluir a farmácia.");
  }
}

// =============================
// Funcionalidades da Página de Usuários (usuarios_admin.html)
// =============================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("listaUsuarios")) {
    carregarUsuarios();
  }

  const btnSalvarUsuario = document.getElementById('salvarEdicaoUsuario');
  if (btnSalvarUsuario) {
    btnSalvarUsuario.addEventListener('click', async () => {
      const id = document.getElementById('editUserId').value;
      const nome = document.getElementById('editUserNome').value;
      const login = document.getElementById('editUserLogin').value;
      const email = document.getElementById('editUserEmail').value;
      const tipo = document.getElementById('editUserTipo').value;

      try {
        const resposta = await fetch(`http://127.0.0.1:3000/admin/usuarios/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, login, email, tipo })
        });

        const data = await resposta.json();
        alert(data.message);
        carregarUsuarios();

        const modal = bootstrap.Modal.getInstance(document.getElementById('editarUsuarioModal'));
        modal.hide();
      } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
      }
    });
  }
});

async function carregarUsuarios() {
  try {
    const resposta = await fetch('http://127.0.0.1:3000/admin/usuarios');
    const usuarios = await resposta.json();

    const tbody = document.getElementById('listaUsuarios');
    tbody.innerHTML = '';

    usuarios.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.nome}</td>
        <td>${u.login}</td>
        <td>${u.tipo}</td>
        <td>${u.email || '-'}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="abrirModalUsuario(${u.id})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deletarUsuario(${u.id})"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
  }
}

// Abrir modal de edição
async function abrirModalUsuario(id) {
  const resposta = await fetch('http://127.0.0.1:3000/admin/usuarios');
  const usuarios = await resposta.json();
  const u = usuarios.find(x => x.id === id);

  document.getElementById('editUserId').value = u.id;
  document.getElementById('editUserNome').value = u.nome;
  document.getElementById('editUserLogin').value = u.login;
  document.getElementById('editUserEmail').value = u.email || '';
  document.getElementById('editUserTipo').value = u.tipo;

  const modal = new bootstrap.Modal(document.getElementById('editarUsuarioModal'));
  modal.show();
}

// Deletar usuário
async function deletarUsuario(id) {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

  const resposta = await fetch(`http://127.0.0.1:3000/admin/usuarios/${id}`, { method: 'DELETE' });
  const data = await resposta.json();

  alert(data.message);
  carregarUsuarios();
}

// =============================
// Funcionalidades da Página de Entregadores (entregadores_admin.html)
// =============================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("listaEntregadores")) {
    carregarEntregadores();
  }

  const btnSalvarEntregador = document.getElementById('salvarEdicaoEntregador');
  if (btnSalvarEntregador) {
    btnSalvarEntregador.addEventListener('click', async () => {
      const id = document.getElementById('editEntregadorId').value;
      const nome = document.getElementById('editEntregadorNome').value;
      const login = document.getElementById('editEntregadorLogin').value;
      const cpf = document.getElementById('editEntregadorCpf').value;
      const telefone = document.getElementById('editEntregadorTelefone').value;
      const veiculo = document.getElementById('editEntregadorVeiculo').value;
      const email = document.getElementById('editEntregadorEmail').value;

      const resposta = await fetch(`http://127.0.0.1:3000/admin/entregadores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, login, cpf, telefone, veiculo, email })
      });

      const data = await resposta.json();
      alert(data.message);
      carregarEntregadores();

      const modal = bootstrap.Modal.getInstance(document.getElementById('editarEntregadorModal'));
      modal.hide();
    });
  }
});

async function carregarEntregadores() {
  const resposta = await fetch('http://127.0.0.1:3000/admin/entregadores');
  const entregadores = await resposta.json();

  const tbody = document.getElementById('listaEntregadores');
  tbody.innerHTML = '';

  entregadores.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.nome}</td>
      <td>${e.login}</td>
      <td>${e.cpf || '-'}</td>
      <td>${e.telefone || '-'}</td>
      <td>${e.veiculo || '-'}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick="abrirModalEntregador(${e.id_entregador})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deletarEntregador(${e.id_entregador})"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Abrir modal
async function abrirModalEntregador(id) {
  const resposta = await fetch('http://127.0.0.1:3000/admin/entregadores');
  const entregadores = await resposta.json();
  const e = entregadores.find(x => x.id_entregador === id);

  document.getElementById('editEntregadorId').value = e.id_entregador;
  document.getElementById('editEntregadorNome').value = e.nome;
  document.getElementById('editEntregadorLogin').value = e.login;
  document.getElementById('editEntregadorCpf').value = e.cpf || '';
  document.getElementById('editEntregadorTelefone').value = e.telefone || '';
  document.getElementById('editEntregadorVeiculo').value = e.veiculo || '';
  document.getElementById('editEntregadorEmail').value = e.email || '';

  const modal = new bootstrap.Modal(document.getElementById('editarEntregadorModal'));
  modal.show();
}

// Excluir entregador
async function deletarEntregador(id) {
  if (!confirm('Tem certeza que deseja excluir este entregador?')) return;

  const resposta = await fetch(`http://127.0.0.1:3000/admin/entregadores/${id}`, { method: 'DELETE' });
  const data = await resposta.json();

  alert(data.message);
  carregarEntregadores();
}

// =============================
// Funcionalidades da Página de Farmacêuticos
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const btnFarmaceuticos = document.getElementById("btnFarmaceuticos");
  const btnReceitas = document.getElementById("btnReceitas");
  const conteudo = document.getElementById("conteudoFarmaceutico");

  if (btnFarmaceuticos && btnReceitas) {
    btnFarmaceuticos.addEventListener("click", () => {
      btnFarmaceuticos.classList.add("active");
      btnReceitas.classList.remove("active");
      carregarFarmaceuticos();
    });

    btnReceitas.addEventListener("click", () => {
      btnReceitas.classList.add("active");
      btnFarmaceuticos.classList.remove("active");
      carregarReceitas();
    });

    carregarFarmaceuticos(); // inicia na aba Farmacêuticos
  }
});

// =============================
// FARMACÊUTICOS
// =============================
async function carregarFarmaceuticos() {
  const resposta = await fetch("http://127.0.0.1:3000/admin/farmaceuticos");
  const farmac = await resposta.json();

  const conteudo = document.getElementById("conteudoFarmaceutico");
  conteudo.innerHTML = `
    <h4 class="text-center mb-3">Farmacêuticos Cadastrados</h4>
    <table class="table table-hover align-middle">
      <thead class="table-primary">
        <tr>
          <th>Nome</th>
          <th>Login</th>
          <th>CRM</th>
          <th>E-mail</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="listaFarmaceuticos"></tbody>
    </table>
  `;

  const tbody = document.getElementById("listaFarmaceuticos");
  farmac.forEach(f => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${f.nome}</td>
      <td>${f.login}</td>
      <td>${f.crm || '-'}</td>
      <td>${f.email || '-'}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick="abrirModalFarmaceutico(${f.id_farmaceutico})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deletarFarmaceutico(${f.id_farmaceutico})"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Modal
async function abrirModalFarmaceutico(id) {
  const resposta = await fetch("http://127.0.0.1:3000/admin/farmaceuticos");
  const farmac = await resposta.json();
  const f = farmac.find(x => x.id_farmaceutico === id);

  document.getElementById("editFarmaceuticoId").value = f.id_farmaceutico;
  document.getElementById("editFarmaceuticoNome").value = f.nome;
  document.getElementById("editFarmaceuticoLogin").value = f.login;
  document.getElementById("editFarmaceuticoCrm").value = f.crm || "";
  document.getElementById("editFarmaceuticoEmail").value = f.email || "";

  const modal = new bootstrap.Modal(document.getElementById("editarFarmaceuticoModal"));
  modal.show();
}

// Salvar edição
document.addEventListener("click", async e => {
  if (e.target && e.target.id === "salvarEdicaoFarmaceutico") {
    const id = document.getElementById("editFarmaceuticoId").value;
    const nome = document.getElementById("editFarmaceuticoNome").value;
    const login = document.getElementById("editFarmaceuticoLogin").value;
    const crm = document.getElementById("editFarmaceuticoCrm").value;
    const email = document.getElementById("editFarmaceuticoEmail").value;

    const resposta = await fetch(`http://127.0.0.1:3000/admin/farmaceuticos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, login, crm, email })
    });

    const data = await resposta.json();
    alert(data.message);
    carregarFarmaceuticos();

    const modal = bootstrap.Modal.getInstance(document.getElementById("editarFarmaceuticoModal"));
    modal.hide();
  }
});

// Excluir
async function deletarFarmaceutico(id) {
  if (!confirm("Tem certeza que deseja excluir este farmacêutico?")) return;

  const resposta = await fetch(`http://127.0.0.1:3000/admin/farmaceuticos/${id}`, { method: "DELETE" });
  const data = await resposta.json();

  alert(data.message);
  carregarFarmaceuticos();
}

// =============================
// RECEITAS
// =============================
async function carregarReceitas() {
  const resposta = await fetch("http://127.0.0.1:3000/admin/receitas");
  const receitas = await resposta.json();

  const conteudo = document.getElementById("conteudoFarmaceutico");
  conteudo.innerHTML = `
    <h4 class="text-center mb-3">Receitas Aceitas</h4>
    <table class="table table-hover align-middle">
      <thead class="table-success">
        <tr>
          <th>Medicamento</th>
          <th>Quantidade</th>
          <th>Farmacêutico</th>
          <th>CRM</th>
          <th>Data</th>
          <th>Detalhes</th>
        </tr>
      </thead>
      <tbody id="listaReceitas"></tbody>
    </table>
  `;

  const tbody = document.getElementById("listaReceitas");
  receitas.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.nome_medicamento}</td>
      <td>${r.quantidade}</td>
      <td>${r.nome_farmaceutico}</td>
      <td>${r.crm}</td>
      <td>${new Date(r.data_aceite).toLocaleString()}</td>
      <td><button class="btn btn-sm btn-info text-white" onclick="verDetalhesReceita(${r.id_receita})"><i class="bi bi-exclamation-circle"></i></button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Modal detalhes receita
async function verDetalhesReceita(id) {
  const resposta = await fetch("http://127.0.0.1:3000/admin/receitas");
  const receitas = await resposta.json();
  const r = receitas.find(x => x.id_receita === id);

  const conteudo = `
    <p><strong>Medicamento:</strong> ${r.nome_medicamento}</p>
    <p><strong>Quantidade:</strong> ${r.quantidade}</p>
    <p><strong>Farmacêutico:</strong> ${r.nome_farmaceutico}</p>
    <p><strong>CRM:</strong> ${r.crm}</p>
    <p><strong>Data:</strong> ${new Date(r.data_aceite).toLocaleString()}</p>
  `;

  document.getElementById("detalheReceitaConteudo").innerHTML = conteudo;

  const modal = new bootstrap.Modal(document.getElementById("detalheReceitaModal"));
  modal.show();
}
