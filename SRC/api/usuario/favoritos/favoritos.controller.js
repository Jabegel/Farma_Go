
const svc = require('./favoritos.service');
exports.listarFavoritos = async (req,res)=>{
  const userId = req.params.usuarioId;
  try{ const favs = await svc.listar(userId); res.json(favs); }
  catch(err){ res.status(500).json({error:err.message}); }
};
exports.adicionarFavorito = async (req,res)=>{
  try{ const r = await svc.add(req.body.usuarioId, req.body.produtoId); res.json(r); }
  catch(err){ res.status(500).json({error:err.message}); }
};
exports.removerFavorito = async (req,res)=>{
  try{ const r = await svc.remove(req.body.usuarioId, req.body.produtoId); res.json(r); }
  catch(err){ res.status(500).json({error:err.message}); }
};
