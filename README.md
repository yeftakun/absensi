# Absensi Siswa Berbasis RFID & WhatsApp Bot

Sistem ini adalah aplikasi absensi siswa yang terintegrasi dengan perangkat RFID berbasis Arduino dan notifikasi otomatis melalui WhatsApp bot. Sistem ini memudahkan pencatatan kehadiran secara real-time dan pengiriman notifikasi ke wali murid.

## Fitur Utama

- **Absensi Otomatis dengan RFID**  
  Siswa melakukan absensi dengan menempelkan kartu RFID pada reader yang terhubung ke Arduino. Data absensi dikirim ke server aplikasi secara otomatis.

- **Integrasi Arduino**  
  Arduino berfungsi sebagai pembaca RFID dan mengirimkan data ke aplikasi melalui serial port/USB.

- **Notifikasi WhatsApp Bot**  
  Setiap kali siswa melakukan absensi, sistem mengirimkan notifikasi ke WhatsApp wali murid menggunakan bot WhatsApp.

- **Manajemen Data Siswa**
  CRUD data siswa, kelas, dan kartu RFID.

- **Laporan Absensi**  
  Ekspor data absensi ke format Excel/PDF.

## Arsitektur Sistem

1. **Arduino + RFID Reader**  
   - Membaca kartu RFID siswa.
   - Mengirimkan data UID ke server aplikasi.

2. **Aplikasi Absensi**  
   - Menerima data dari Arduino.
   - Memproses dan menyimpan data absensi.
   - Mengirim notifikasi ke WhatsApp bot.

3. **WhatsApp Bot**  
   - Menerima request dari aplikasi.
   - Mengirim pesan notifikasi ke nomor wali murid.

## Integrasi Eksternal

- **Arduino**  
  Kode Arduino membaca UID RFID dan mengirimkannya ke aplikasi melalui koneksi serial atau jaringan.

- **WhatsApp Bot**
  Menggunakan library [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) untuk mengirim pesan otomatis ke WhatsApp wali murid.

## Cara Kerja

1. Siswa menempelkan kartu RFID ke reader.
2. Arduino membaca UID dan mengirim ke aplikasi absensi.
3. Aplikasi mencatat kehadiran dan mengirim notifikasi ke WhatsApp wali murid.
4. Admin dapat memantau dan mengelola data melalui dashboard.

## Kebutuhan Sistem

- Node.js
- Database MySQL
- Arduino + RFID Reader
- WhatsApp Bot

## Instalasi & Konfigurasi

1. Clone repository ini.
2. Install dependencies sesuai petunjuk di masing-masing file.
3. Konfigurasikan koneksi database dan perangkat Arduino.
4. Jalankan aplikasi dan WhatsApp bot.

## Catatan

- Pastikan Arduino dan aplikasi absensi dapat saling terhubung (serial port).
- Pastikan WhatsApp bot aktif dan terhubung ke nomor yang digunakan untuk notifikasi.

## Lisensi

MIT License