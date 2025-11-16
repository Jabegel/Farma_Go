
const express = require('express');
const router = express.Router();
const ctrl = require('./favoritos.controller');

router.get('/:usuarioId', ctrl.listarFavoritos);
router.post('/add', ctrl.adicionarFavorito);
router.post('/remove', ctrl.removerFavorito);

module.exports = router;
