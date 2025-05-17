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
router.get('/api/parent-usernames', pagesController.autocompleteParentUsernames);
router.post('/orangtua/add', pagesController.addParent);
router.get('/api/student-usernames', pagesController.autocompleteStudentUsernames);
router.get('/api/parent-siswa', pagesController.autocompleteParentSiswa);
router.get('/api/autocomplete-student', pagesController.autocompleteStudentName);

// Tambahkan route berikut agar /siswa/add tidak 404:
router.post('/siswa/add', pagesController.uploadTeacherPhoto.single('photo'), pagesController.addStudent);

// Tambahkan route POST untuk delete user, guru, orang tua, siswa.
router.post('/user/delete/:id', pagesController.deleteUser);
router.post('/guru/delete/:id', pagesController.deleteTeacher);
router.post('/orangtua/delete/:id', pagesController.deleteParent);
router.post('/siswa/delete/:id', pagesController.deleteStudent);

// Tambahkan route POST untuk edit user
router.post('/user/edit/:id', pagesController.editUser);
router.post('/guru/edit/:id', pagesController.uploadTeacherPhoto.single('photo'), pagesController.editTeacher);
router.post('/orangtua/edit/:id', pagesController.editParent);
router.post('/siswa/edit/:id', pagesController.uploadTeacherPhoto.single('photo'), pagesController.editStudent);
router.post('/session/edit/:id', pagesController.editSession);
router.post('/session/:as_id/manual-attendance', pagesController.manualAttendance);
router.get('/session/:as_id/monitor', pagesController.sessionMonitor);
router.post('/session/:as_id/delete-attendance/:attendance_id', pagesController.deleteAttendance);

module.exports = router;
