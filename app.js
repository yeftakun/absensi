const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3001;

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  port: 3309,
  user: 'root',
  password: '',
  database: 'absensi_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Database connected!');
});

// Middlewares
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

// Session
app.use(session({
  secret: 'secretkey',
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

  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
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

app.get('/session_monitor', (req, res) => {
  res.render('session_monitor', {
    layout: 'layouts/main-layout',
    title: "Pantau",
    loggedin: req.session.loggedin || false
  });
});

// Data Route - load semua data yang dibutuhkan
app.get('/data', (req, res) => {
  const queries = {
    parents: 'SELECT * FROM parents',
    students: 'SELECT * FROM students',
    teachers: 'SELECT * FROM teachers',
    sessions: 'SELECT * FROM attendance_sessions',
    users: 'SELECT * FROM users'
  };

  const results = {};

  // Jalankan query secara berurutan
  db.query(queries.parents, (err, parents) => {
    if (err) throw err;
    results.parents = parents;

    db.query(queries.students, (err, students) => {
      if (err) throw err;
      results.students = students;

      db.query(queries.teachers, (err, teachers) => {
        if (err) throw err;
        results.teachers = teachers;

        db.query(queries.sessions, (err, sessions) => {
          if (err) throw err;
          results.sessions = sessions;

          db.query(queries.users, (err, users) => {
            if (err) throw err;
            results.users = users;

            res.render('data', {
              layout: 'layouts/main-layout',
              title: "Data",
              loggedin: req.session.loggedin || false,
              parents: results.parents,
              students: results.students,
              teachers: results.teachers,
              sessions: results.sessions,
              users: results.users
            });
          });
        });
      });
    });
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

// 404 Not Found
app.use((req, res) => {
  res.status(404).render('404', {
    layout: 'layouts/main-layout',
    title: "404: Page Not Found"
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
