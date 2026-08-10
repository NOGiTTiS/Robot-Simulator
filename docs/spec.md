# 📘 TUNorth-RobotSimulator: Requirements & System Specification (docs/spec.md)

---

## 1. ภาพรวมระบบ (System Overview)

### 1.1 วัตถุประสงค์ (Purpose & Vision)
**TUNorth-RobotSimulator** คือแพลตฟอร์มจำลองการเขียนโปรแกรมควบคุมหุ่นยนต์ผ่านเว็บแอปพลิเคชัน (Web-Based Robot Programming Simulator) ที่ออกแบบมาเพื่อการเรียนการสอนในชั้นเรียนและชมรมหุ่นยนต์ของ **โรงเรียนเตรียมอุดมศึกษาภาคเหนือ** และเครือข่ายทางการศึกษา ตัวระบบมุ่งเน้นการฝึกทักษะการเขียนโค้ดภาษา **C++ / Arduino** โดยตรง พร้อมระบบจำลองฟิสิกส์หุ่นยนต์สมจริง การแสดงผลแบบ 2D และ 3D WebGL และการทำงานแบบ Client-side 100% (Offline Capable) เพื่อให้ใช้งานได้ราบรื่นในคอมพิวเตอร์ห้องเรียนโดยไม่ต้องพึ่งพาเซิร์ฟเวอร์ภายนอก

### 1.2 กลุ่มผู้ใช้งานเป้าหมาย (Target Users)
1. **นักเรียน (Students)**: นักเรียนระดับมัธยมศึกษาและสมาชิกชมรมหุ่นยนต์ที่ต้องการฝึกเขียนโค้ดภาษา C++ ควบคุมหุ่นยนต์แบบทดลองทันที (Instant Feedback)
2. **ครูผู้สอน (Teachers/Instructors)**: ครูผู้จัดการเรียนการสอนวิทยาการคำนวณและหุ่นยนต์ ใช้เป็นสื่อการสอน และสามารถอัปโหลดสนาม Custom สำหรับโจทย์การทดสอบเฉพาะทางได้

### 1.3 บอร์ดหุ่นยนต์ที่รองรับ (Supported Hardware & Boards)
- **PT-BOT ATOM-VX**: บอร์ดหุ่นยนต์เพื่อการศึกษายอดนิยม พร้อมชุดฟังก์ชัน `fd()`, `bk()`, `tl()`, `tr()`, `sl()`, `sr()`, `ao()`, `motor()`, `analog()`, `in()`, `gl()`, `knob()`
- **POP32 / POP32i**: บอร์ดควบคุมหลักสำหรับการแข่งขัน พร้อมฟังก์ชัน `motor()`, `fd()`, `bk()`, `tl()`, `tr()`, `sl()`, `sr()`, `ao()`, `analog()`, `in()`, `sound()`, `beep()`
- **Arduino Nano (ATmega328P)**: บอร์ดไมโครคอนโทรลเลอร์มาตรฐานสำหรับเรียนรู้การควบคุม I/O พื้นฐาน
- **ESP32**: บอร์ดประมวลผลความเร็วสูง รองรับการทำงานมัลติทาสก์และเซนเซอร์ขั้นสูง

### 1.4 สถาปัตยกรรมทางเทคนิค (Tech Stack Architecture)
- **Frontend Framework**: **Next.js 16 (App Router)** + React 19 + Tailwind CSS (สไตล์ Modern Glassmorphism UI)
- **Code Editor**: **Monaco Editor** (VS Code Engine) พร้อมระบบปรับขนาดตัวอักษร (`A+`, `A-`, `Reset`) และการลากปรับขนาดพื้นที่ (Resizable Split Panel)
- **Code Execution Engine**: Client-side JavaScript C++ AST Interpreter ประมวลผลลูป `setup()` และ `loop()` แบบ Real-time
- **Physics Engine**: Realistic Differential Kinematics คำนวณความเร่ง/ความเฉื่อย (Acceleration Ramping), แรงเสียดทานสนาม (Friction Model), การลื่นไถล (Wheel Slip) และ Wheel Encoders
- **Rendering Engines**:
  - **2D Canvas Renderer**: HTML5 Canvas 2D ประมวลผล Pixel Color Sampling อ่านเส้นสนาม และ Raycasting เซนเซอร์ระยะทาง
  - **3D WebGL Renderer**: **Three.js** แสดงผล 3 มิติ สมจริง พร้อม Orbit Controls (Rotate/Pan/Zoom)
- **Storage & Distribution**: Web LocalStorage + File System Access API / Blob Downloads สำหรับส่งออกและเปิดไฟล์ `.ino` และ `.cpp` ทำงานแบบ Offline 100% (PWA Compatible)

---

## 2. Data Model & Schema Definitions

```typescript
// 2.1 Project & Code File Model
export interface RobotProject {
  id: string;
  name: string;
  boardType: 'ATOM-VX' | 'POP32i' | 'NANO' | 'ESP32';
  code: string;
  mapId: string;
  sensorConfig: SensorConfiguration;
  fontSize: number;
  updatedAt: number;
}

// 2.2 Board Capability Specification
export interface BoardSpec {
  id: string;
  name: string;
  maxMotors: number;
  analogPins: number;
  digitalPins: number;
  hasKnob: boolean;
  hasDisplay: boolean;
  supportedApis: string[];
}

// 2.3 Sensor Configuration Model
export interface SensorConfigItem {
  id: string;
  type: 'IR_LINE' | 'DISTANCE_TOF' | 'GYRO_IMU';
  pin: number;
  offsetX: number; // Position offset from robot center (mm)
  offsetY: number;
  angle: number;   // Sensor direction angle (degrees)
  enabled: boolean;
  colorThreshold?: number; // For line sensors
}

export interface SensorConfiguration {
  sensors: SensorConfigItem[];
}

// 2.4 Competition Map Model
export interface MapDefinition {
  id: string;
  name: string;
  imageUrl: string;
  widthMm: number;
  heightMm: number;
  startX: number;
  startY: number;
  startHeading: number; // Degrees (0 = East, 90 = North)
  isCustom: boolean;
}

// 2.5 Dynamic Robot Physics State
export interface RobotPhysicsState {
  x: number;          // Position X in map mm
  y: number;          // Position Y in map mm
  heading: number;    // Angle in radians
  linearVelocity: number;
  angularVelocity: number;
  leftWheelSpeed: number; // Current actual speed (after friction/inertia ramping)
  rightWheelSpeed: number;
  leftEncoder: number;
  rightEncoder: number;
  isStuck: boolean;
}
```

---

## 3. ฟีเจอร์ทั้งหมดพร้อม Acceptance Criteria (AC)

### Feature 1: Next.js 16 Shell & Resizable Code Editor
- **รายละเอียด**: หน้าจอหลักพัฒนาด้วย Next.js 16 พร้อม Monaco Editor สำหรับเขียน C++
- **Acceptance Criteria (AC)**:
  - [x] **AC 1.1**: หน้าจอถูกแบ่งเป็น 2 ฝั่ง (ซ้าย: Editor, ขวา: Simulator) โดยมีด้ามจับ (Splitter) ให้ลากปรับขนาดความกว้างของฝั่งซ้าย-ขวาได้แบบ Real-time
  - [x] **AC 1.2**: บนแถบเครื่องมือของ Editor มีปุ่มปรับขนาดฟอนต์ `A+`, `A-` และ `Reset` ซึ่งเมื่อกดแล้ว ขนาดตัวอักษรใน Monaco Editor จะเปลี่ยนแปลงทันที (ช่วง 10px - 32px)
  - [x] **AC 1.3**: Monaco Editor แสดงผล C++ Syntax Highlighting และระบบแนะนำโค้ด (IntelliSense) สำหรับคำสั่งควบคุมหุ่นยนต์ เช่น `fd()`, `bk()`, `tl()`, `tr()`, `sl()`, `sr()`, `motor()`, `analog()` อย่างถูกต้อง

### Feature 2: Client-side C++ Interpreter & Board API Engine
- **รายละเอียด**: ตัวแปลและรันโค้ดภาษา C++ / Arduino ใน Browser โดยไม่ต้องใช้ Server
- **Acceptance Criteria (AC)**:
  - [x] **AC 2.1**: สามารถรันโค้ดโครงสร้างมาตรฐาน Arduino (`void setup()` และ `void loop()`) ได้ถูกต้อง
  - [x] **AC 2.2**: รองรับการสลับเลือกบอร์ดระหว่าง **PT-BOT ATOM-VX**, **POP32 / POP32i**, **Arduino Nano**, และ **ESP32** โดยสโคปคำสั่ง API ให้ตรงตามบอร์ดที่เลือก
  - [x] **AC 2.3**: ฟังก์ชันควบคุมทิศทางและความเร็ว แยกแยกประเภทการเลี้ยวชัดเจน: Pivot Turn (`tl`, `tr` - ล้อข้างหนึ่งหมุน อีกข้างหนึ่งหยุด `0`) และ Spin Turn (`sl`, `sr` - ล้อสองข้างหมุนทิศตรงข้ามกัน) รวมถึงฟังก์ชันอ่านค่า (`analog`, `in`, `gl`, `knob`) ประมวลผลคำสั่งได้อย่างแม่นยำ
  - [x] **AC 2.4**: คำสั่ง `delay(ms)` และ `millis()` สามารถหน่วงการทำงานของลูปได้อย่างถูกต้องโดยไม่ทำให้ UI ค้าง (Non-blocking execution)

### Feature 3: Realistic Physics & Kinematics Simulation Engine
- **รายละเอียด**: เอนจินคำนวณฟิสิกส์หุ่นยนต์สมจริง
- **Acceptance Criteria (AC)**:
  - [x] **AC 3.1**: การออกตัวและการหยุดของหุ่นยนต์มีความเร่งและความเฉื่อย (Acceleration & Deceleration Ramping) ตามกำลังมอเตอร์ ไม่หยุดนิ่งฉับพลันแบบ Instant Snap
  - [x] **AC 3.2**: จำลองแรงเสียดทานล้อกับพื้นสนาม (Traction & Slip) เมื่อหมุนตัวหรือเบรกด้วยความเร็วสูง
  - [x] **AC 3.3**: คำนวณค่าสะสมของ Wheel Encoders สัมพันธ์กับระยะการหมุนของล้อหุ่นยนต์ตามจริง
  - [x] **AC 3.4**: ผู้ใช้สามารถคลิกลากวาง (Drag & Drop Repositioning) ย้ายตำแหน่งหุ่นยนต์บนสนามได้แบบ Real-time ทั้งในมุมมอง 2D และ 3D (พร้อม HTML5 Pointer Capture)

### Feature 4: Dual Renderer (2D Canvas & 3D Three.js WebGL)
- **รายละเอียด**: ระบบแสดงผลภาพหุ่นยนต์และสนามจำลองแบบ 2D และ 3D
- **Acceptance Criteria (AC)**:
  - [x] **AC 4.1**: ผู้ใช้สามารถกดปุ่มสลับมุมมองระหว่าง 2D Canvas และ 3D WebGL ได้ใน 1 คลิก โดยสถานะพิกัดหุ่นยนต์ไม่สูญหาย
  - [x] **AC 4.2**: หน้าจอ 3D Three.js รองรับ Orbit Controls สามารถคลิกลากหมุนมุมกล้อง ย่อ-ขยาย (Zoom) และเลื่อนมุมมอง (Pan) ได้ราบรื่น
  - [x] **AC 4.3**: หุ่นยนต์ใน 3D มีโมเดลแสดงผล 3 มิติพร้อมทิศทางการหมุนของล้อและตัวถังที่สอดคล้องกับเอนจิน 2D 100%

### Feature 5: Built-in Competition Maps & Custom Map Uploader
- **รายละเอียด**: ระบบจัดการสนามแข่งขันจำลอง
- **Acceptance Criteria (AC)**:
  - [x] **AC 5.1**: มีสนามมาตรฐานติดมากับระบบครบถ้วน ได้แก่ `Athletics-280x160cm`, `RT-TD-122x244cm`, `Robot120x240cm`, `Wall Line Track`, `QBD Field`, และ `Programmable Line Junior`
  - [x] **AC 5.2**: ผู้ใช้สามารถอัปโหลดรูปภาพสนาม Custom ของตนเอง (ไฟล์ PNG/JPG) เข้าสู่ระบบ และกำหนดขนาดสนามความกว้างxยาว (cm) ได้
  - [x] **AC 5.3**: เซนเซอร์อ่านค่าสีพื้นผิวสนาม (Pixel Color Sampling) ได้แม่นยำทั้งสนามมาตรฐานและสนามอัปโหลดใหม่

### Feature 6: Interactive Sensor Configurator & Debug Visualizer Overlay
- **รายละเอียด**: ระบบตั้งค่าและแสดงผลเซนเซอร์จำลองบนตัวหุ่นยนต์
- **Acceptance Criteria (AC)**:
  - [x] **AC 6.1**: มีพาเนล Sensor Configurator ให้ผู้ใช้สามารถกดเพิ่ม (Add), ลบ (Remove), เปิด/ปิด (Toggle Enabled) และกำหนดพิน (Pin Number) ของเซนเซอร์แต่ละตัวได้
  - [x] **AC 6.2**: มีเลเยอร์ Debug Overlay แสดงตำแหน่งเซนเซอร์ IR อ่านเส้น (จุดไฟสีแดง/เขียวตามค่าพื้นผิว), ลำแสงเซนเซอร์ระยะทาง TOF, และองศา เข็มทิศ/Gyro บนตัวหุ่นยนต์
  - [x] **AC 6.3**: ค่าที่อ่านได้จาก Visualizer สอดคล้องกับค่าที่ฟังก์ชัน `analog()` หรือ `in()` ในโค้ด C++ ได้รับแบบ Real-time และแสดงผลสดผ่านแท็บ **Sensor Debug** และ **Motors & Kinematics** ใน Drawer Console

### Feature 7: Serial Monitor & Simulation Controls
- **รายละเอียด**: ระบบคอนโซลและปุ่มควบคุมการจำลอง
- **Acceptance Criteria (AC)**:
  - [x] **AC 7.1**: มีหน้าต่าง Serial Monitor แสดงผลข้อความจากคำสั่ง `Serial.print()` และ `Serial.println()` พร้อมปุ่ม Clear Log และ Auto-scroll
  - [x] **AC 7.2**: แถบปุ่มควบคุมการจำลองประกอบด้วย ปุ่ม ▶ Run, ⏸ Pause, 🔄 Reset หุ่นยนต์กลับจุดเริ่มต้น
  - [x] **AC 7.3**: รองรับการปรับความเร็วการจำลอง (Speed Multiplier) เลือกได้ระหว่าง 1x, 2x, และ 5x

### Feature 8: Local Storage & Native File Import/Export
- **รายละเอียด**: ระบบจัดการไฟล์และบันทึกงาน Client-side
- **Acceptance Criteria (AC)**:
  - [x] **AC 8.1**: ระบบบันทึกโค้ดและค่าคอนฟิกบอร์ดลงใน LocalStorage ของ Browser อัตโนมัติ ป้องกันงานหายเมื่อรีเฟรชหน้าเว็บ
  - [x] **AC 8.2**: สามารถกด Export เพื่อดาวน์โหลดโค้ดเป็นไฟล์ `.ino` หรือ `.cpp` ลงเครื่องคอมพิวเตอร์ได้ทันที
  - [x] **AC 8.3**: สามารถกด Import เพื่อเลือกไฟล์ `.ino` / `.cpp` จากเครื่องมาเปิดแก้ไขใน Editor ได้ถูกต้อง

---

## 4. แผนการพัฒนาแบ่งเป็น Phase (Phase-by-Phase Roadmap)

### 📌 Phase 1: Project Foundation & Layout Shell Architecture
เน้นการตั้งโครงสร้างโปรเจกต์ Next.js 16, หน้าจอหลัก และ Code Editor พร้อมระบบปรับขนาดหน้าจอและฟอนต์
- [x] 1.1 เริ่มต้นสร้างโปรเจกต์ Next.js 16 (App Router) พร้อมติดตั้ง Tailwind CSS และ Lucide Icons
- [x] 1.2 พัฒนาโครงสร้างหน้า UI หลัก (Header Bar, Main Layout Panel, Drawer Console)
- [x] 1.3 พัฒนาคอมโพเนนต์ `ResizableSplit` สำหรับลากปรับขนาดความกว้างระหว่าง Code Editor และ Simulator
- [x] 1.4 ติดตั้งและตั้งค่า Monaco Editor Component สำหรับภาษา C++ / Arduino
- [x] 1.5 พัฒนาระบบ Toolbar ปรับขนาดตัวอักษรใน Editor (ปุ่ม `A+`, `A-`, `Reset` ช่วง 10px - 32px)
- [x] 1.6 ทำระบบบันทึกค่าการปรับขนาดหน้าจอและขนาดฟอนต์ลง LocalStorage

### 📌 Phase 2: C++ Interpreter & Board API Engine
เน้นระบบการแปลและประมวลผลโค้ด C++ ใน Browser และการสร้าง API ของบอร์ดหุ่นยนต์
- [x] 2.1 พัฒนา C++ Tokenizer / Lexer และ AST Evaluator ใน JavaScript สำหรับประมวลผลโครงสร้างโค้ด
- [x] 2.2 พัฒนาระบบสเตตัสการรัน Async Loop สำหรับ `setup()` และวนซ้ำ `loop()`
- [x] 2.3 สร้างระบบจำลองเวลา `delay(ms)` และ `millis()` แบบ Non-blocking
- [x] 2.4 พัฒนา API Binding สำหรับบอร์ด **PT-BOT ATOM-VX** (`fd`, `bk`, `tl`, `tr`, `ao`, `motor`, `analog`, `in`, `gl`, `knob`)
- [x] 2.5 พัฒนา API Binding สำหรับบอร์ด **POP32 / POP32i** (`motor`, `fd`, `bk`, `tl`, `tr`, `ao`, `analog`, `in`, `sound`)
- [x] 2.6 พัฒนา API Binding สำหรับ **Arduino Nano** และ **ESP32** (`pinMode`, `digitalWrite`, `digitalRead`, `analogRead`, `analogWrite`)
- [x] 2.7 พัฒนา UI หน้าต่าง **Serial Monitor** รองรับ `Serial.print()` และ `Serial.println()` พร้อมปุ่ม Clear Log

### 📌 Phase 3: Realistic Physics & Dual Rendering Engines (2D/3D)
เน้นระบบฟิสิกส์หุ่นยนต์สมจริง และการแสดงผล 2D Canvas + 3D Three.js
- [x] 3.1 พัฒนา Differential Drive Kinematics Engine คำนวณความเร็วล้อซ้าย-ขวา ตำแหน่ง X, Y และ Heading
- [x] 3.2 เพิ่มระบบฟิสิกส์ความเร่งและความเฉื่อย (Acceleration Ramping Curve) ให้มอเตอร์
- [x] 3.3 เพิ่มระบบแรงเสียดทานพื้นผิว (Friction Model) และการลื่นไถลของล้อ (Wheel Slip)
- [x] 3.4 พัฒนา **2D Canvas Renderer** แสดงผลตัวถังหุ่นยนต์ ล้อ ทิศทาง และสนาม
- [x] 3.5 พัฒนา **3D Three.js WebGL Scene Renderer** สร้างโมเดลหุ่นยนต์ 3 มิติ และ Orbit Controls (Rotate/Pan/Zoom)
- [x] 3.6 พัฒนาระบบ 1-Click Toggle สลับหน้าจอแสดงผล 2D และ 3D โดยซิงก์พิกัดฟิสิกส์แบบ Real-time
- [x] 3.7 พัฒนาระบบควบคุมการจำลอง (▶ Run, ⏸ Pause, 🔄 Reset) และตัวคูณความเร็ว (1x, 2x, 5x)
- [x] 3.8 พัฒนาระบบ Drag & Drop Repositioning ย้ายตำแหน่งหุ่นยนต์ด้วยการลากวาง Real-time (ทั้งในมุมมอง 2D และ 3D)

### 📌 Phase 4: Competition Maps & Interactive Sensor Configurator
เน้นระบบสนามแข่งขัน และระบบจัดตั้งเซนเซอร์บนตัวหุ่นยนต์พร้อม Debug Visualizer
- [x] 4.1 รวบรวมและติดตั้งสนามมาตรฐานครบถ้วน (`Athletics-280x160cm`, `RT-TD-122x244cm`, `Robot120x240cm`, `Wall Line Track`, `QBD Field`, `Programmable Line Junior`)
- [x] 4.2 พัฒนาระบบ Pixel Color Sampling อ่านค่าสีของสนามตามตำแหน่งพิกัด X, Y ของเซนเซอร์
- [x] 4.3 พัฒนาโมดูลอัปโหลดสนาม Custom (ไฟล์ PNG/JPG) พร้อมระบุขนาดจริง (cm)
- [x] 4.4 พัฒนาพาเนล **Sensor Configurator Modal** ให้กด เพิ่ม, ลบ, ตั้งค่าพิน และตำแหน่งของเซนเซอร์แต่ละตัว
- [x] 4.5 พัฒนา **Sensor Debug Overlay** แสดงจุดอ่านเส้น IR (ไฟสีแดง/เขียว), เส้นเลเซอร์ระยะทาง TOF และวงกลมเข็มทิศ Gyro บนตัวหุ่นยนต์

### 📌 Phase 5: Local File Storage, Offline PWA & Quality Assurance (QA)
เน้นการจัดการไฟล์ การรันแบบ Offline 100% และการทดสอบระบบทั้งหมด
- [x] 5.1 พัฒนาระบบบันทึกโค้ดและสถานะโปรเจกต์ลง LocalStorage อัตโนมัติ (Auto-save)
- [x] 5.2 พัฒนาระบบ **Export .ino / .cpp** ดาวน์โหลดไฟล์ลงเครื่องคอมพิวเตอร์ของผู้เรียน
- [x] 5.3 พัฒนาระบบ **Import .ino / .cpp** เปิดไฟล์โค้ดเดิมขึ้นมาแก้ไขและจำลอง
- [x] 5.4 ปรับแต่งการทำ Static Export (`output: 'export'`) และ Service Worker สำหรับการใช้งาน Offline 100% (PWA)
- [x] 5.5 ทดสอบการเขียนโค้ดและควบคุมหุ่นยนต์เดินตามเส้นบนสนามมาตรฐานทุกสนาม
- [x] 5.6 ตรวจสอบความถูกต้องของ UI Responsive และธีม Glassmorphism ในทุกลักษณะหน้าจอ
