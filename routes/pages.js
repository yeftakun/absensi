const express = require('express');
const router = express.Router();

// Tambahkan ini
const pagesController = require('../controllers/pagesController');

// Rute-rute lainnya
router.get('/', pagesController.index);
router.get('/home', pagesController.home);
router.get('/about', pagesController.about);
router.get('/scan', pagesController.scan);
router.get('/session', pagesController.session);
router.post('/session/add', pagesController.addSession);
router.post('/session/delete/:as_id', pagesController.deleteSession);
router.get('/session_monitor/:as_id', pagesController.sessionMonitor);
router.get('/data', pagesController.data);
router.post('/guru/add', pagesController.uploadTeacherPhoto.single('photo'), pagesController.addTeacher);
router.get('/api/teacher-usernames', pagesController.autocompleteTeacherUsernames);

// Tambahkan route berikut:
router.post('/user/add', pagesController.addUser);

module.exports = router;
