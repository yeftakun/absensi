#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 10
#define RST_PIN 9

MFRC522 mfrc522(SS_PIN, RST_PIN);

const String posID = "Pos A";
const char* key = "mykey"; // KEY untuk XOR encryption

String base64Encode(String input);
String encryptXOR(String data, const char* key);

void setup() {
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("Tempelkan kartu RFID...");
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) return;

  String content = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) content += "0";
    content += String(mfrc522.uid.uidByte[i], HEX);
    if (i < mfrc522.uid.size - 1) content += " ";
  }
  content.toUpperCase();

  String encrypted = encryptXOR(content, key);
  String encoded = base64Encode(encrypted);

  Serial.print("{\"uid\":\"");
  Serial.print(encoded);
  Serial.print("\",\"pos\":\"");
  Serial.print(posID);
  Serial.println("\"}");

  delay(2000);
  mfrc522.PICC_HaltA();
}

String encryptXOR(String data, const char* key) {
  String result = "";
  int keyLen = strlen(key);
  for (int i = 0; i < data.length(); i++) {
    result += char(data[i] ^ key[i % keyLen]);
  }
  return result;
}

// --- Base64 Encode (sederhana untuk ASCII string) ---
const char b64chars[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

String base64Encode(String input) {
  String output = "";
  int i = 0;
  while (i < input.length()) {
    int byte1 = input[i++];
    int byte2 = (i < input.length()) ? input[i++] : 0;
    int byte3 = (i < input.length()) ? input[i++] : 0;

    output += b64chars[(byte1 >> 2) & 0x3F];
    output += b64chars[((byte1 & 0x3) << 4) | ((byte2 >> 4) & 0xF)];
    output += (i - 1 < input.length()) ? b64chars[((byte2 & 0xF) << 2) | ((byte3 >> 6) & 0x3)] : '=';
    output += (i < input.length()) ? b64chars[byte3 & 0x3F] : '=';
  }
  return output;
}
