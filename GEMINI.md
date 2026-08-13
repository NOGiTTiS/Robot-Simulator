# 🧠 TUNorth-RobotSimulator: Project Brain & Memory (GEMINI.md)

## 📌 1. ภาพรวมโปรเจกต์ (Project Overview)
**TUNorth-RobotSimulator** คือแพลตฟอร์มจำลองการเขียนโปรแกรมควบคุมหุ่นยนต์ผ่านเว็บแอปพลิเคชัน (Web-Based Robot Programming Simulator) ออกแบบเพื่อการเรียนการสอนและการฝึกฝนการเขียนโค้ดภาษา **C++ / Arduino** สำหรับ **โรงเรียนเตรียมอุดมศึกษา ภาคเหนือ** 
- ทำงานแบบ **Client-side 100% (Offline Capable)**
- ฐานข้อมูลหลักและลำดับแผนงานอ้างอิงจาก [`docs/spec.md`](file:///D:/RobotSIM/docs/spec.md)

---

## ⛔ 2. กฎเหล็กประจำโปรเจกต์ (Strict Project Rules)
1. **ห้ามใส่ Semicolon (`;`) ในไฟล์ TypeScript และ JavaScript ทุกไฟล์** (`.ts`, `.tsx`, `.js`, `.jsx`)
2. **การพัฒนาอิงตาม `docs/spec.md` เป็นหลัก**: เมื่อทำแต่ละขั้นตอนเสร็จแล้ว ต้องทำ Checkmark (`[x]`) ใน [`docs/spec.md`](file:///D:/RobotSIM/docs/spec.md)
3. **การส่งมอบตาม Phase**: เมื่อทำเสร็จสิ้นในแต่ละ Phase ให้หยุดพัก และรายงานสรุปให้ผู้ใช้ทดสอบก่อนดำเนินการใน Phase ต่อไป
4. **ความสวยงามและ UX/UI**: ใช้สไตล์ Modern Dark Glassmorphism, Responsive, Smooth Transitions และ Rich Aesthetics
5. **ใช้ `bun` ทุกกรณี**: ใช้ `bun` สำหรับจัดการ Package และรันคำสั่งสคริปต์ทั้งหมด (`bun dev`, `bun run build`, `bun add <pkg>`) **ห้ามใช้ `npm`, `pnpm`, หรือ `yarn` เด็ดขาด**

---

## 🛠️ 3. สถาปัตยกรรมทางเทคนิค (Tech Stack)
- **Package Manager & Runtime**: **Bun** (ใช้ `bun` สำหรับทุกคำสั่ง ห้ามใช้ npm/pnpm/yarn)
- **Framework**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4
- **Editor**: Monaco Editor (`@monaco-editor/react`) รองรับ C++ Syntax Highlighting และ Autocomplete
- **Icons**: Lucide Icons (`lucide-react`)
- **Graphics & Rendering**: HTML5 Canvas 2D + Three.js WebGL (3D View + Orbit Controls)
- **State & Storage**: React State + LocalStorage Client-side Persistence

---

## 📂 4. โครงสร้างไฟล์หลัก (Directory Map)
```
D:\RobotSIM
├── docs/
│   ├── deployment.md          # คู่มือการ Deploy ระบบขึ้น Ubuntu Server ของโรงเรียน
│   └── spec.md                # ข้อกำหนดระบบและ Checklist แบ่ง Phase (Source of Truth)
├── src/
│   ├── app/
│   │   ├── globals.css        # Glassmorphism & Custom Scrollbar Styles
│   │   ├── layout.tsx         # Root Layout & Custom Fonts (Inter, JetBrains Mono)
│   │   └── page.tsx           # หน้า UI หลักที่รวม Header, Splitter, Editor, Simulator, Console
│   ├── components/
│   │   ├── editor/
│   │   │   └── CodeEditor.tsx # Monaco C++ Editor พร้อม Font Controls (A+, A-, Reset) & Autocomplete
│   │   ├── layout/
│   │   │   ├── HeaderBar.tsx  # แถบควบคุมบน (บอร์ด, สนาม, Run/Pause/Reset, 2D/3D, Font Size)
│   │   │   ├── ResizableSplit.tsx # คอมโพเนนต์ลากปรับขนาดความกว้าง Real-time
│   │   │   └── DrawerConsole.tsx  # คอนโซลด้านล่าง (Serial Monitor, Sensor Debug)
│   │   └── simulator/
│   │       └── SimulatorContainer.tsx # พื้นที่แสดงผล 2D/3D Simulator Viewport
│   └── types/
│       └── project.ts         # Data Model Interfaces (RobotProject, BoardSpec, Sensor, Map, Physics)
└── GEMINI.md                  # สมองหลักและกฎข้อบังคับของโปรเจกต์
```

---

## 🤖 5. บอร์ดหุ่นยนต์ที่รองรับ (Supported Hardware)
1. **PT-BOT ATOM-VX**: `fd()`, `fd2()`, `bk()`, `bk2()`, `tl()`, `tr()`, `ao()`, `motor()`, `analog()`, `in()`, `gl()`, `knob()`
2. **POP32 / POP32i**: `motor()`, `fd()`, `fd2()`, `bk()`, `bk2()`, `tl()`, `tr()`, `ao()`, `analog()`, `in()`, `sound()`
3. **Arduino Nano (ATmega328P)**: `pinMode()`, `digitalWrite()`, `digitalRead()`, `analogRead()`, `analogWrite()`
4. **ESP32**: High speed processing & multi-tasking

---

## 🔄 6. สถานะการพัฒนาปัจจุบัน (Development Status Roadmap)
- [x] **Phase 1: Project Foundation & Layout Shell Architecture** (เสร็จสิ้น)
- [x] **Phase 2: C++ Interpreter & Board API Engine** (เสร็จสิ้น)
- [x] **Phase 3: Realistic Physics & Dual Rendering Engines (2D/3D)** (เสร็จสิ้น)
- [x] **Phase 4: Competition Maps & Interactive Sensor Configurator** (เสร็จสิ้น)
- [x] **Phase 5: Local File Storage, Offline PWA & Quality Assurance (QA)** (เสร็จสิ้น)

