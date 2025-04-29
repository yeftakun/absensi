## 📄 Sketch RFID Arduino

#### 🔧 Fungsi Utama

- Membaca UID dari kartu RFID (MFRC522).

- Mengenkripsi UID dengan metode XOR (key = "mykey").

- Mengubah hasil enkripsi menjadi Base64.

- Mengirim data dalam format JSON ke Serial Monitor:

```
{"uid":"<base64>","pos":"Pos A"}
```

#### ⚙️ Pin Arduino

- SS → Pin 10

- RST → Pin 9

**Output Contoh**

```
{"uid":"QkVGRg==","pos":"Pos A"}
```

#### 💡 Catatan

Base64 hanya mendukung karakter ASCII.

XOR hanya digunakan untuk obfuscasi ringan, bukan enkripsi kuat.