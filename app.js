const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(express.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  port: 3309,
  user: 'root', // default root (kalau pakai user lain ubah di sini)
  password: '', // kosong (tidak pakai password)
  database: 'try_login'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Database connected!');
});

// Middlewares
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Session
app.use(session({
  secret: 'secretkey', // bebas, buat session encryption
  resave: false,
  saveUninitialized: true
}));

// View Engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    layout: 'layouts/main-layout',
    title: "Login",
    error: null
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE user_name = ? AND user_pass = ?', [username, password], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      // Login sukses
      req.session.loggedin = true;
      req.session.name = results[0].name;
      res.redirect('/home');
    } else {
      // Login gagal
      res.render('index', {
        layout: 'layouts/main-layout',
        title: "Login",
        error: "Username atau password salah!"
      });
    }
  });
});

app.get('/home', (req, res) => {
  if (req.session.loggedin) {
    res.render('home', {
      layout: 'layouts/main-layout',
      title: "Home",
      name: req.session.name,
      loggedin: true
    });
  } else {
    res.render('home', {
      layout: 'layouts/main-layout',
      title: "Home",
      loggedin: false
    });
  }
});

app.get('/about', (req, res) => {
  res.render('about', {
    layout: 'layouts/main-layout',
    title: "About",
    loggedin: req.session.loggedin || false
  });
});

app.get('/monitor', (req, res) => {
  res.render('monitor', {
    layout: 'layouts/main-layout',
    title: "Pantau",
    loggedin: req.session.loggedin || false
  });
});

app.get('/data', (req, res) => {
  res.render('data', {
    layout: 'layouts/main-layout',
    title: "Pantau",
    loggedin: req.session.loggedin || false
  })
})

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

// 404
app.use((req, res) => {
  res.status(404).render('404', {
    layout: 'layouts/main-layout',
    title: "404: Page Not Found"
  });
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});