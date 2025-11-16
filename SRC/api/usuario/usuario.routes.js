
const express = require('express');
const router = express.Router();
const controller = require('./usuario.controller');

router.post('/login', controller.login);
router.get('/listar', controller.listarUsuarios);
router.get('/:id', controller.pegarUsuario);
router.post('/cadastrar', controller.cadastrarUsuario);
router.put('/:id/editar', controller.editarUsuario);

// mount submodules
router.use('/favoritos', require('./favoritos/favoritos.routes'));
router.use('/produtos', require('./produtos/produtos.routes'));
router.use('/enderecos', require('./enderecos/enderecos.routes'));
router.use('/pagamentos', require('./pagamentos/pagamentos.routes'));
router.use('/carrinho', require('./carrinho/carrinho.routes'));

module.exports = router;
