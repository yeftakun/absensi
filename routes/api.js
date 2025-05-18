const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pagesController');

// Endpoint untuk sesi berikutnya (scan.ejs)
router.get('/api/nextSession', pagesController.nextSessionApi);

module.exports = router;