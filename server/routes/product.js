const express = require('express');
const router = express.Router();

// Controller
const { 
    create,
    list,
    read,
    update,
    remove,
    listby,
    searchFilters,
    createImages,
    removeImage,
    listAdminLogs,
    getAllProductPriceHistory,
   
} = require('../controllers/product');

const { adminCheck, authCheck } = require('../middlewares/authCheck');
const { validateProductCreate, validateProductUpdate } = require('../middlewares/validators');

// ===== PRODUCT ROUTES =====
// Endpoint http://103.91.205.96:5001/api/product

// Public routes
router.get('/products/:count', list);
router.get('/product/:id', read);
router.post('/productby', listby);
router.post('/search/filters', searchFilters);

// Admin routes (ต้องเป็น admin)
router.post('/product', authCheck, adminCheck, validateProductCreate, create);
router.put('/product/:id', authCheck, adminCheck, validateProductUpdate, update);
router.delete('/product/:id', authCheck, adminCheck, remove);

router.post('/images', authCheck, adminCheck, createImages);
router.post('/removeimages', authCheck, adminCheck, removeImage);

// Admin logs
router.get('/product/admin/logs', authCheck, adminCheck, listAdminLogs);
router.get('/productpricehistory', authCheck, adminCheck, getAllProductPriceHistory);

module.exports = router;
