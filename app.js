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

// ===== Route Imports =====
const authRoutes = require('./routes/auth');
// const studentRoutes = require('./routes/student');
const pageRoutes = require('./routes/pages');

// ===== Use Routes =====
app.use('/', authRoutes);
// app.use('/', studentRoutes);
app.use('/', pageRoutes);

// ===== Global 404 Handler =====
app.use((req, res) => {
  res.status(404).render('404', {
    layout: 'layouts/main-layout',
    title: '404: Page Not Found'
  });
});

// ===== Start Server =====
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
