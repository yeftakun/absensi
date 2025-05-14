const express = require('express');
const router = express.Router();

// Tambahkan ini
const pagesController = require('../controllers/apiController');

// API
router.get('/api/allSessions', pagesController.apiAllSessions);

module.exports = router;