
const express = require('express');
const router = express.Router();
const ctrl = require('./produtos.controller');

router.get('/farmacia/:idFarmacia', ctrl.listarPorFarmacia);
router.get('/buscar', ctrl.buscar);

module.exports = router;
