const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// -------------------- Register --------------------
exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body

        // 1 Validate Input
        if (!email || !password || !name) {
            return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        // 1.1 Validate Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
        }

        // 1.2 Validate Name length
        if (name.trim().length < 2) {
            return res.status(400).json({ message: "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร" });
        }

        // 1.3 Validate Password length
        if (password.length < 8) {
            return res.status(400).json({ message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" });
        }

        // 2 Check Email in DB already ?
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if (user) {
            return res.status(400).json({ message: "Email นี้มีอยู่ในระบบแล้ว" });
        }

        // 3 Hash Password
        const hashPassword = await bcrypt.hash(password, 10);

        // 4 Create User
        await prisma.user.create({
            data: {
                email: email,
                password: hashPassword,
                name: name
            }
        })

        res.status(201).json({ success: true, message: "ลงทะเบียนสำเร็จ" });
    } catch (err) {
        //  ไม่ log full error ให้ client เห็น
        console.error('Register error:', err.message);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลงทะเบียน" })
    }
}

// -------------------- Login --------------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        // 1 Check Email
        const user = await prisma.user.findFirst({
            where: { email: email }
        })
        if (!user || !user.enable) {
            return res.status(400).json({ message: 'ไม่พบผู้ใช้หรือบัญชีถูกปิดใช้งาน' });
        }
        // 2 Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
        }
        // 3 Create Payload
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            picture: user.picture
        }
        // 4 Generate Token (หมดอายุใน 1 วัน)
        jwt.sign(payload, process.env.SECRET, { expiresIn: '1d' },
            (err, token) => {
                if (err) {
                    console.error('Token generation error:', err.message);
                    return res.status(500).json({ message: "เกิดข้อผิดพลาด" })
                }
                res.json({ payload, token });
            });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: "เกิดข้อผิดพลาด" })
    }
}

// -------------------- Current User --------------------
exports.currentUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: req.user.email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                picture: true
            }
        });
        res.json({ user });

    } catch (err) {
        console.error('Current user error:', err.message);
        res.status(500).json({ message: "เกิดข้อผิดพลาด" })
    }
}

// -------------------- Forgot Password --------------------
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
            return res.status(200).json({ message: "ถ้า email นี้มีอยู่ในระบบ ลิงก์รีเซ็ตจะถูกส่งไปแล้ว" });
        }

        // 1. สร้าง Token ดิบ (สำหรับส่งทางอีเมล)
        const resetToken = crypto.randomBytes(32).toString("hex");

        // 2. 🔥 สร้าง Hash Token ด้วย SHA-256 (เพื่อให้ค้นหาเร็วและตรงกับ function resetPassword)
        // (ของเดิมคุณใช้ bcrypt ตรงนี้ ซึ่งจะทำให้ code พังเพราะ resetPassword ใช้ sha256)
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // 3. เก็บลง DB (เก็บตัวที่ Hash แล้ว)
        await prisma.user.update({
            where: { email },
            data: {
                resetToken: passwordResetToken,
                resetTokenExpire: new Date(Date.now() + 15 * 60 * 1000), // 15 นาที
            }
        });

        // 4. ส่งลิงก์ (ส่งตัว Token **ดิบ** ไปใน URL)
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"Support Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "คำขอรีเซ็ตรหัสผ่าน",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h3>รีเซ็ตรหัสผ่านของคุณ</h3>
                    <p>คลิกลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ภายใน 15 นาที):</p>
                    <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">ตั้งรหัสผ่านใหม่</a>
                    <p style="color: gray; font-size: 12px;">หากคุณไม่ได้ร้องขอนี้ โปรดเพิกเฉยต่ออีเมลนี้</p>
                </div>
             `
        });

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

        // 1. แปลง Token ที่ได้จาก URL ให้เป็น Hash (SHA-256) เพื่อเอาไปเทียบใน DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // 2. ค้นหาแบบ Direct Hit (ไม่ต้องวนลูป)
        const user = await prisma.user.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpire: { gt: new Date() } // ยังไม่หมดอายุ
            }
        });

        if (!user) {
            return res.status(400).json({ message: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง หรือหมดอายุแล้ว" });
        }

        // 3. Hash รหัสผ่านใหม่ (ใช้ bcrypt เพื่อเก็บ password จริง)
        const hashPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashPassword,
                resetToken: null,
                resetTokenExpire: null
            }
        });

        res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว" });

    } catch (err) {
        console.error('Reset password error:', err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// -------------------- Current Admin --------------------
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

// -------------------- Change Password --------------------
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

        // Check old password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash and save new password
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