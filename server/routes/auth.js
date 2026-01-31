const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Import controllers
const { 
  register, 
  login, 
  currentUser, 
  forgotPassword, 
  resetPassword, 
  currentAdmin, 
  changePassword 
} = require('../controllers/auth');

// Import middleware
const { authCheck, adminCheck } = require('../middlewares/authCheck');
const { 
  validateRegister, 
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword
} = require('../middlewares/validators');

// ===== RATE LIMITERS =====
// Aligned with industry standards: Shopify, WooCommerce, Magento, BigCommerce

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,  // 5 นาที
  max: 5,                    // 5 attempts - Industry Standard ✓
  keyGenerator: (req) => req.ip, // Get real IP from IIS trust proxy
  message: 'ลองเข้าสู่ระบบมากเกินไป กรุณารอสักครู่',
  skipSuccessfulRequests: true  // ไม่นับ successful requests
});

const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 นาที (was 5) - Industry Standard ✓
  max: 10,                    // 10 attempts (was 5) - Industry Standard ✓
  keyGenerator: (req) => req.ip,
  message: 'ลองลงทะเบียนมากเกินไป กรุณารอสักครู่'
});

const passwordResetLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 นาที (was 5) - More generous ✓
  max: 5,                    // 5 attempts - Industry Standard ✓
  keyGenerator: (req) => req.ip,
  message: 'ลองรีเซ็ตรหัสผ่านมากเกินไป กรุณารอสักครู่'
});

// --- Routes ---

// 1. Authentication (Register / Login)
router.post('/register', registerLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);

// 2. Forgot / Reset Password
router.post("/forgot-password", passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post("/reset-password/:token", validateResetPassword, resetPassword); 

// 3. Check User / Admin (Middleware)
router.post('/current-user', authCheck, currentUser);
router.post('/current-admin', authCheck, adminCheck, currentAdmin);

// 4. Change Password (User Logged in)
router.put('/user/change-password', authCheck, validateChangePassword, changePassword);

module.exports = router;