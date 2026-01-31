// import 
const express = require ('express');
const { authCheck , adminCheck} = require('../middlewares/authCheck')
const router = express.Router ();

// Import controllers
const { changeOrderStatus,getOrderAdmin , getOrderStats , getAdminLogs} = require('../controllers/admin')

// ===== ADMIN ROUTES - เพิ่ม adminCheck เพื่อป้องกันการเข้าถึงที่ไม่ได้รับอนุญาต =====
// Enpoint http://103.91.205.96:5001/api/admin
router.put('/admin/order-status', authCheck, adminCheck, changeOrderStatus);  // 🔒 เพิ่ม adminCheck
router.get('/admin/orders', authCheck, adminCheck, getOrderAdmin);             // 🔒 เพิ่ม adminCheck
router.get('/admin/order-stats', authCheck, adminCheck, getOrderStats);         // 🔒 เพิ่ม adminCheck
router.get('/admin/logs', authCheck, adminCheck, getAdminLogs);


module.exports = router 