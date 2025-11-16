
const svc = require('./carrinho.service');
exports.pegarCarrinho = async (req,res)=>{
  try{ res.json(await svc.pegar(req.params.usuarioId)); }catch(e){ res.status(500).json({error:e.message}); }
};
exports.adicionarItem = async (req,res)=>{
  try{ res.json(await svc.add(req.body.usuarioId, req.body.produtoId, req.body.quantidade||1)); }catch(e){ res.status(500).json({error:e.message}); }
};
exports.removerItem = async (req,res)=>{
  try{ res.json(await svc.remove(req.body.usuarioId, req.body.itemId)); }catch(e){ res.status(500).json({error:e.message}); }
};
exports.finalizar = async (req,res)=>{
  try{ res.json(await svc.finalizar(req.body.usuarioId)); }catch(e){ res.status(500).json({error:e.message}); }
};
