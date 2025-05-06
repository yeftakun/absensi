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
      res.redirect('/home');
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
