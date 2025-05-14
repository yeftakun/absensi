// controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) throw err;

    if (results.length > 0 && await bcrypt.compare(password, results[0].password)) {
      req.session.loggedin = true;
      req.session.name = results[0].username;
      req.session.role = results[0].role;

      const userId = results[0].user_id;
      const role = results[0].role;

      // Ambil foto profil dari tabel relasi sesuai role
      if (role === 'teacher') {
        db.query('SELECT photo_path FROM teachers WHERE user_id = ?', [userId], (err2, teacherResults) => {
          if (err2) throw err2;
          req.session.photo = (teacherResults.length > 0) ? teacherResults[0].photo_path : null;
          res.redirect('/home');
        });
      } else if (role === 'student') {
        db.query('SELECT photo_path FROM students WHERE user_id = ?', [userId], (err2, studentResults) => {
          if (err2) throw err2;
          req.session.photo = (studentResults.length > 0) ? studentResults[0].photo_path : null;
          res.redirect('/home');
        });
      } else {
        // Role lain atau tidak ada relasi
        req.session.photo = null;
        res.redirect('/home');
      }
    } else {
      res.render('index', {
        layout: 'layouts/main-layout',
        title: "Login",
        error: "Username atau password salah!"
      });
    }
  });
};

exports.logout = (req, res) => {
  req.session.destroy(err => res.redirect('/'));
};

exports.register = async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err) => {
      if (err) throw err;
      res.redirect('/login');
    }
  );
};
