// ===== Module Imports =====
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

// ===== App Initialization =====
const app = express();
const port = 3001;

// ===== Database Connection =====
const db = require('./config/db');

// ===== View Engine Setup =====
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));

// ===== Middleware =====
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: true
}));

// Tambahkan middleware ini sebelum router
app.use((req, res, next) => {
  res.locals.user = req.session && req.session.name ? {
    username: req.session.name,
    role: req.session.role,
    photo: req.session.photo
  } : null;
  next();
});

// ===== Route Imports =====
const authRoutes = require('./routes/auth');
// const studentRoutes = require('./routes/student');
const pageRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');
const rfidRoutes = require('./routes/rfid'); // Tambah route baru

// ===== Use Routes =====
app.use('/', authRoutes);
// app.use('/', studentRoutes);
app.use('/', pageRoutes);
app.use('/', apiRoutes);
app.use('/', rfidRoutes); // Gunakan route baru

// ===== Global 404 Handler =====
app.use((req, res) => {
  res.status(404).render('404', {
    layout: 'layouts/main-layout',
    title: '404: Page Not Found'
  });
});

// ===== Start Server & WebSocket =====
const server = app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

// WebSocket untuk RFID
const { setupRFIDWebSocket } = require('./controllers/rfidController');
setupRFIDWebSocket(server);
