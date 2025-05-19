const path = require('path');
const fs = require('fs');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

let wss = null;

exports.renderDataPage = (req, res) => {
  res.render('data', {
    layout: 'layouts/main-layout',
    title: 'Data RFID'
  });
};

exports.setupRFIDWebSocket = (server) => {
  if (wss) return; // Prevent multiple instances
  wss = new WebSocket.Server({ server });

  // SerialPort setup
  const logDir = path.join(__dirname, '../logs');
  const logFile = path.join(logDir, 'scanner.log');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  function logToFile(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  }

  async function findArduinoPort() {
    const ports = await SerialPort.list();
    const arduinoPort = ports.find(port =>
      (port.manufacturer && port.manufacturer.toLowerCase().includes('arduino')) ||
      (port.productId && ['6001', '7523'].includes(port.productId)) ||
      (port.vendorId && ['2341', '1a86'].includes(port.vendorId))
    );
    return arduinoPort ? arduinoPort.path : null;
  }

  (async () => {
    const portPath = await findArduinoPort();
    if (!portPath) {
      logToFile('Arduino port tidak ditemukan!');
      return;
    }
    logToFile('Menggunakan port: ' + portPath);

    const port = new SerialPort({
      path: portPath,
      baudRate: 9600
    });

    port.on('open', () => {
      console.log('Port serial terbuka:', portPath);
      logToFile('Port serial terbuka: ' + portPath);
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    const xorKey = 'mykey';

    function decryptXOR(data, key) {
      let result = '';
      for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    }

    parser.on('data', (data) => {
      if (data.startsWith("Tempelkan")) return;
      try {
        const json = JSON.parse(data);
        const uidEncrypted = json.uid;
        const uidBuffer = Buffer.from(uidEncrypted, 'base64');
        const uidXOR = uidBuffer.toString('binary');
        const uidDecrypted = decryptXOR(uidXOR, xorKey);

        const logMessage = `Data JSON: ${data} | UID: ${uidDecrypted} | POS: ${json.pos}`;
        logToFile(logMessage);

        // Kirim ke semua client WebSocket
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              uid: uidDecrypted,
              uidEncrypted,
              pos: json.pos
            }));
          }
        });
      } catch (err) {
        logToFile(`Gagal parsing/dekripsi: ${data}`);
      }
    });

    port.on('error', (err) => {
      logToFile(`SerialPort error: ${err.message}`);
    });
  })();
};
