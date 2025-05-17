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
app.use(express.json()); // Pastikan ini sebelum route
app.use(bodyParser.json()); // Pastikan ini sebelum route
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
const apiRfidRoutes = require('./routes/api-rfid');

// ===== Use Routes =====
app.use('/', authRoutes);
// app.use('/', studentRoutes);
app.use('/', pageRoutes);
app.use('/', apiRoutes);
app.use('/api', apiRfidRoutes);

// ===== Global 404 Handler =====
app.use((req, res) => {
  res.status(404).render('404', {
    layout: 'layouts/main-layout',
    title: '404: Page Not Found'
  });
});

// ===== Integrasi Pembacaan Serial Port (RFID Arduino) =====
const fs = require('fs');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios'); // Jika tidak dipakai, bisa dihapus

const logDir = require('path').join(__dirname, 'adruino', 'logs');
const logFile = require('path').join(logDir, 'scanner.log');

// Pastikan folder logs ada
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function logToFile(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

const serialPortPath = 'COM5'; // Ganti sesuai port Arduino
const xorKey = 'mykey'; // Harus sama dengan Arduino

function decryptXOR(data, key) {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

try {
  const port = new SerialPort({
    path: serialPortPath,
    baudRate: 9600
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

  port.on('open', () => {
    console.log('Port serial terbuka');
    logToFile('Arduino siap menerima scan kartu RFID');
  });

  parser.on('data', (data) => {
    if (data.startsWith("Tempelkan")) {
      console.log(data);
      return;
    }

    try {
      const json = JSON.parse(data);
      const uidEncrypted = json.uid;
      const uidBuffer = Buffer.from(uidEncrypted, 'base64');
      const uidXOR = uidBuffer.toString('binary');
      const uidDecrypted = decryptXOR(uidXOR, xorKey);

      const logMessage = `Data JSON: ${data} | UID: ${uidDecrypted} | POS: ${json.pos}`;
      logToFile(logMessage);

      // Push UID ke endpoint internal (langsung panggil controller, tidak perlu axios)
      // Simulasikan request ke controller
      const rfidController = require('./controllers/rfidController');
      rfidController.pushUID(
        { body: { uid: uidDecrypted } }, // req
        { json: (result) => {
            logToFile(`UID ${uidDecrypted} berhasil dikirim ke server (internal call)`);
            console.log(`UID ${uidDecrypted} berhasil dikirim ke server (internal call)`);
          },
          status: () => ({ json: (result) => {
            logToFile(`Gagal push UID ke server (internal call): ${JSON.stringify(result)}`);
            console.error('Gagal push UID ke server (internal call):', result);
          }})
        }
      );
    } catch (err) {
      logToFile(`Gagal parsing/dekripsi: ${data}`);
    }
  });

  port.on('error', (err) => {
    console.error('Terjadi error:', err.message);
    logToFile(`Serial port error: ${err.message}`);
  });
} catch (err) {
  console.error('Gagal membuka port serial:', err.message);
  logToFile(`Gagal membuka port serial: ${err.message}`);
}

// ===== Start Server =====
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
