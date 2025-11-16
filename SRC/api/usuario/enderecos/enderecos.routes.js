
const express = require('express');
const router = express.Router();
const ctrl = require('./enderecos.controller');

router.get('/:usuarioId', ctrl.listarEnderecos);
router.post('/add', ctrl.adicionarEndereco);

module.exports = router;
