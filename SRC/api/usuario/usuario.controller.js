
const service = require('./usuario.service');

exports.login = async (req,res)=>{
  const { login, senha } = req.body;
  try{
    const user = await service.login(login, senha);
    if(!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    res.json(user);
  }catch(err){ console.error(err); res.status(500).json({error:'erro'}); }
};

exports.listarUsuarios = async (req,res)=>{
  try{ const users = await service.listar(); res.json(users); }
  catch(err){ res.status(500).json({error:'erro'}); }
};

exports.pegarUsuario = async (req,res)=>{
  try{ const user = await service.pegar(req.params.id); res.json(user); }
  catch(err){ res.status(500).json({error:'erro'}); }
};

exports.cadastrarUsuario = async (req,res)=>{
  try{ const novo = await service.cadastrar(req.body); res.json(novo); }
  catch(err){ res.status(500).json({error:err.message}); }
};

exports.editarUsuario = async (req,res)=>{
  try{ const atual = await service.editar(req.params.id, req.body); res.json(atual); }
  catch(err){ res.status(500).json({error:err.message}); }
};

exports.updateMedical = async (req,res)=>{
  try{
    const { bloodType, medicalNotes, allergies } = req.body;
    try{ await require('./usuario.service').ensureMedicalColumns(); }catch(e){}
    const id = req.params.id;
    await require('./usuario.service').updateMedical(id, { bloodType, medicalNotes, allergies });
    res.json({ ok:true });
  }catch(err){ res.status(500).json({ error: err.message }); }
};
