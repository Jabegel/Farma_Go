
const svc = require('./pagamentos.service');
exports.listar = async (req,res)=>{ try{ res.json(await svc.listar(req.params.usuarioId)); }catch(e){res.status(500).json({error:e.message});} };
exports.add = async (req,res)=>{ try{ res.json(await svc.add(req.body.usuarioId, req.body.payment)); }catch(e){res.status(500).json({error:e.message});} };
