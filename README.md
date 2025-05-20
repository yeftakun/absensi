# Absensi Siswa Berbasis RFID & WhatsApp Bot

Sistem ini adalah aplikasi absensi siswa yang terintegrasi dengan perangkat RFID berbasis Arduino dan notifikasi otomatis melalui WhatsApp bot. Sistem ini memudahkan pencatatan kehadiran secara real-time dan pengiriman notifikasi ke wali murid.

## Fitur Utama

- Absensi Otomatis dengan RFID
- Notifikasi WhatsApp Bot
- Manajemen Data Siswa

## Arsitektur Sistem

![Arsitektur Sistem](/my_requirements/image.png)

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

## Cara Kerja

1. Siswa menempelkan kartu RFID ke reader.
2. Arduino membaca UID dan mengirim ke aplikasi absensi.
3. Aplikasi mencatat kehadiran dan mengirim notifikasi ke WhatsApp wali murid.
4. Admin dapat memantau dan mengelola data.

## Kebutuhan Sistem

- Node.js
- Database MySQL (XAMPP)
- Arduino + RFID Reader
- [WhatsApp Bot](https://github.com/yeftakun/wa-api-msg.git)

## Instalasi & Konfigurasi

1. Clone repository
```
git clone https://github.com/yeftakun/absensi.git
git clone https://github.com/yeftakun/wa-api-msg.git
```
2. Install dependencies - Jalankan di kedua repositori
```
npm install
```
3. Konfigurasikan koneksi database dan perangkat Arduino.
4. Jalankan mysql, aplikasi dan WhatsApp bot.
```
# Aplikasi:
npm start
# WhatsApp Bot:
node index.js
```

## Lisensi

MIT License
