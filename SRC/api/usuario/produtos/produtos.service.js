
const db = require('../../../db/connection');
exports.porFarmacia = async (idFarmacia)=>{
  const [rows] = await db.query('SELECT * FROM produtos WHERE id_farmacia = ?', [idFarmacia]);
  return rows;
};
exports.buscar = async (q)=>{
  const [rows] = await db.query('SELECT * FROM produtos WHERE nome LIKE ?', ['%'+q+'%']);
  return rows;
};
