
const db = require('../../../db/connection');
exports.listar = async (usuarioId)=>{
  const [rows] = await db.query('SELECT * FROM enderecos WHERE id_usuario = ?', [usuarioId]);
  return rows;
};
exports.add = async (usuarioId, endereco)=>{
  await db.query('INSERT INTO enderecos (id_usuario, endereco) VALUES (?, ?)', [usuarioId, endereco]);
  return {ok:true};
};
