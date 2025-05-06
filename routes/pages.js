const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pagesController');

router.get('/', pageController.index);
router.get('/home', pageController.home);
router.get('/about', pageController.about);
router.get('/session', pageController.session);
router.get('/session_monitor', pageController.sessionMonitor);
router.get('/data', pageController.data);
router.get('/scan', pageController.scan);

module.exports = router;
