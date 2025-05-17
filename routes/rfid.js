const express = require('express');
const router = express.Router();
const rfidController = require('../controllers/rfidController');

router.get('/data', rfidController.renderDataPage);

module.exports = router;
