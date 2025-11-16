
const db = require('../../../db/connection');
exports.listar = async (usuarioId)=>{
  const [rows] = await db.query('SELECT p.* FROM produtos p JOIN favoritos f ON f.id_produto = p.id_produto WHERE f.id_usuario = ?', [usuarioId]);
  return rows;
};
exports.add = async (usuarioId, produtoId)=>{
  await db.query('INSERT IGNORE INTO favoritos (id_usuario, id_produto) VALUES (?, ?)', [usuarioId, produtoId]);
  return {ok:true};
};
exports.remove = async (usuarioId, produtoId)=>{
  await db.query('DELETE FROM favoritos WHERE id_usuario = ? AND id_produto = ?', [usuarioId, produtoId]);
  return {ok:true};
};
