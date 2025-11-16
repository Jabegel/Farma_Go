
const db = require('../../../db/connection');
exports.listar = async (usuarioId)=>{
  const [rows] = await db.query('SELECT * FROM pagamentos WHERE id_usuario = ?', [usuarioId]);
  return rows;
};
exports.add = async (usuarioId, payment)=>{
  await db.query('INSERT INTO pagamentos (id_usuario, tipo, detalhe) VALUES (?, ?, ?)', [usuarioId, payment.tipo, payment.detalhe||'']);
  return {ok:true};
};
