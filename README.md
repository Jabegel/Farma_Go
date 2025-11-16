
Farma_go - versão gerada (HTML/CSS/JS + Node/Express API)

Estrutura principal criada automaticamente. O projeto usa o arquivo SQL `banco_farma.sql` (fornecido por você) para referência da estrutura de banco MySQL.
Para rodar localmente é necessário ter Node.js e MySQL instalados.

Comandos sugeridos:
1. Copie `SRC/db/banco_farma.sql` para seu servidor MySQL e importe para criar as tabelas e dados.
2. `npm install` (instalar dependências listadas no package.json)
3. `node server.js`  (inicia backend em http://localhost:3000)
4. Abra `index.html` no navegador (ou acesse http://localhost:3000/index.html se estiver servindo estático)

Observações:
- A API usa Express e mysql2. Ajuste credenciais em `SRC/db/connection.js`.
- Eu incluí endpoints básicos para /api/usuario e submódulos (favoritos, produtos, endereços, pagamentos, carrinho).
