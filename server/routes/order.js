const express = require('express');
const router = express.Router();
const { createOrder, getOrders , getRecentOrders, getPendingOrders, getOrderStats, updateTrackingNumber } = require('../controllers/order'); //  ต้องเป็น function จริงๆ
const { authCheck } = require('../middlewares/authCheck');

router.post("/order", authCheck, createOrder);
router.get("/order", authCheck, getOrders);


router.get("/order/recent", authCheck, getRecentOrders);      // ออเดอร์ล่าสุด
router.get("/order/pending", authCheck, getPendingOrders);    // ออเดอร์ที่ยังไม่จัดส่ง
router.get("/order/stats", authCheck, getOrderStats);         // สถิติรวม

router.put("/order/tracking/:orderId", authCheck, updateTrackingNumber);


module.exports = router;