const fs = require('fs');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

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

async function findArduinoPort() {
  const ports = await SerialPort.list();
  // Cek berdasarkan manufacturer atau product string
  const arduinoPort = ports.find(port =>
    (port.manufacturer && port.manufacturer.toLowerCase().includes('arduino')) ||
    (port.productId && ['6001', '7523'].includes(port.productId)) || // FTDI/CH340
    (port.vendorId && ['2341', '1a86'].includes(port.vendorId)) // Arduino/CH340
  );
  return arduinoPort ? arduinoPort.path : null;
}

(async () => {
  const portPath = await findArduinoPort();
  if (!portPath) {
    console.error('Arduino port tidak ditemukan!');
    process.exit(1);
  }
  console.log('Menggunakan port:', portPath);

  const port = new SerialPort({
    path: portPath,
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
    } catch (err) {
      logToFile(`Gagal parsing/dekripsi: ${data}`);
    }
  });

  port.on('error', (err) => {
    console.error('Terjadi error:', err.message);
  });

})();
