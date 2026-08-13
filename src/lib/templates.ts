export interface CodeTemplate {
  id: string
  name: string
  fileName: string
  category: 'Basic' | 'Sensor' | 'Algorithm' | 'Sumo'
  description: string
  difficulty: 'เริ่มต้น' | 'ปานกลาง' | 'ขั้นสูง'
  code: string
}

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: '01_basic_movement',
    name: '01. การเคลื่อนที่พื้นฐาน',
    fileName: '01_Basic_Movement.ino',
    category: 'Basic',
    description: 'การเดินหน้า ถอยหลัง เลี้ยวมุมฉาก (Pivot Turn) และหมุนตัวกลับตำแหน่ง (Spin Turn)',
    difficulty: 'เริ่มต้น',
    code: `#include <POP32.h>

// ตัวอย่างที่ 1: การเคลื่อนที่พื้นฐาน (Basic Movement)
// สาธิตการเดินหน้า ถอยหลัง เลี้ยวมุมฉาก (Pivot Turn) และหมุนกลับตัว (Spin Turn)

void setup() {
  // รอนับถอยหลัง ก่อนเริ่มทำงาน
  delay(1000);
}

void loop() {
  // 1. เดินหน้าความเร็ว 50 เป็นเวลา 1.5 วินาที
  fd(50);
  delay(1500);

  // 2. เลี้ยวขวามุมฉาก (Pivot Turn Right)
  tr(60);
  delay(500);

  // 3. เดินหน้าต่อ 1 วินาที
  fd(50);
  delay(1000);

  // 4. เลี้ยวซ้ายมุมฉาก (Pivot Turn Left)
  tl(60);
  delay(500);

  // 5. ถอยหลัง 1 วินาที
  bk(40);
  delay(1000);

  // 6. หมุนกลับตัวไปทางขวา (Spin Turn Right)
  sr(70);
  delay(800);

  // 7. หยุดมอเตอร์ทั้งหมด 3 วินาที ก่อนเริ่มรอบใหม่
  ao();
  delay(3000);
}
`
  },
  {
    id: '02_line_tracking_analog',
    name: '02. อ่านเส้นสนามด้วยเซนเซอร์ IR',
    fileName: '02_Line_Tracking_Analog.ino',
    category: 'Sensor',
    description: 'การอ่านค่าเซนเซอร์ IR อ่านสีเส้นสนามและเปรียบเทียบค่า Threshold (Bang-Bang Line Control)',
    difficulty: 'ปานกลาง',
    code: `#include <POP32.h>

// ตัวอย่างที่ 2: การอ่านค่าเซนเซอร์ IR อ่านสีเส้นสนามและเปรียบเทียบค่า Threshold
// ตรวจจับเส้นสีดำบนพื้นสนามสีขาวด้วยเซนเซอร์อนาล็อก
// หมายเหตุ: 
// - ค่าอนาล็อกพื้นสีขาว = ค่าสูง (~800 - 1000)
// - ค่าอนาล็อกเส้นสีดำ  = ค่าต่ำ (~0 - 300)
// - ค่า THRESHOLD = 400 (หาก > 400 คือ พื้นขาว, หาก <= 400 คือ เส้นดำ)

const int THRESHOLD = 400; 

void setup() {
  delay(1000);
}

void loop() {
  // อ่านค่าจากเซนเซอร์อนาล็อก (พิน 0 ซ้าย, พิน 1 ขวา)
  int leftSensor = analog(0);
  int rightSensor = analog(1);

  // พิมพ์ค่าลง Serial Monitor เพื่อดูค่า Debug
  Serial.print("Left (Pin 0): ");
  Serial.print(leftSensor);
  Serial.print(" | Right (Pin 1): ");
  Serial.println(rightSensor);

  // ลอจิกการเดินตามเส้นแบบ 2 เซนเซอร์ (Bang-Bang Control)
  if (leftSensor > THRESHOLD && rightSensor > THRESHOLD) {
    // 1. เซนเซอร์ทั้งสองไม่อยู่บนเส้นดำ (อยู่บนพื้นขาว) -> เดินหน้าตรง
    fd(50);
  } else if (leftSensor <= THRESHOLD && rightSensor > THRESHOLD) {
    // 2. เซนเซอร์ซ้ายทับเส้นดำ -> เลี้ยวซ้ายเพื่อดึงกลับเข้าเส้น
    tl(60);
  } else if (leftSensor > THRESHOLD && rightSensor <= THRESHOLD) {
    // 3. เซนเซอร์ขวาทับเส้นดำ -> เลี้ยวขวาเพื่อดึงกลับเข้าเส้น
    tr(60);
  } else {
    // 4. ทั้งสองเซนเซอร์ทับเส้นดำ (ทางตัด/เส้นหยุด) -> เดินหน้าผ่าน หรือหยุด
    fd(40);
  }

  delay(20); // หน่วงรอบการอ่านค่า
}
`
  },
  {
    id: '03_pid_line_follower',
    name: '03. หุ่นยนต์เดินตามเส้น PID',
    fileName: '03_PID_Line_Follower.ino',
    category: 'Algorithm',
    description: 'การควบคุมหุ่นยนต์เดินตามเส้นแบบสมูทต่อเนื่องด้วยอัลกอริทึม PID (Proportional-Integral-Derivative)',
    difficulty: 'ขั้นสูง',
    code: `#include <POP32.h>

// ตัวอย่างที่ 3: การควบคุมหุ่นยนต์เดินตามเส้นสมูทด้วยอัลกอริทึม PID
// คำนวณ Error สัดส่วน (P), ผลรวมสะสม (I), และอัตราการเปลี่ยนแปลง (D)

float Kp = 0.8;  // ค่า Proportional Gain
float Ki = 0.01; // ค่า Integral Gain
float Kd = 1.2;  // ค่า Derivative Gain

int baseSpeed = 60; // ความเร็วพื้นฐาน
int lastError = 0;
long integral = 0;

void setup() {
  delay(1000);
}

void loop() {
  int sL = analog(0); // เซนเซอร์ซ้าย (พิน 0)
  int sR = analog(1); // เซนเซอร์ขวา (พิน 1)

  // คำนวณค่า Error (ความต่างของแสงระหว่างซ้าย-ขวา)
  int error = sL - sR;

  // คำนวณส่วนประกอบ PID
  integral += error;
  integral = constrain(integral, -1000, 1000); // จำกัดผลรวมสะสม
  int derivative = error - lastError;

  // คำนวณค่าการปรับแต่งความเร็วมอเตอร์ (PID Output)
  int motorAdjust = (Kp * error) + (Ki * integral) + (Kd * derivative);

  // ปรับความเร็วล้อซ้ายและขวา
  int leftSpeed = baseSpeed + motorAdjust;
  int rightSpeed = baseSpeed - motorAdjust;

  // จำกัดความเร็วไม่ให้เกินขอบเขต -100 ถึง 100
  leftSpeed = constrain(leftSpeed, -100, 100);
  rightSpeed = constrain(rightSpeed, -100, 100);

  // ส่งคำสั่งควบคุมมอเตอร์แบบแยกความเร็ว
  fd2(leftSpeed, rightSpeed);

  lastError = error;
  delay(10);
}
`
  },
  {
    id: '04_obstacle_avoidance',
    name: '04. หลบสิ่งกีดขวางด้วย TOF Distance Sensor',
    fileName: '04_Obstacle_Avoidance.ino',
    category: 'Sensor',
    description: 'การวัดระยะทางด้วย Distance Sensor (TOF) และลอจิกการเลี้ยวหลบสิ่งกีดขวางหน้าหุ่นยนต์',
    difficulty: 'ปานกลาง',
    code: `#include <POP32.h>

// ตัวอย่างที่ 4: การวัดระยะทางด้วย Distance Sensor (TOF) และหลบสิ่งกีดขวาง
// อ่านค่าเซนเซอร์วัดระยะทางเพื่อตรวจจับสิ่งกีดขวางด้านหน้าและเลี้ยวหลบ

const int SAFE_DISTANCE_CM = 20; // ระยะปลอดภัย (เซนติเมตร)

void setup() {
  delay(1000);
}

void loop() {
  // อ่านค่าจากเซนเซอร์วัดระยะทาง (Distance TOF Pin 8)
  int distanceCm = analog(8);

  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");

  if (distanceCm > 0 && distanceCm < SAFE_DISTANCE_CM) {
    // พบสิ่งกีดขวางในระยะอันตราย!
    Serial.println("Warning: Obstacle detected! Retracting & Turning...");

    // 1. ถอยหลังเล็กน้อย
    bk(40);
    delay(400);

    // 2. หมุนหลบไปทางขวา (Spin Right)
    sr(60);
    delay(600);

    // 3. หยุดประเมินสถานการณ์
    ao();
    delay(200);
  } else {
    // ทางสะดวก -> เดินหน้าตามปกติ
    fd(50);
  }

  delay(30);
}
`
  },
  {
    id: '05_sumo_attack_logic',
    name: '05. ลอจิกหุ่นยนต์ซูโม่ (Sumo Bot Attack)',
    fileName: '05_Sumo_Attack_Logic.ino',
    category: 'Sumo',
    description: 'ลอจิกหุ่นยนต์ซูโม่ ค้นหาคู่ต่อสู้ด้วย TOF Sensor และป้องกันไม่ให้ออกนอกขอบสนามด้วย IR Sensor',
    difficulty: 'ขั้นสูง',
    code: `#include <POP32.h>

// ตัวอย่างที่ 5: ลอจิกหุ่นยนต์ซูโม่ (Sumo Bot Search & Attack)
// ค้นหาคู่ต่อสู้ด้วย TOF Sensor และระวังไม่ให้ออกนอกเส้นขอบสนามด้วย IR Sensor

const int THRESHOLD_RING = 400; // ขอบสนามสังเกตจากสีขาว/ดำ
const int ENEMY_DETECTED_DIST = 40; // ระยะการเจอคู่ต่อสู้ (cm)

void setup() {
  delay(1000); // หน่วงเวลาเริ่มการแข่งขัน 1 วินาที
}

void loop() {
  int irLeft = analog(0);   // IR ตรวจเส้นขอบสนามซ้าย (พิน 0)
  int irRight = analog(1);  // IR ตรวจเส้นขอบสนามขวา (พิน 1)
  int enemyDist = analog(8); // TOF Sensor ตรวจคู่ต่อสู้ด้านหน้า (พิน 8)

  // 1. เช็กขอบสนามก่อนเสมอ (Edge Defense)
  if (irLeft <= THRESHOLD_RING || irRight <= THRESHOLD_RING) {
    // ถอยหลังหนีขอบสนาม
    bk(80);
    delay(500);
    sr(80); // หมุนตัวกลับเข้าสนาม
    delay(400);
    return;
  }

  // 2. ลอจิกค้นหาและโจมตี (Search & Attack)
  if (enemyDist > 0 && enemyDist < ENEMY_DETECTED_DIST) {
    // เจอคู่ต่อสู้! พุ่งชนด้วยความเร็วสูงสุด (Full Speed Attack)
    Serial.println("Enemy spotted! FULL ATTACK!");
    fd(100);
  } else {
    // ยังไม่เจอ -> หมุนค้นหาตามเข็มนาฬิกา (Spin Search)
    sr(45);
  }

  delay(20);
}
`
  }
]
