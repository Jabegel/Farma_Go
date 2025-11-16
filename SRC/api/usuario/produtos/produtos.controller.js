
const svc = require('./produtos.service');
exports.listarPorFarmacia = async (req,res)=>{
  try{ const rows = await svc.porFarmacia(req.params.idFarmacia); res.json(rows); }
  catch(err){ res.status(500).json({error:err.message}); }
};
exports.buscar = async (req,res)=>{
  try{ const q = req.query.q || ''; const rows = await svc.buscar(q); res.json(rows); }
  catch(err){ res.status(500).json({error:err.message}); }
};
