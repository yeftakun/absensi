// Ganti selector sesuai input RFID di modal
function pollRFIDInput(inputSelector, modalSelector) {
  let lastUID = null;
  let interval = null;

  function fetchUID() {
    fetch('/api/rfid/last')
      .then(res => res.json())
      .then(data => {
        if (data.uid && data.uid !== lastUID) {
          const input = document.querySelector(inputSelector);
          if (input) {
            input.value = data.uid;
            console.log('RFID terisi otomatis:', data.uid);
          } else {
            console.warn('Input RFID tidak ditemukan:', inputSelector);
          }
          lastUID = data.uid;
        }
      })
      .catch(err => {
        console.error('Gagal fetch UID:', err);
      });
  }

  const modal = document.querySelector(modalSelector);
  if (!modal) {
    console.warn('Modal tidak ditemukan:', modalSelector);
    return;
  }

  modal.addEventListener('show.bs.modal', () => {
    interval = setInterval(fetchUID, 1000);
    console.log('Polling RFID dimulai');
  });

  modal.addEventListener('hide.bs.modal', () => {
    clearInterval(interval);
    lastUID = null;
    console.log('Polling RFID dihentikan');
  });
}

// Contoh penggunaan:
// pollRFIDInput('#inputRFID', '#modalTambahSiswa');
// pollRFIDInput('#inputRFIDEdit', '#modalEditSiswa');
