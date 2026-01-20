#Computer E-commerce AI Chatbot - คู่มือการติดตั้ง

## 1️⃣ เตรียมการและแตกไฟล์โปรเจกต์

แตกไฟล์ ZIP ให้ได้โฟลเดอร์ดังนี้:
├── client/          (React + Vite)
├── server/          (Node + Express + Prisma)
├── README.txt       (ไฟล์นี้)
└── README.md

## 2️⃣ สร้างฐานข้อมูล MySQL

เปิด MySQL Client และสร้างฐานข้อมูล:

CREATE DATABASE ai_ecom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


## 3️⃣ ตั้งค่า Server (Node.js + Prisma)

### 3.1 ติดตั้งแพ็กเกจ

cd server
npm install
npm install nodemon

### 3.2 สร้างไฟล์ .env ใน server/

DATABASE_URL="mysql://username:password@localhost:3306/ai_ecom"
SECRET="อันที่มึงมีอ่ะ"
STRIPE_SECRET_KEY="อันนี้ไม่น่าใด้ใช้"
STRIPE_PUBLISHABLE_KEY="อันนี้ไม่น่าใด้ใช้ด้วย"

CLOUDINARY_CLOUD_NAME="ชื่อ CLOUDINARY ท่าน"
CLOUDINARY_API_KEY="ชื่อ API CLOUDINARY ท่าน"
CLOUDINARY_API_SECRET="ชื่อ SECRT CLOUDINARY ท่าน"

EMAIL_USER="อันนี้จำเป็นไหม"
EMAIL_PASS="อันนี้จำเป็นไหม"

> ⚠️ **สำคัญ**: ห้ามแชร์ .env ต่อสาธารณะ! เพิ่ม .env ลง .gitignore

### 3.3 สร้างตาราง Database
cd server
npx prisma migrate dev
npx prisma generate

### 3.4 รัน Server
npm start

✅ Server พร้อมใช้งาน: `http://103.91.205.96:5001`


## 4️⃣ ตั้งค่า Client (React + Vite)

### 4.1 ติดตั้งแพ็กเกจ
cd client
npm install
npm install lucide-react

### 4.2 สร้างไฟล์ .env ใน client/ (ถ้าต้องการ)

VITE_API_URL="http://103.91.205.96:5001"

### 4.3 รัน Client (Development)

npm run dev

✅ เข้าเว็บ: `http://localhost:5173`


## 🐛 แก้ไขปัญหาทั่วไป

| ปัญหา | วิธีแก้ |
|------|-------|
| **@prisma/client ยังไม่ init** | `cd server && npx prisma generate` |
| **ต่อ Database ไม่ได้** | ตรวจสอบ DATABASE_URL, MySQL เปิด, สร้าง DB แล้ว |
| **Client ยิง API ไม่ได้** | ตรวจสอบ Server รันอยู่, พอร์ต 5001 เปิด |
| **รูปไม่อัพโหลดได้** | ตรวจสอบ Cloudinary Credentials ใน .env |
| **Stripe ไม่ทำงาน** | ใช้ Stripe Test Key, ทดสอบแบบ Publishable Key ใน Frontend |
| **Chatbot ไม่ตอบ** | ตรวจสอบ ngrok URL, n8n Workflow ทำงาน |

---

## 📦 โครงสร้างไฟล์

```
server/
├── config/           (ตั้งค่า Database)
├── controllers/      (API Logic)
│   ├── product.js    (สินค้า)
│   ├── auth.js       (ลงทะเบียน/เข้าสู่ระบบ)
│   ├── order.js      (Order)
│   ├── stripe.js     (ชำระเงิน)
│   └── ...
├── middlewares/      (Middleware)
├── routes/          (API Routes)
├── prisma/
│   └── schema.prisma (Database Schema)
└── server.js

client/
├── src/
│   ├── api/         (API Calls)
│   ├── components/  (React Components)
│   ├── pages/       (หน้า)
│   ├── layouts/     (Layout)
│   ├── routes/      (Route Protection)
│   ├── store/       (Zustand Store)
│   ├── App.jsx
│   └── main.jsx
└── vite.config.js
```