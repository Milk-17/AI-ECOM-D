const prisma = require("../config/prisma");
const cloudinary = require('cloudinary').v2;

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ===================== CREATE PRODUCT =====================
exports.create = async (req, res) => {
    try {
        const { title, description, price, quantity, categoryId, images, productUrl } = req.body;

        const exist = await prisma.product.findFirst({ where: { title } });
        if (exist) return res.status(400).json({ message: `Product "${title}" มีอยู่แล้ว` });

        const subCatId = parseInt(categoryId);
        
        const subCategoryInfo = await prisma.subCategory.findUnique({
            where: { id: subCatId }
        });

        if (!subCategoryInfo) {
            return res.status(400).json({ message: "ไม่พบหมวดหมู่ย่อยที่ระบุ" });
        }

        const product = await prisma.product.create({
            data: {
                title,
                description: typeof description === 'string' ? JSON.parse(description) : description,
                price: parseFloat(price),
                quantity: Number(quantity),
                productUrl: productUrl || `/product/${null}`,
                categoryId: subCategoryInfo.categoryId,
                subCategoryId: subCatId,
                images: {
                    create: images.map(item => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url,
                    }))
                }
            }
        });

        const updatedProduct = await prisma.product.update({
            where: { id: product.id },
            data: { productUrl: `/product/${product.id}` }
        });

        await prisma.adminLog.create({
            data: {
                adminId: req.user.id,
                action: "create",
                productId: product.id,
                message: `เพิ่มสินค้า ${product.title}`,
            }
        });

        await prisma.productPriceHistory.create({
            data: {
                productId: product.id,
                oldPrice: 0,
                newPrice: parseFloat(price),
                changedById: req.user.id,
            }
        });

        res.send(updatedProduct);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "create product controllers Error" });
    }
};  

// ===================== LIST PRODUCTS =====================
exports.list = async(req,res) =>{
    try{
        const {count} = req.params;
        const products = await prisma.product.findMany({
            take: parseInt(count),
            orderBy: { createdAt : "desc"},
            include: {
                category: true,
                subCategory: true,
                images: true
            } 
        });
        res.send(products);

    } catch (err){
        console.log(err);
        res.status(500).json({ message : "list product controllers Error" })
    }
};

// ===================== READ PRODUCT (Support ID-Slug) =====================
exports.read = async (req, res) => {
    try {
        const { id } = req.params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
             return res.status(400).json({ message: "Invalid Product ID" });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: true,
                subCategory: true,
                images: true
            }
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.send(product);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Read product failed" });
    }
};

// ===================== UPDATE PRODUCT =====================
exports.update = async (req, res) => {
    try {
        //  แก้ไข 2: เพิ่ม productUrl ในการรับค่าเพื่ออัปเดต
        const { title, description, price, quantity, categoryId, images, properties, productUrl } = req.body;
        const productId = Number(req.params.id);

        // 1. ดึงข้อมูลสินค้า "เดิม" มาก่อน (เพื่อเอาราคาเก่ามาเก็บประวัติ)
        const originalProduct = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!originalProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // 2. *** Logic บันทึกประวัติราคา (เปิดใช้งานแล้ว) ***
        const oldPrice = originalProduct.price;
        const newPrice = parseFloat(price);

        if (oldPrice !== newPrice) {
            await prisma.productPriceHistory.create({
                data: {
                    productId: productId,
                    oldPrice: oldPrice,
                    newPrice: newPrice,
                    changedById: req.user.id,
                }
            });
        }


        await prisma.image.deleteMany({
            where: { productId: productId },
        });

        const subCatId = parseInt(categoryId);
        const subCategoryInfo = await prisma.subCategory.findUnique({
            where: { id: subCatId }
        });

        if (!subCategoryInfo) {
            return res.status(400).json({ message: "SubCategory not found" });
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                title: title,
                description: typeof description === 'string' ? JSON.parse(description) : description,
                price: newPrice,
                quantity: parseInt(quantity),
                productUrl: productUrl || `/product/${productId}`,
                categoryId: subCategoryInfo.categoryId,
                subCategoryId: subCatId,
                ...(images && images.length > 0 && {
                    images: {
                        create: images.map((item) => ({
                            asset_id: item.asset_id,
                            public_id: item.public_id,
                            url: item.url,
                            secure_url: item.secure_url,
                        })),
                    },
                }),
            },
        });

        res.send(product);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Update product failed" });
    }
};

exports.remove = async(req,res) => {
    try{
        const {id} = req.params;

        const product = await prisma.product.findUnique({
            where : { id: Number(id) },
            include: { images: true }
        });

        if (!product){
            return res.status(400).json ({ message : 'No Product!!!' });
        }

        const deleteImage = product.images.map((image) =>
            new Promise((resolve,reject) =>{
                cloudinary.uploader.destroy(image.public_id,(error,result) =>{
                    if (error) reject(error);
                    else resolve(result);
                })
            })
        );
        await Promise.all(deleteImage);

        await prisma.adminLog.create({
            data:{
                adminId: req.user.id,
                action: "delete",
                productId: Number(id),
                message: `ลบสินค้า ${product.title}`
            }
        });

        await prisma.product.delete({ where:{ id:Number(id) } });

        res.send('Deleted Success');

    } catch (err){
        console.log(err);
        res.status(500).json({ message : "remove product controllers Error" });
    }
};

// ===================== SEARCH / FILTER =====================
const handleQuery = async(req,res,query) => {
     try{
    const products = await prisma.product.findMany({
    where: { 
                    title: { 
                        contains: query
                    } 
                },
    include: { category:true, subCategory:true, images:true }
     });
     res.send(products);
     } catch (err){
     console.log(err);
     res.status(500).json({ message:"handleQuery Error"});
     }
    };

const handlePrice = async(req,res,priceRange) =>{
    try{
        const products = await prisma.product.findMany({
            where:{ price:{ gte: priceRange[0], lte: priceRange[1] } },
            include:{ category:true, subCategory:true, images:true }
        });
        res.send(products);
    } catch (err){
        console.log(err);
        res.status(500).json({ message: "handlePrice Error"});
    }
};

const handleCategory = async(req,res,categoryId) =>{
     try{
     const products = await prisma.product.findMany({
     where:{ 
                    subCategoryId: {  
                        in: categoryId.map(id=> Number(id)) 
                    } 
                },
     include:{ category:true, subCategory:true, images:true }
     });
     res.send(products);
     } catch (err){
     console.log(err);
     res.status(500).json({ message: "handleCategory Error"});
     }
    };

exports.searchFilters = async(req,res) =>{
    try{
        const { query, category, price } = req.body;
        if(query) await handleQuery(req,res,query);
        if(category) await handleCategory(req,res,category);
        if(price) await handlePrice(req,res,price);
    } catch (err){
        console.log(err);
        res.status(500).json({ message : "searchFilters product controllers Error" })
    }
};

exports.createImages = async (req,res) => {
    try{
        const result = await cloudinary.uploader.upload(req.body.image,{
            public_id: `EcomAI-${Date.now()}`,
            result_type: 'auto',
            folder:'EcomAI'
        });
        res.send(result)
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: "Create Image Error"});
    }
};

exports.removeImage = async (req,res) => {
    try{
        const { public_id } = req.body;
        cloudinary.uploader.destroy(public_id,(result) => {
            res.send('Remove Images Success!!!')
        });
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: "remove Image Error"});
    }
};

exports.listAdminLogs = async (req, res) => {
    try {
        const logs = await prisma.adminLog.findMany({
            include: { admin: true, product: true },
            orderBy: { createdAt: 'desc' }
        });
        res.send(logs);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error in listAdminLogs" });
    }
};

exports.listby = async (req, res) => {
    try {
      const { sort = "createdAt", order = "desc", limit = 10 } = req.body;
      
      const validSortFields = ['id', 'title', 'price', 'sold', 'quantity', 'createdAt', 'updatedAt'];
      const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
      const sortOrder = ['asc', 'desc'].includes(order) ? order : 'desc';
  
      const products = await prisma.product.findMany({
        take: Number(limit),
        orderBy: { [sortField]: sortOrder },
        include: { images: true, category: true, subCategory: true },
      });
  
      res.send(products);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "listby product controllers Error" });
    }
  };

exports.getAllProductPriceHistory = async (req, res) => {
    try {
      const history = await prisma.productPriceHistory.findMany({
        include: {
          changedBy: true, 
          product: true    
        },
        orderBy: {
          changedAt: 'desc' 
        }
      });
      res.json(history);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "getAllProductPriceHistory controllers Error" });
    }
  };