const prisma = require('../config/prisma');

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await prisma.cart.findFirst({
      where: { orderedById: userId },
      include: { products: { include: { product: true } } },
    });

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'ตะกร้าสินค้าว่างเปล่า' });
    }

    // ใช้ transaction เพื่อความปลอดภัยของข้อมูล
    const order = await prisma.$transaction(async (tx) => {
      // เช็คสต็อคและหักสต็อค
      for (const item of cart.products) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product || item.count > product.quantity) {
          throw new Error(`สินค้า "${product?.title || 'Unknown'}" หมด หรือมีไม่พอ`);
        }
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.count },
            sold: { increment: item.count },
          },
        });
      }

      // สร้าง order
      const newOrder = await tx.order.create({
        data: {
          orderedById: userId,
          cartTotal: cart.cartTotal,
          products: {
            create: cart.products.map(p => ({
              productId: p.productId,
              count: p.count,
              price: p.price,
            })),
          },
          amount: cart.cartTotal,
          status: 'Paid',
          orderStatus: 'Not Process',
        },
        include: { products: { include: { product: true } } },
      });

      // เคลียร์ตะกร้า
      await tx.productOnCart.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.delete({ where: { id: cart.id } });

      return newOrder;
    });

    res.json(order);
  } catch (err) {
    console.log(err);
    const message = err.message.includes('สินค้า') ? err.message : 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ';
    res.status(500).json({ message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { orderedById: userId },
      include: { products: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'ดึงข้อมูลคำสั่งซื้อไม่สำเร็จ' });
  }
};

// ======= Start Fix: เพิ่มฟังก์ชันสำหรับ Dashboard =======

// ออเดอร์ล่าสุด (5 รายการ)
exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        products: {
          include: { product: true } // ดึงรายละเอียดสินค้า
        },
        orderedBy: {
            select: { id: true, email: true, name: true }
        },
      },
    });
    res.json(orders);
  } catch (err) {
    console.error("getRecentOrders error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงออเดอร์ล่าสุดได้" });
  }
};

// ออเดอร์ที่ยังไม่จัดส่ง
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { orderStatus: "Not Process" },
      orderBy: { createdAt: 'desc' },
      include: {
        products: { include: { product: true } },
        orderedBy: {
            select: { id: true, email: true, name: true }
        },
      },
    });
    res.json(orders);
  } catch (err) {
    console.error("getPendingOrders error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงออเดอร์ที่ยังไม่จัดส่งได้" });
  }
};

// สถิติรวม
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();

    const totalSales = await prisma.order.aggregate({
      _sum: { cartTotal: true }
    });

    const pendingOrders = await prisma.order.count({
      where: { orderStatus: "Not Process" }
    });

    res.json({
      totalOrders,
      totalSales: totalSales._sum.cartTotal || 0,
      pendingOrders,
    });
  } catch (err) {
    console.error("getOrderStats error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงสถิติได้" });
  }
};

exports.updateTrackingNumber = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber } = req.body;

    if (!trackingNumber || trackingNumber.trim() === "") {
      return res.status(400).json({ message: 'กรุณาระบุเลขพัสดุ' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { trackingNumber: trackingNumber }
    });

    res.status(200).json({
      message: 'บันทึกเลขพัสดุสำเร็จ',
      order: updatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกเลขพัสดุ', error: error.message });
  }
};

// ======= End Fix =======