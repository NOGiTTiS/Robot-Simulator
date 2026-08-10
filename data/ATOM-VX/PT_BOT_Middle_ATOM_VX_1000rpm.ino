#include <PTBOTAtomVX.h>

//                    S0   S1   S2   S3   S4   S5   S6   S7
int sensor_min[] = { 300, 300, 300, 300, 300, 300, 300, 300 };  // ค่าสีเขียว
int sensor_max[] = { 802, 954, 963, 940, 952, 958, 900, 756 };  // ค่าสีขาว
float power_factor = 1.0;

int line_value[] = { 0, 0, 0, 0, 0, 0, 0, 0 };
int current_degree = 0;
float previous_error_forward = 0;

//----------ค่าเซอร์โว 1 ด้านหน้า----------//
int CH_SERVO_FRONT = 1;  // ช่องที่เสียบเซอร์โว ชุดปล่อยหน้า
int Servo1_Lock = 5;     // ล็อคลูกบาศก์หน้า S1
int Servo1_Drop = 55;    // ปล่อยลูกบาศก์หน้า S1

//----------ค่าเซอร์โว 0 ด้านหลัง----------//
int CH_SERVO_BACK = 0;  // ช่องที่เสียบเซอร์โว ชุดปล่อยหลัง
int Servo0_Lock = 8;    // ล็อคลูกบาศก์หลัง S0
int Servo0_Drop = 55;   // ปล่อยลูกบาศก์หลัง S0

long delayALL = 50;

void setup() {
  initialize();
  servoWrite(CH_SERVO_FRONT, Servo1_Lock);
  servoWrite(CH_SERVO_BACK, Servo0_Lock);
  // ShowValue_Sensor(); // โชว์ค่าเซ็นเซอร์
}

void loop() {
  while (!switchRead(A) && !switchRead(B))
    ;
  delay(500);
  setAngleOffset();
  current_degree = 0;

  Box1();        // ออกจากจุดสตาร์ท ไปวางลูกบาศก์ที่ 1
  Box2();        // ไปวางลูกบาศก์ที่ 2
  Box3();        // ไปวางลูกบาศก์ที่ 3
  Box4();        // ไปวางลูกบาศก์ที่ 4
  EndMission();  // เสร็จแล้ววิ่งไปจุดจบ
}
