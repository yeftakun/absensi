let lastUID = null;
let lastTimestamp = null;

exports.pushUID = (req, res) => {
  console.log('POST /api/rfid/push diterima, body:', req.body);
  const { uid } = req.body;
  if (!uid) {
    console.warn('UID kosong diterima di /api/rfid/push');
    return res.status(400).json({ error: 'UID required' });
  }
  lastUID = uid;
  lastTimestamp = Date.now();
  console.log('UID diterima dari Arduino:', uid);
  res.json({ success: true });
};

exports.getLastUID = (req, res) => {
  // Reset UID jika sudah lebih dari 10 detik
  if (lastTimestamp && Date.now() - lastTimestamp > 10000) {
    lastUID = null;
    lastTimestamp = null;
  }
  res.json({ uid: lastUID });
};
