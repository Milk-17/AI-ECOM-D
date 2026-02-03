const prisma = require ('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');



exports.register = async(req,res) => {
    try{
        const { email, password , name} = req.body
        
        // 1 Validate Input
        if (!email || !password || !name) {
            return res.status(400).json({ message : "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }
        
        // 1.1 Validate Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message : "รูปแบบอีเมลไม่ถูกต้อง" });
        }
        
        // 1.2 Validate Name length
        if (name.trim().length < 2) {
            return res.status(400).json({ message : "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร" });
        }
        
        // 1.3 Validate Password length
        if (password.length < 8) {
            return res.status(400).json({ message : "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" });
        }
        
        // 2 Check Email in DB already ?
        const user = await prisma.user.findFirst({
            where:{
                    email: email
            }
        }) 
        if(user){
            return res.status(400).json({ message : "Email นี้มีอยู่ในระบบแล้ว"});
        }
        
        // 3 Hash Password
        const hashPassword = await bcrypt.hash(password,10);
        
        // 4 Create User
        await prisma.user.create({
          data : {
            email : email,
            password : hashPassword,
            name : name 
          }
        })

        res.status(201).json({ success: true, message: "ลงทะเบียนสำเร็จ" });
    }catch (err) {
        // 🔒 ไม่ log full error ให้ client เห็น
        console.error('Register error:', err.message);
        res.status(500).json({ message : "เกิดข้อผิดพลาดในการลงทะเบียน" })   
    }

}

exports.login = async(req,res) => { 
    try{
        const { email,password } = req.body

        // 1 Check Email
        const user = await prisma.user.findFirst({
            where : {email : email}
        })
        if(!user || !user.enable) {
            return res.status(400).json({ message : 'ไม่พบผู้ใช้หรือบัญชีถูกปิดใช้งาน'});
        }
        // 2 Check password
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({ message : 'รหัสผ่านไม่ถูกต้อง'});
        }
        // 3 Create Payload
        const payload = {
            id : user.id,
            email : user.email,
            role : user.role,
            name: user.name,
            picture: user.picture
        } 
        // 4 Generate Token (หมดอายุใน 30 นาที)
        jwt.sign(payload, process.env.SECRET, {expiresIn : '30m'},   
            (err, token) => {
              if(err){
                console.error('Token generation error:', err.message);
                return res.status(500).json({ message : "เกิดข้อผิดพลาด"})
              }  
              res.json({payload, token});
            }) ;
        
    }catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message : "เกิดข้อผิดพลาด" })   
    }
}

exports.currentUser = async (req,res) => {
    try {
        // console.log(req.user);
        const user = await prisma.user.findUnique({
            where : { email: req.user.email},
            select:{
                id:true,
                email:true,
                name:true,
                role:true, 
                picture: true
            }
        });
        res.json({ user });
       
    } catch (err){
        console.error('Current user error:', err.message);
        res.status(500).json({ message : "เกิดข้อผิดพลาด" })
    }
}

// -------------------- Forgot Password --------------------
exports.forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        // 🔒 ไม่บอก email exist หรือไม่ (ป้องกัน email enumeration)
        return res.status(200).json({ message: "ถ้า email นี้มีอยู่ในระบบ ลิงก์รีเซ็ตจะถูกส่งไปแล้ว" });
      }
  
      // สร้าง token สำหรับ reset
      const resetToken = crypto.randomBytes(32).toString("hex");
  
      // hash token เก็บใน DB ป้องกันโจมตี
      const hashToken = await bcrypt.hash(resetToken, 10);
  
      // เก็บ hashToken และ expire 15 นาที
      await prisma.user.update({
        where: { email },
        data: {
          resetToken: hashToken,
          resetTokenExpire: new Date(Date.now() + 15 * 60 * 1000), 
        }
      });
  
      // สร้างลิงก์ reset - ใช้ dynamic URL ตามสภาพแวดล้อม
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  
      // ส่งอีเมล (ใช้ nodemailer)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  
      await transporter.sendMail({
        from: `"Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "คำขอรีเซ็ตรหัสผ่าน",
        html: `
          <p>คุณได้ร้องขอรีเซ็ตรหัสผ่าน</p>
          <p>คลิกลิงก์ด้านล่างเพื่อรีเซ็ต (ภายใน 15 นาที):</p>
          <a href="${resetLink}">${resetLink}</a>
          <p><strong>หมายเหตุ:</strong> ถ้าคุณไม่ได้ร้องขอนี้ ให้ละเว้นอีเมลนี้</p>
        `
      });
  
      // 🔒 ส่ง generic message กลับ (ไม่เปิดเผย email exist หรือไม่)
      res.status(200).json({ message: "ถ้า email นี้มีอยู่ในระบบ ลิงก์รีเซ็ตจะถูกส่งไปแล้ว" });
  
    } catch (err) {
      console.error('Forgot password error:', err.message);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  };
  
// -------------------- Reset Password --------------------
exports.resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
  
      // หาผู้ใช้ที่มี resetToken (ต้องวนเช็คทุก user)
      const users = await prisma.user.findMany({
        where: {
          resetToken: { not: null },
          resetTokenExpire: { gt: new Date() }  // ยังไม่หมดอายุ
        }
      });
  
      // เช็ค token ว่าตรงกับ hash หรือไม่
      let matchedUser = null;
      for (let u of users) {
        const isMatch = await bcrypt.compare(token, u.resetToken);
        if (isMatch) {
          matchedUser = u;
          break;
        }
      }
  
      if (!matchedUser) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
  
      // hash password ใหม่
      const hashPassword = await bcrypt.hash(password, 10);
  
      await prisma.user.update({
        where: { id: matchedUser.id },
        data: {
          password: hashPassword,
          resetToken: null,
          resetTokenExpire: null
        }
      });
  
      res.json({ message: "Password has been reset successfully" });
  
    } catch (err) {
      console.error('Reset password error:', err.message);
      res.status(500).json({ message: "Server Error" });
    }
  };

  exports.currentAdmin = async (req, res) => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: req.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
      res.json({ user });
    } catch (err) {
      console.error('Current admin error:', err.message);
      res.status(500).json({ message: "Server Error" });
    }
  };

  exports.changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id; 
  
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
  
      if (!user) {
          return res.status(400).json({ message: "User not found" });
      }
  
      // 3. Check old password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
  
      // 4. Hash and save new password
      const hashNewPassword = await bcrypt.hash(newPassword, 10);
  
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashNewPassword
        }
      });
  
      res.json({ message: "Password changed successfully" });
  
    } catch (err) {
      console.error('Change password error:', err.message);
      res.status(500).json({ message: "Server Error" });
    }
  };