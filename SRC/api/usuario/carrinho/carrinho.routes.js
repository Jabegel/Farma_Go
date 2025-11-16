
const express = require('express');
const router = express.Router();
const ctrl = require('./carrinho.controller');

router.get('/:usuarioId', ctrl.pegarCarrinho);
router.post('/add', ctrl.adicionarItem);
router.post('/remove', ctrl.removerItem);

module.exports = router;
