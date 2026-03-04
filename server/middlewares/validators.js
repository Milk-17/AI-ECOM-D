const { body, param, query, validationResult } = require('express-validator');

// ===== ERROR HANDLER =====
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'ข้อมูลไม่ถูกต้อง',
      errors: errors.array() 
    });
  }
  next();
};

// ===== AUTH VALIDATORS =====
// PASSWORD POLICY: Consistent across Register, Reset, and Change Password
// Industry Standard (Shopify, WooCommerce): 8+ chars, Uppercase + Lowercase + Numbers
// NO special chars required (reduces user friction while maintaining security)
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

exports.validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('รูปแบบ Email ไม่ถูกต้อง'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร')
    .matches(passwordPattern)
    .withMessage('รหัสผ่านต้องมีอักษรพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('ชื่อต้องอย่างน้อย 2 ตัวอักษร'),
  handleValidationErrors
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email ไม่ถูกต้อง'),
  body('password')
    .notEmpty()
    .withMessage('ต้องกรอกรหัสผ่าน'),
  handleValidationErrors
];

exports.validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email ไม่ถูกต้อง'),
  handleValidationErrors
];

exports.validateResetPassword = [
  param('token')
    .notEmpty()
    .withMessage('ต้องการ token รีเซ็ต'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร')
    .matches(passwordPattern)
    .withMessage('รหัสผ่านต้องมีอักษรพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข'),
  body('confirmPassword')
    .optional()
    .custom((value, { req }) => !value || value === req.body.password)
    .withMessage('รหัสผ่านไม่ตรงกัน'),
  handleValidationErrors
];

exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('ต้องกรอกรหัสผ่านปัจจุบัน'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('รหัสผ่านใหม่ต้องอย่างน้อย 8 ตัวอักษร')
    .matches(passwordPattern)
    .withMessage('รหัสผ่านต้องมีอักษรพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข'),
  body('confirmPassword')
    .optional()
    .custom((value, { req }) => !value || value === req.body.newPassword)
    .withMessage('รหัสผ่านไม่ตรงกัน'),
  handleValidationErrors
];

// ===== PRODUCT VALIDATORS =====
exports.validateProductCreate = [
  body('title')
    .trim()
    .isLength({ min: 3 })
    .withMessage('ชื่อสินค้าต้องอย่างน้อย 3 ตัวอักษร'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('ราคาต้องเป็นตัวเลขบวก'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('จำนวนต้องเป็นตัวเลขบวก'),
  body('categoryId')
    .notEmpty()
    .withMessage('ต้องเลือกหมวดหมู่'),
  handleValidationErrors
];

exports.validateProductUpdate = [
  param('id')
    .isInt()
    .withMessage('Invalid product ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  handleValidationErrors
];

exports.validateTrackingNumber = [
  param('orderId')
    .isInt()
    .withMessage('Invalid order ID'),
  body('trackingNumber')
    .trim()
    .notEmpty()
    .withMessage('Tracking number is required'),
  handleValidationErrors
];
