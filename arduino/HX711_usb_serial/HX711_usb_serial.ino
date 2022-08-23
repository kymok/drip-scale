#include "HX711.h"
#include <SPI.h>
#include "Adafruit_MAX31855.h"

// Load cells

const int CELL_A_DOUT_PIN = A1;
const int CELL_A_SCK_PIN = A0;
const int CELL_B_DOUT_PIN = A3;
const int CELL_B_SCK_PIN = A2;

const float CELL_A_CALIB = 0.00453131; // Calibration needed
const float CELL_B_CALIB = 0.00448903; // Calibration needed
HX711 cell_a, cell_b;

// Thermo couples

const int MAX_CS = 10;
Adafruit_MAX31855 thermocouple_A(MAX_CS);

// time

const long TEMP_INTERVAL_MS = 100;
long lastT = 0;

void setup() {
  cell_a.begin(CELL_A_DOUT_PIN, CELL_A_SCK_PIN);
  cell_b.begin(CELL_B_DOUT_PIN, CELL_B_SCK_PIN);
  Serial.begin(115200);
  lastT = millis();
}

void loop() {
  
  if (cell_a.is_ready()){
    Serial.print("W1:");
    Serial.println(CELL_A_CALIB * (float)cell_a.read());
  }
  if (cell_b.is_ready()) {
    Serial.print("W2:");
    Serial.println(CELL_B_CALIB * (float)cell_b.read());
  }

  long now = millis();
  
  if(now - lastT > TEMP_INTERVAL_MS) {
    lastT = now;
    double temp = thermocouple_A.readCelsius();
    Serial.print("T1:");
    Serial.println(temp);
  }
}