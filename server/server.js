// step 1  inport 
const express = require ('express');
const app = express ();
const morgan = require('morgan');
//บิวอินฟังก์ชัน .js อยู่แล้ว
const { readdirSync } = require ('fs');
const cors = require('cors');  // Server connet Clyan
const helmet = require('helmet');  // Security headers
const rateLimit = require('express-rate-limit');  // Rate limiting


// ===== SECURITY MIDDLEWARE =====
// 0. Trust Proxy (IIS/Reverse Proxy Configuration)
// CRITICAL FIX: ตั้งค่า trust proxy สำหรับ IIS เพื่อให้ rate limiter รู้จัก real client IP
app.set('trust proxy', ['127.0.0.1', '::1']); // Trust IIS localhost
// If using AWS/Azure/Cloud: app.set('trust proxy', true);

// 1. Helmet - เพิ่ม Security Headers
app.use(helmet());

// 2. CORS - กำหนด origins ที่อนุญาต
const corsOptions = {
  origin: [
    'http://localhost:5173',      // Dev client
    'http://localhost:3000',      // Alternative dev port
    'http://103.91.205.96:3000',  // Production client
    'https://ecom-aichatbot.shop' // Production domain
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 3. Rate Limiter - ป้องกัน Brute Force
// ADJUSTED: เพิ่มจาก 100 → 200 requests ต่อ 15 นาที (industry standard)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 นาที
  max: 200,                  // จำกัด 200 requests ต่อ IP (was 100)
  keyGenerator: (req) => {
    // ดึง real IP จาก X-Forwarded-For (IIS/Proxy)
    return req.ip || req.connection.remoteAddress;
  },
  message: 'ส่งคำขอมากเกินไป กรุณารอสักครู่',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ===== BODY PARSER MIDDLEWARE =====
 app.use(morgan('dev'));
 app.use(express.json({limit: '10mb'}));  // ลดขนาดจาก 15mb เป็น 10mb
 app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ===== AUTO LOAD ROUTES =====
readdirSync('./routes').map((c)=> app.use('/api',require('./routes/'+c)));

// ===== ERROR HANDLING MIDDLEWARE =====
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' 
      : err.message 
  });
});

// ===== START SERVER =====
app.listen (5001, ()=> {
    console.log ('server is running on port 5001')
});