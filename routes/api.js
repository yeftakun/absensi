const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pagesController');
const multer = require('multer');
const path = require('path');

// Tambahkan middleware ini agar bisa menerima JSON POST
router.use(express.json());

// Upload foto absensi
const attendancePhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'img', 'attendance_pic'));
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 90 + 10);
    cb(null, `${timestamp}_${rand}.jpg`);
  }
});
const uploadAttendancePhoto = multer({ storage: attendancePhotoStorage });

// Endpoint untuk sesi berikutnya (scan.ejs)
router.get('/api/nextSession', pagesController.nextSessionApi);

// Cari siswa berdasarkan RFID
router.get('/api/findStudentByRFID', async (req, res) => {
  const db = require('../config/db');
  const rfid = req.query.rfid;
  if (!rfid) return res.json({});
  try {
    const [rows] = await db.promise().query('SELECT student_id, student_name FROM students WHERE rfid = ?', [rfid]);
    if (rows.length > 0) return res.json(rows[0]);
    res.json({});
  } catch {
    res.json({});
  }
});

// Upload foto absensi
router.post('/api/uploadAttendancePhoto', uploadAttendancePhoto.single('photo'), (req, res) => {
  if (!req.file) return res.json({ success: false });
  res.json({ success: true, filename: req.file.filename });
});

// Input absensi
router.post('/api/submitAttendance', async (req, res) => {
  const db = require('../config/db');
  const { student_id, as_id, photo, pos } = req.body;
  if (!student_id || !as_id || !photo) return res.json({ success: false, message: 'Data tidak lengkap.' });
  try {
    await db.promise().query(
      'INSERT INTO student_attendances (sa_photo_path, as_id, student_id, pos) VALUES (?, ?, ?, ?)',
      [photo, as_id, student_id, pos || null]
    );

    // Ambil nomor WA siswa
    const [[student]] = await db.promise().query(
      `SELECT s.student_name, u.wa_num FROM students s
      LEFT JOIN users u ON s.user_id = u.user_id
      WHERE s.student_id = ?`, [student_id]
    );
    let wa_num = student && student.wa_num ? student.wa_num : null;
    let student_name = student && student.student_name ? student.student_name : '';
    let waSent = false;

    if (wa_num) {
      try {
        // Kirim ke WhatsApp bot
        await fetch('http://localhost:3000/send-image-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'abcdXD'
          },
          body: JSON.stringify({
            number: wa_num,
            filename: photo,
            caption: `Absensi berhasil untuk ${student_name}`
          })
        });
        waSent = true;
      } catch (e) {
        waSent = false;
      }
    }

    res.json({ success: true, waSent });
  } catch (e) {
    res.json({ success: false, message: 'Gagal input absensi.' });
  }
});

// Cek apakah sudah absen di sesi ini
router.get('/api/checkAttendance', async (req, res) => {
  const db = require('../config/db');
  const { student_id, as_id } = req.query;
  if (!student_id || !as_id) return res.json({ already: false });
  try {
    const [rows] = await db.promise().query(
      'SELECT COUNT(*) as total FROM student_attendances WHERE student_id = ? AND as_id = ?',
      [student_id, as_id]
    );
    res.json({ already: rows[0].total > 0 });
  } catch {
    res.json({ already: false });
  }
});

module.exports = router;