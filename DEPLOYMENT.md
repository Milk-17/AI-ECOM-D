# 🚀 คู่มือการ Deploy โปรเจค E-commerce (Production Deployment)

## 📋 เตรียมการก่อน Deploy

### 1. ตรวจสอบโค้ดให้พร้อม
- ลบ `console.log()` ที่ไม่จำเป็นออก
- ตั้งค่า error handling ให้ครบถ้วน
- เปลี่ยน API URL จาก localhost เป็น domain จริง

### 2. เตรียม Environment Variables
- สำรองไฟล์ `.env` ทั้ง client และ server
- เตรียม Production credentials (Database, Cloudinary, Email, JWT Secret)

---

## วิธีที่ 1: 🖥️ Deploy บน VPS/Cloud Server (Ubuntu)

### A. ติดตั้ง Software บน Server

```bash
# อัพเดท system
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# ติดตั้ง MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# ติดตั้ง Nginx (สำหรับ Reverse Proxy)
sudo apt install nginx -y

# ติดตั้ง PM2 (Process Manager)
sudo npm install -g pm2
```

### B. สร้าง Database

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE ai_ecom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ecom_user'@'localhost' IDENTIFIED BY 'รหัสผ่านที่แข็งแรง';
GRANT ALL PRIVILEGES ON ai_ecom.* TO 'ecom_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### C. Upload โปรเจคขึ้น Server

```bash
# สร้างโฟลเดอร์
sudo mkdir -p /var/www/ecom
cd /var/www/ecom

# Upload ด้วย Git
git clone https://github.com/yourusername/your-repo.git .

# หรือใช้ SCP/SFTP upload ไฟล์จากเครื่อง local
# scp -r /path/to/local/project user@server:/var/www/ecom
```

### D. ติดตั้ง Dependencies

```bash
# Server
cd /var/www/ecom/server
npm install --production
npx prisma generate
npx prisma migrate deploy

# Client (Build)
cd /var/www/ecom/client
npm install
npm run build
```

### E. สร้างไฟล์ .env สำหรับ Production

```bash
# Server .env
nano /var/www/ecom/server/.env
```

```env
DATABASE_URL="mysql://ecom_user:รหัสผ่าน@localhost:3306/ai_ecom"
SECRET="jwt-secret-key-ที่แข็งแรงมากๆ-256-bit"
PORT=5001

CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"

EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="app-password"

NODE_ENV=production
```

### F. ตั้งค่า PM2 สำหรับ Server

```bash
cd /var/www/ecom/server

# รัน server ด้วย PM2
pm2 start server.js --name "ecom-backend"
pm2 save
pm2 startup
```

### G. ตั้งค่า Nginx (Reverse Proxy + Serve Frontend)

```bash
sudo nano /etc/nginx/sites-available/ecom
```

```nginx
# Frontend (React)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/ecom/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# เปิดใช้งาน config
sudo ln -s /etc/nginx/sites-available/ecom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### H. ติดตั้ง SSL (HTTPS) ด้วย Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## วิธีที่ 2: 🐳 Deploy ด้วย Docker (แนะนำ!)

### A. สร้างไฟล์ Dockerfile

**Server (Backend):**
```dockerfile
# server/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npx prisma generate
EXPOSE 5001
CMD ["npm", "start"]
```

**Client (Frontend):**
```dockerfile
# client/Dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**สร้าง nginx.conf สำหรับ Client:**
```nginx
# client/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### B. สร้าง docker-compose.yml

```yaml
version: '3.8'
services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: ai_ecom
      MYSQL_USER: ecom_user
      MYSQL_PASSWORD: userpassword
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: always

  backend:
    build: ./server
    ports:
      - "5001:5001"
    environment:
      DATABASE_URL: "mysql://ecom_user:userpassword@db:3306/ai_ecom"
      SECRET: "your-jwt-secret-change-this"
      CLOUDINARY_CLOUD_NAME: "your-cloud"
      CLOUDINARY_API_KEY: "your-key"
      CLOUDINARY_API_SECRET: "your-secret"
      EMAIL_USER: "your-email@gmail.com"
      EMAIL_PASS: "your-app-password"
      NODE_ENV: "production"
    depends_on:
      - db
    command: sh -c "npx prisma migrate deploy && npm start"
    restart: always

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

volumes:
  mysql_data:
```

### C. รัน Docker

```bash
# Build และรัน
docker-compose up -d

# ดู Logs
docker-compose logs -f

# หยุด
docker-compose down

# Update (rebuild)
docker-compose up -d --build
```

---

## วิธีที่ 3: ☁️ Deploy แยกส่วน (Frontend + Backend)

### 🎨 Frontend → Vercel (ฟรี! แนะนำ)

#### ขั้นตอน:
1. สมัครบัญชี [Vercel](https://vercel.com)
2. เชื่อม GitHub repository
3. เลือก folder: `client`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. ตั้งค่า Environment Variables:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
7. Deploy!

**หรือใช้ Vercel CLI:**
```bash
cd client
npm install -g vercel
vercel --prod
```

### 🎨 Frontend → Netlify (ฟรี!)

```bash
cd client
npm run build

# Upload โฟลเดอร์ dist/ ไปที่ Netlify Dashboard
# หรือใช้ Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

### 🖧 Backend → Railway (แนะนำ!)

#### ขั้นตอน:
1. เข้า [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. เลือก repository
4. เลือก folder: `server`
5. Add MySQL Database ใน Railway
6. ตั้งค่า Environment Variables:
   ```
   DATABASE_URL=<copy-from-railway-mysql>
   SECRET=<your-jwt-secret-256-bit>
   CLOUDINARY_CLOUD_NAME=<your-cloud>
   CLOUDINARY_API_KEY=<your-key>
   CLOUDINARY_API_SECRET=<your-secret>
   EMAIL_USER=<your-email>
   EMAIL_PASS=<app-password>
   PORT=5001
   ```
7. ตั้งค่า:
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`
8. Deploy!

### 🖧 Backend → Render (ฟรี!)

1. เข้า [render.com](https://render.com)
2. New Web Service
3. เชื่อม GitHub
4. ตั้งค่าคล้าย Railway
5. เพิ่ม PostgreSQL Database (หรือใช้ External MySQL)

---

## 📝 Checklist ก่อน Deploy

### Security
- [ ] เปลี่ยน JWT SECRET เป็นค่าที่แข็งแรง (256-bit random string)
- [ ] เปลี่ยน DATABASE_URL เป็น Production DB
- [ ] ตั้งค่า CORS ให้รองรับเฉพาะ Domain จริง
- [ ] เปิด HTTPS (SSL Certificate)
- [ ] ซ่อนข้อมูล Error ใน Production

### Configuration
- [ ] เปลี่ยน API URL ใน Frontend จาก localhost
- [ ] ปิด Debug Mode / Console Logs ที่ไม่จำเป็น
- [ ] ตั้งค่า Rate Limiting (ป้องกัน DDoS)
- [ ] เตรียม Environment Variables ครบถ้วน

### Database
- [ ] สำรอง Database ก่อน Deploy
- [ ] รัน Migration บน Production DB
- [ ] ตรวจสอบ Connection Pool Settings

### Testing
- [ ] ทดสอบ Authentication Flow
- [ ] ทดสอบ Image Upload (Cloudinary)
- [ ] ทดสอบ Email Sending
- [ ] ทดสอบ Order System
- [ ] ทดสอบใน Mobile/Tablet

---

## 🔒 Security Best Practices

### Server Security (server/.env)
```env
# ใช้ Strong Secret (256-bit)
SECRET="a8f5f167f44f4964e6c998dee827110c3b7c0a7f3e4b5c1d2e3f4a5b6c7d8e9f"

# ควรเปลี่ยนเป็น App Password (ไม่ใช่รหัสจริง)
EMAIL_PASS="app-specific-password"
```

### อัพเดต server.js เพิ่ม Security Headers:
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet()); // ป้องกัน XSS, Clickjacking

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100 // จำกัด 100 requests ต่อ IP
});
app.use('/api', limiter);

// CORS (ระบุ domain ที่อนุญาต)
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

---

## 📊 Monitoring & Maintenance

### ตรวจสอบ Server Status (PM2)
```bash
pm2 status
pm2 logs ecom-backend --lines 100
pm2 monit
pm2 restart ecom-backend
```

### Backup Database
```bash
# MySQL Backup
mysqldump -u ecom_user -p ai_ecom > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
mysql -u ecom_user -p ai_ecom < backup_20260113_120000.sql
```

### Update แอพ
```bash
cd /var/www/ecom
git pull origin main

# Update Backend
cd server
npm install
npx prisma migrate deploy
pm2 restart ecom-backend

# Update Frontend
cd ../client
npm install
npm run build
sudo systemctl reload nginx
```

---

## 🆘 แก้ไขปัญหา Production

### ตรวจสอบ Logs

**PM2 Logs:**
```bash
pm2 logs ecom-backend --lines 200
```

**Nginx Logs:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**MySQL Logs:**
```bash
sudo tail -f /var/log/mysql/error.log
```

### ปัญหาที่พบบ่อย

| ปัญหา | วิธีแก้ |
|------|--------|
| **API ไม่ตอบ (502)** | เช็ค PM2 logs, restart service |
| **Database ไม่เชื่อม** | ตรวจสอบ DATABASE_URL, MySQL service status |
| **Frontend ขาว** | เช็ค API URL ใน .env, ดู Browser Console |
| **CORS Error** | เพิ่ม domain ของ Frontend ใน server CORS config |
| **500 Error** | ดู PM2 logs, เช็ค Environment Variables |
| **Images ไม่โชว์** | ตรวจสอบ Cloudinary credentials |
| **Email ไม่ส่ง** | ตรวจสอบ EMAIL_USER และ EMAIL_PASS |

### คำสั่งฉุกเฉิน

```bash
# Restart ทั้งหมด
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mysql

# เช็ค Memory/CPU
htop
free -h
df -h

# เช็ค Port
netstat -tulpn | grep 5001
```

---

## 💡 เพิ่มประสิทธิภาพ (Performance Optimization)

### 1. Enable Gzip Compression (Nginx)
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 2. Cache Static Files (Nginx)
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Database Optimization
```sql
-- เพิ่ม Index สำหรับ Query ที่ใช้บ่อย
CREATE INDEX idx_product_category ON product(categoryId);
CREATE INDEX idx_order_user ON order(orderedById);
CREATE INDEX idx_order_status ON order(orderStatus);
```

### 4. PM2 Cluster Mode (รองรับ Traffic สูง)
```bash
pm2 start server.js -i max --name "ecom-backend"
```

---

## 📱 ติดต่อและสนับสนุน

หากมีปัญหาในการ Deploy ติดต่อได้ที่:
- Email: pongnapat.lo@rmuti.ac.th
- GitHub Issues: [Your Repository]

---

## 🎓 Resources & Documentation

- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Nginx Configuration](https://www.nginx.com/resources/wiki/start/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

**🎉 ขอให้ Deploy สำเร็จ! Good Luck! 🚀**
