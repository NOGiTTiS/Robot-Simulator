# 📘 คู่มือการ Deploy ระบบ TUNorth-RobotSimulator (docs/deployment.md)

คู่มือนี้สรุปสถาปัตยกรรมและขั้นตอนการติดตั้ง/Deploy ระบบ **TUNorth-RobotSimulator** ขึ้นเครื่อง **Ubuntu Server 24.04 LTS** ของโรงเรียนเตรียมอุดมศึกษา ภาคเหนือ ผ่าน Docker, Nginx Reverse Proxy และ Cloudflare Tunnel โดยอ้างอิงมาตรฐานจากโครงสร้างหลักใน `D:\TUNorth`

---

## 🏗️ 1. ภาพรวมสถาปัตยกรรมระบบ (Architecture Overview)

```text
[ Internet Users ]
       │
       ▼
┌─────────────────────────┐
│    Cloudflare Edge      │
└──────────┬──────────────┘
           │ (Cloudflare Tunnel - robotsim.tn.ac.th)
           ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Ubuntu Server 24.04 LTS (HP ProLiant ML350 G6 - IP: 192.168.165.11)    │
│                                                                        │
│  [ Local LAN Access ] ──► [ Local Nginx Proxy (Port 8007) ]            │
│                                   │                                    │
│  ─────────────────────────────────┼──────────────────────────────────  │
│  Docker Internal Network: tunorth-net                                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     TUNorth Applications                         │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ • robot-simulator-app (Port 80 inside container)                  │  │
│  │ • brms / edms / gpms / harvestfarm / oes / promptcraft           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 📊 สรุปการเชื่อมโยงระบบ (Service Mapping)

| รายการ | รายละเอียด |
| :--- | :--- |
| **ชื่อระบบ** | TUNorth Robot Simulator |
| **Domain (ภายนอก)** | `https://robotsim.tn.ac.th` |
| **Direct IP Access (ภายใน LAN)** | `http://192.168.165.11:8007` |
| **Container Name** | `robot-simulator-app` |
| **Docker Network** | `tunorth-net` |
| **App Path บน Server** | `~/TUNorth/apps/robot-simulator` |
| **Port ภายใน Container** | `80` (Nginx Static Web Server) |
| **Database** | ไม่ต้องใช้ (Client-Side 100% Offline Capable) |

---

## 🚀 2. ขั้นตอนการ Deploy ระบบขึ้นเซิร์ฟเวอร์ (Step-by-Step SOP)

### ขั้นตอนที่ 1: เตรียมโฟลเดอร์โปรเจกต์บน Ubuntu Server
เชื่อมต่อ SSH เข้าเซิร์ฟเวอร์ และสร้างโฟลเดอร์สำหรับแอปพลิเคชัน:
```bash
mkdir -p ~/TUNorth/apps/robot-simulator
cd ~/TUNorth/apps/robot-simulator
```
นำไฟล์ซอร์สโค้ดของระบบ **TUNorth-RobotSimulator** มาวางในโฟลเดอร์นี้

---

### ขั้นตอนที่ 2: จัดทำไฟล์ Dockerfile และ docker-compose.yml

เนื่องจาก **RobotSimulator** เป็น Next.js Web App ที่ทำงานแบบ Client-side 100% (ประมวลผลบนเบราว์เซอร์) การ Deploy ผ่าน Static Export (`output: 'export'`) ร่วมกับ **Nginx Container** จะให้ประสิทธิภาพสูง และใช้ทรัพยากรน้อยที่สุด

#### 📄 2.1 ไฟล์ `~/TUNorth/apps/robot-simulator/Dockerfile`
```dockerfile
# 1. Builder Stage: Build Next.js Static Export
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# คัดลอก Dependency และติดตั้ง
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# คัดลอก Source Code ทั้งหมดและสร้าง Static Files (out/)
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# 2. Production Stage: Nginx Web Server
FROM nginx:alpine AS runner
# คัดลอก Static Files จากโฟลเดอร์ out เข้าไปที่ Nginx HTML Root
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 📄 2.2 ไฟล์ `~/TUNorth/apps/robot-simulator/docker-compose.yml`
```yaml
services:
  robot-simulator:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: robot-simulator-app
    restart: always
    networks:
      - tunorth-net

networks:
  tunorth-net:
    external: true
```

---

### ขั้นตอนที่ 3: ตั้งค่า Nginx สำหรับการเข้าถึงผ่าน LAN (Port 8007)

1. **เพิ่มการ Map Port ใน `~/TUNorth/infra/docker-compose.yml`:**
   เพิ่มพอร์ต `"8007:8007"` ในส่วนบริการ `nginx`
   ```yaml
     nginx:
       image: nginx:alpine
       container_name: local-nginx
       restart: always
       ports:
         - "80:80"
         - "8001:8001"
         - "8002:8002"
         - "8003:8003"
         - "8004:8004"
         - "8005:8005"
         - "8006:8006"
         - "8007:8007"  # <--- พอร์ตสำหรับ Robot Simulator
   ```

2. **เพิ่ม Server Block ใน `~/TUNorth/infra/nginx/nginx.conf`:**
   ```nginx
   # TUNorth Robot Simulator (Port 8007)
   server {
       listen 8007;
       server_name _;

       location / {
           proxy_pass http://robot-simulator-app:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

3. **Restart Nginx Container:**
   ```bash
   cd ~/TUNorth/infra && docker compose restart nginx
   ```

---

### ขั้นตอนที่ 4: ตั้งค่า Cloudflare Tunnel (สำหรับการเข้าถึงจากภายนอก)

1. เข้าไปยัง **Cloudflare Zero Trust Dashboard** ➔ Networks ➔ Tunnels
2. เลือก Tunnel ของโรงเรียน (`TUNorth-Server`) ➔ เลือก **Edit**
3. ไปที่ **Public Hostname Page** ➔ กด **Add a public hostname**
4. กำหนดข้อมูลดังนี้:
   - **Subdomain:** `robotsim`
   - **Domain:** `tn.ac.th`
   - **Type:** `HTTP`
   - **URL:** `robot-simulator-app:80` (หรือ `local-nginx:8007`)
5. กด **Save Hostname**

---

### ขั้นตอนที่ 5: อัปเดตสคริปต์สแกนอัตโนมัติ (`deploy.sh`) และรัน Deploy

1. เปิดไฟล์ `~/TUNorth/scripts/deploy.sh` แล้วเพิ่ม `"robot-simulator"` ในอาร์เรย์ `APPS`:
   ```bash
   APPS=("brms" "edms" "gpms" "harvestfarm" "oes" "promptcraft" "robot-simulator")
   ```

2. **สั่งรัน Deploy ทั้งหมด:**
   ```bash
   cd ~/TUNorth
   ./scripts/deploy.sh
   ```

---

## 🛠️ 3. คำสั่งพื้นฐานสำหรับดูแลรักษา (Maintenance & Re-deploy)

| การทำงาน | คำสั่งที่ใช้ |
| :--- | :--- |
| **ตรวจสอบสถานะ Container** | `docker ps \| grep robot-simulator` |
| **ดู Logs การทำงานสด** | `docker logs -f robot-simulator-app` |
| **Re-deploy เฉพาะแอปนี้** | `cd ~/TUNorth/apps/robot-simulator && docker compose up -d --build` |
| **Restart Nginx Proxy** | `cd ~/TUNorth/infra && docker compose restart nginx` |
