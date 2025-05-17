const express = require('express');
const router = express.Router();
const rfidController = require('../controllers/rfidController');

router.post('/rfid/push', rfidController.pushUID);
router.get('/rfid/last', rfidController.getLastUID);

module.exports = router;
