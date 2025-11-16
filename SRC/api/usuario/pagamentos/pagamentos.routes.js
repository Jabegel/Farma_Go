
const express = require('express');
const router = express.Router();
const ctrl = require('./pagamentos.controller');

router.get('/:usuarioId', ctrl.listar);
router.post('/add', ctrl.add);

module.exports = router;
