const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Konfigurasi koneksi ke database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Ganti jika ada password
  database: 'absensi_db',
  port: 3310 // Ganti jika port berbeda
});

// Detail akun admin pertama
const username = 'admin';
const password = '123';
const email = 'admin@example.com';
const role = 'admin';
const wa_num = '081234567890'; // Nomor WhatsApp admin (dummy)

bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) throw err;

  // Cek apakah username sudah ada
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      const insertQuery = `
        INSERT INTO users (username, password, email, role, wa_num)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(insertQuery, [username, hashedPassword, email, role, wa_num], (err) => {
        if (err) throw err;
        console.log('✅ Admin account created successfully.');
        db.end();
      });
    } else {
      console.log('⚠️ Admin account already exists.');
      db.end();
    }
  });
});
