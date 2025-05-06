const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  port: 3310,
  user: 'root',
  password: '',
  database: 'absensi_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Database connected!');
});

module.exports = db;
