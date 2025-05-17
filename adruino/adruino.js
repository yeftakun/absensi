const fs = require('fs');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const axios = require('axios'); // Tambahkan ini di bagian atas

const logDir = path.join(__dirname, 'logs');
const logFile = path.join(logDir, 'scanner.log');

// Pastikan folder logs ada
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function logToFile(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

const port = new SerialPort({
  path: 'COM5', // Ganti sesuai port Arduino
  baudRate: 9600
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

const xorKey = 'mykey'; // Harus sama dengan Arduino

function decryptXOR(data, key) {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

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

    // Kirim UID ke server web
    axios.post('http://localhost:3001/api/rfid/push', { uid: uidDecrypted })
      .then(() => {
        console.log(`UID ${uidDecrypted} berhasil dikirim ke server`);
        logToFile(`UID ${uidDecrypted} berhasil dikirim ke server`);
      })
      .catch(err => {
        logToFile(`Gagal push UID ke server: ${err.message} | ${err.response ? JSON.stringify(err.response.data) : ''}`);
        console.error('Gagal push UID ke server:', err.message, err.response ? err.response.data : '');
      });
  } catch (err) {
    logToFile(`Gagal parsing/dekripsi: ${data}`);
  }
});

port.on('error', (err) => {
  console.error('Terjadi error:', err.message);
});
