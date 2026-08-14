# 1. Builder Stage: Build Next.js Static Export (ใช้ node:20-alpine เพื่อรองรับ CPU รุ่นเก่าที่ไม่มี AVX)
FROM node:20-alpine AS builder
WORKDIR /app

# คัดลอก Dependency และติดตั้ง
COPY package.json package-lock.json* bun.lock* ./
RUN npm install

# คัดลอก Source Code ทั้งหมดและสร้าง Static Files (out/)
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 2. Production Stage: Nginx Web Server
FROM nginx:alpine AS runner
# คัดลอก Static Files จากโฟลเดอร์ out เข้าไปที่ Nginx HTML Root
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
