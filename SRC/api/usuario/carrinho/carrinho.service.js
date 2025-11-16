
const db = require('../../../db/connection');
exports.pegar = async (usuarioId)=>{
  const [rows] = await db.query('SELECT c.id_carrinho, ci.*, p.nome, p.preco FROM carrinho c JOIN carrinho_itens ci ON ci.id_carrinho = c.id_carrinho JOIN produtos p ON p.id_produto = ci.id_produto WHERE c.id_usuario = ? AND c.status = "aberto"', [usuarioId]);
  return rows;
};
exports.add = async (usuarioId, produtoId, quantidade)=>{
  // get/open cart
  const [cartRows] = await db.query('SELECT id_carrinho FROM carrinho WHERE id_usuario = ? AND status = "aberto"', [usuarioId]);
  let idCarrinho;
  if(cartRows.length===0){
    const [r] = await db.query('INSERT INTO carrinho (id_usuario, status) VALUES (?, "aberto")', [usuarioId]);
    idCarrinho = r.insertId;
  } else idCarrinho = cartRows[0].id_carrinho;
  // price fetch
  const [prodRows] = await db.query('SELECT preco FROM produtos WHERE id_produto = ?', [produtoId]);
  const preco = prodRows[0] ? prodRows[0].preco : 0;
  await db.query('INSERT INTO carrinho_itens (id_carrinho, id_produto, quantidade, preco_unitario) VALUES (?, ?, ?, ?)', [idCarrinho, produtoId, quantidade, preco]);
  return {ok:true};
};
exports.remove = async (usuarioId, itemId)=>{
  await db.query('DELETE ci FROM carrinho_itens ci JOIN carrinho c ON ci.id_carrinho = c.id_carrinho WHERE ci.id_item = ? AND c.id_usuario = ?', [itemId, usuarioId]);
  return {ok:true};
};
