
const svc = require('./enderecos.service');
exports.listarEnderecos = async (req,res)=>{
  try{ const rows = await svc.listar(req.params.usuarioId); res.json(rows); }
  catch(err){ res.status(500).json({error:err.message}); }
};
exports.adicionarEndereco = async (req,res)=>{
  try{ const r = await svc.add(req.body.usuarioId, req.body.endereco); res.json(r); }
  catch(err){ res.status(500).json({error:err.message}); }
};
