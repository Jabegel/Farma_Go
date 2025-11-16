
const db = require('../../db/connection');

exports.login = async (login, senha) => {
  const [rows] = await db.query('SELECT id, nome, login, tipo, email FROM usuarios WHERE login = ? AND senha = ?', [login, senha]);
  return rows[0] || null;
};

exports.listar = async ()=>{
  const [rows] = await db.query('SELECT id, nome, login, tipo, email FROM usuarios');
  return rows;
};

exports.pegar = async (id)=>{
  const [rows] = await db.query('SELECT id, nome, login, tipo, email FROM usuarios WHERE id = ?', [id]);
  return rows[0];
};

exports.cadastrar = async (data)=>{
  const { nome, login, senha, tipo, email } = data;
  const [res] = await db.query('INSERT INTO usuarios (nome, login, senha, tipo, email) VALUES (?, ?, ?, ?, ?)', [nome, login, senha, tipo || 'cliente', email]);
  return { id: res.insertId, nome, login, tipo, email };
};

exports.editar = async (id, data)=>{
  const fields = [];
  const values = [];
  for(const k of ['nome','login','senha','email']) if(data[k]){ fields.push(k+' = ?'); values.push(data[k]); }
  if(fields.length===0) return this.pegar(id);
  values.push(id);
  await db.query('UPDATE usuarios SET '+fields.join(', ')+' WHERE id = ?', values);
  return this.pegar(id);
};
