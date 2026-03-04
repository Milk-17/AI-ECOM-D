const prisma = require("../config/prisma")

// ================= ADMIN : Manage Users =================
exports.listUsers = async (req,res) => {
    try{
        const users = await prisma.user.findMany({
            select:{
                id:true,
                email:true,
                role:true,
                enable:true,
                // address:true, //  ลบออก เพราะไม่มี field นี้แล้วในตาราง User
                addresses: true, //  เพิ่มอันนี้แทน เพื่อดูรายการที่อยู่ (Relation)
                updatedAt: true
            }
        })
        res.send(users)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "ดึงข้อมูลผู้ใช้ไม่สำเร็จ"})
    }
}

exports.changeStatus = async (req,res) => {
    try{
        const { id,enable } = req.body
        console.log(id,enable)
        const user = await prisma.user.update({
            where:{ id:Number(id)},
            data:{ enable: enable }
        })

        res.send('อัปเดตสถานะสำเร็จ')

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "อัปเดตสถานะไม่สำเร็จ"})
    }
}

exports.changeRole = async (req,res) => {
    try{
        const { id,role } = req.body
   
        const user = await prisma.user.update({
            where:{ id:Number(id)},
            data:{ role: role }
        })
        res.send('เปลี่ยนสิทธิ์สำเร็จ')

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "เปลี่ยนสิทธิ์ไม่สำเร็จ"})
    }
}

// ================= USER : Cart System =================
exports.userCart = async (req, res) => {
    try {
      const { cart } = req.body;
      const user = await prisma.user.findFirst({
        where: { id: Number(req.user.id) },
      });
  
      // Check quantity
      for (const item of cart) {
        const product = await prisma.product.findUnique({
          where: { id: item.id },
          select: { quantity: true, title: true },
        });
        if (!product || item.count > product.quantity) {
          return res.status(400).json({
            ok: false,
            message: `ขออภัย. สินค้า ${product?.title || "product"} หมด`,
          });
        }
      }
  
      // Deleted old Cart item
      await prisma.productOnCart.deleteMany({
        where: {
          cart: {
            orderedById: user.id,
          },
        },
      });
      // Deeted old Cart
      await prisma.cart.deleteMany({
        where: { orderedById: user.id },
      });
  
      // เตรียมสินค้า
      let products = cart.map((item) => ({
        productId: item.id,
        count: item.count,
        price: item.price,
      }));
  
      // หาผลรวม
      let cartTotal = products.reduce(
        (sum, item) => sum + item.price * item.count,
        0
      );
  
      // New cart
      const newCart = await prisma.cart.create({
        data: {
          products: {
            create: products,
          },
          cartTotal: cartTotal,
          orderedById: user.id,
        },
      });
      console.log(newCart);
      res.send("เพิ่มสินค้าลงตะกร้าแล้ว");
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกตะกร้า" });
    }
};

exports.getUserCart = async (req,res) => {
    try{
        const cart  = await prisma.cart.findFirst({
            where:{
                orderedById: Number(req.user.id)
            },
            include:{
                products:{
                    include:{
                        product:true
                    }
                }
            }
        })
        //console.log(cart)
        if (!cart) {
            return res.json({ products: [], cartTotal: 0 });
        }
        res.json({
            products: cart.products,
            cartTotal: cart.cartTotal
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "ดึงข้อมูลตะกร้าไม่สำเร็จ"})
    }
}

exports.emptyCart = async (req,res) => {
    try{
        const cart = await prisma.cart.findFirst({
            where: { orderedById: Number(req.user.id)}
        })
        if(!cart){
            return res.status(400).json({ message : 'ไม่พบตะกร้าสินค้า'})
        }
        await prisma.productOnCart.deleteMany({
            where: { cartId: cart.id}
        })
        const result = await prisma.cart.deleteMany({
            where:{ orderedById: Number(req.user.id)}
        })
    
        console.log(result)
        res.json({
            message : 'ล้างตะกร้าเรียบร้อยแล้ว',
            deletedCount: result.count
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "ล้างตะกร้าไม่สำเร็จ"})
    }
}

// ================= USER : Address System (NEW) =================

// 1. เพิ่มที่อยู่ใหม่ (Create) - ป้องกันซ้ำ
exports.saveAddress = async (req,res) => {
  try{
      // 1. รับค่าและตัดช่องว่าง (Trim) เพื่อความแม่นยำ
      const { addrDetail, province, district, subDistrict, zipcode, recipient, phone, isMain } = req.body

      const cleanAddrDetail = addrDetail?.trim();
      const cleanProvince = province?.trim();
      const cleanDistrict = district?.trim();
      const cleanSubDistrict = subDistrict?.trim();
      const cleanZipcode = zipcode?.trim();


      // 2. เช็คซ้ำ (ใช้ค่าที่ Trim แล้ว)
      const existingAddress = await prisma.address.findFirst({
          where: {
              userId: req.user.id,
              addrDetail: cleanAddrDetail,
              province: cleanProvince,
              district: cleanDistrict,
              subDistrict: cleanSubDistrict,
              zipcode: cleanZipcode
          }
      });

      if (existingAddress) {
          return res.status(400).json({ ok: false, message: "ที่อยู่นี้มีอยู่ในระบบแล้วครับ (ซ้ำ)" });
      }

      // 3. ถ้าเป็น Main ให้เคลียร์อันอื่น (ใช้ transaction ป้องกัน race condition)
      const address = await prisma.$transaction(async (tx) => {
          if (isMain) {
              await tx.address.updateMany({
                  where: { userId: req.user.id },
                  data: { isMain: false }
              });
          }

          // 4. บันทึก (ใช้ค่าที่ Trim แล้ว)
          return await tx.address.create({
              data:{
                  addrDetail: cleanAddrDetail,
                  province: cleanProvince,
                  district: cleanDistrict,
                  subDistrict: cleanSubDistrict,
                  zipcode: cleanZipcode,
                  recipient: recipient?.trim(),
                  phone: phone?.trim(),
                  isMain: isMain || false,
                  userId: req.user.id
              }
          });
      });

      res.json({ ok: true, message: "เพิ่มที่อยู่เรียบร้อยแล้ว" })

  } catch (err) {
      console.log(err)
      res.status(500).json({ message: "บันทึกที่อยู่ไม่สำเร็จ"})
  }
};

// 2. ดึงรายการที่อยู่ (Read) - (เหมือนเดิม)
exports.getAddresses = async (req, res) => {
  try {
      const addresses = await prisma.address.findMany({
          where: { userId: req.user.id },
          orderBy: { createdAt: 'desc' }
      });
      res.json(addresses);
  } catch (err) {
      console.log(err);
      res.status(500).json({ message: "ดึงข้อมูลที่อยู่ไม่สำเร็จ" });
  }
};

// 3. แก้ไขที่อยู่ (Update)
exports.updateAddress = async (req, res) => {
  try {
      const { addressId, isMain, addrDetail, province, district, subDistrict, zipcode, recipient, phone } = req.body;

      // Validation ID
      if (!addressId) {
          return res.status(400).json({ message: "กรุณาระบุรหัสที่อยู่" });
      }

      // ถ้าจะตั้งเป็น Main ให้เคลียร์อันอื่นก่อน (ใช้ transaction ป้องกัน race condition)
      if (isMain) {
          await prisma.$transaction(async (tx) => {
              await tx.address.updateMany({
                  where: { userId: req.user.id },
                  data: { isMain: false }
              });
              await tx.address.update({
                  where: {
                      id: Number(addressId),
                      userId: req.user.id
                  },
                  data: {
                      ...(addrDetail && { addrDetail: addrDetail.trim() }),
                      ...(province && { province: province.trim() }),
                      ...(district && { district: district.trim() }),
                      ...(subDistrict && { subDistrict: subDistrict.trim() }),
                      ...(zipcode && { zipcode: zipcode.trim() }),
                      ...(recipient && { recipient: recipient.trim() }),
                      ...(phone && { phone: phone.trim() }),
                      isMain: true
                  }
              });
          });
      } else {
          await prisma.address.update({
              where: {
                  id: Number(addressId),
                  userId: req.user.id
              },
              data: {
                  ...(addrDetail && { addrDetail: addrDetail.trim() }),
                  ...(province && { province: province.trim() }),
                  ...(district && { district: district.trim() }),
                  ...(subDistrict && { subDistrict: subDistrict.trim() }),
                  ...(zipcode && { zipcode: zipcode.trim() }),
                  ...(recipient && { recipient: recipient.trim() }),
                  ...(phone && { phone: phone.trim() }),
                  isMain: false
              }
          });
      }

      res.json({ ok: true, message: "แก้ไขที่อยู่เรียบร้อยแล้ว" });
  } catch (err) {
      console.log(err);
      res.status(500).json({ message: "แก้ไขที่อยู่ไม่สำเร็จ" });
  }
};

// 4. ลบที่อยู่ (Delete) - (เหมือนเดิม)
exports.deleteAddress = async (req, res) => {
  try {
      const { id } = req.params;

      await prisma.address.delete({
          where: {
              id: Number(id),
              userId: req.user.id
          }
      });

      res.json({ ok: true, message: "ลบที่อยู่เรียบร้อยแล้ว" });
  } catch (err) {
      console.log(err);
      res.status(500).json({ message: "ลบที่อยู่ไม่สำเร็จ" });
  }
};

// ================= USER : Order System (UPDATED) =================
exports.saveOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // รับ addressId มาจากหน้าบ้าน (เปลี่ยนจากรับ address object มาเป็น ID)
    const { addressId } = req.body; 

    // 1. ค้นหาที่อยู่เพื่อทำ Snapshot (สำคัญมาก)
    const addressInfo = await prisma.address.findUnique({
        where: { id: Number(addressId) }
    });

    if (!addressInfo) {
        return res.status(400).json({ message: "ไม่พบที่อยู่จัดส่ง" });
    }

    // สร้าง String ที่อยู่สำหรับบันทึกถาวร
    const shippingAddressText = `
      ผู้รับ: ${addressInfo.recipient || 'ไม่ระบุ'} 
      เบอร์โทร: ${addressInfo.phone || 'ไม่ระบุ'}
      ที่อยู่: ${addressInfo.addrDetail} 
      ตำบล/แขวง: ${addressInfo.subDistrict} 
      อำเภอ/เขต: ${addressInfo.district} 
      จังหวัด: ${addressInfo.province} 
      รหัสไปรษณีย์: ${addressInfo.zipcode}
    `.trim().replace(/\s+/g, ' ');

    const order = await prisma.$transaction(async (tx) => {
      // 2. ดึงข้อมูลตะกร้า
      const cart = await tx.cart.findFirst({
        where: { orderedById: userId },
        include: { products: { include: { product: true } } },
      });

      if (!cart || cart.products.length === 0) {
        throw new Error("ตะกร้าสินค้าว่างเปล่า");
      }

      // 3. เช็คสต็อก และ ตัดสต็อกสินค้า
      for (const item of cart.products) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product || item.count > product.quantity) {
          throw new Error(
            `ขออภัย สินค้า "${product?.title || 'Unknown'}" หมด หรือมีไม่พอ (เหลือ ${product?.quantity || 0} ชิ้น)`
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.count },
            sold: { increment: item.count }
          }
        });
      }

      // 4. สร้าง Order (เพิ่ม shippingAddress)
      const newOrder = await tx.order.create({
        data: {
          orderedById: userId,
          cartTotal: cart.cartTotal,
          products: {
            create: cart.products.map((item) => ({
              productId: item.productId,
              count: item.count,
              price: item.price,
            })),
          },
          orderStatus: "Not Process",
          amount: cart.cartTotal,
          status: "Paid", // ถ้ายังไม่ได้จ่ายจริง อาจจะปรับเป็น "Pending" ได้
          
          //  บันทึก Snapshot ที่อยู่
          shippingAddress: shippingAddressText 
        },
      });

      // 5. เคลียร์ Cart
      await tx.productOnCart.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.delete({ where: { id: cart.id } });

      return newOrder;
    });

    res.json({ message: "สั่งซื้อสำเร็จเรียบร้อยแล้ว", order });

  } catch (err) {
    console.log(err);
    const message = err.message.includes("ขออภัย") ? err.message : "สร้างคำสั่งซื้อไม่สำเร็จ";
    res.status(500).json({ message: message });
  }
};

exports.getOrder = async (req,res) => {
  try{
      const orders = await prisma.order.findMany({
          where: {
              orderedById: Number(req.user.id)
          },
          include: {
              products: {
                  include: {
                      product: true
                  }
              },
              orderedBy: {
                  select: { id: true, email: true, name: true }
              }
          },
          orderBy: { createdAt: "desc" }
      });

      res.json({ success: true, orders });

  } catch (err) {
      console.log(err);
      res.status(500).json({ message: "ดึงข้อมูลคำสั่งซื้อไม่สำเร็จ" });
  }
};

// ================= USER : Update Profile (Simple Version) =================
exports.updateProfile = async (req, res) => {
  try {
    // ต้องรับ picture เข้ามาด้วย
    const { name, picture } = req.body; 
    
    // อัปเดตข้อมูล
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        name: name,
        picture: picture
      }
    });

    // ส่งข้อมูลกลับ (ตัด password ออก)
    const { password, ...userData } = user;
    
    res.json({
      message: "บันทึกข้อมูลโปรไฟล์สำเร็จ",
      user: userData
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "อัปเดตโปรไฟล์ไม่สำเร็จ" });
  }
};  

// ================= USER : Change Password =================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(400).json({ message: "ไม่พบข้อมูลผู้ใช้ในระบบ" });
    }

    // 1. เช็คว่ารหัสผ่านเดิมถูกไหม (Old Password Check)
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "รหัสผ่านเดิมไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง" });
    }

    // 2.  เพิ่มการเช็ค: รหัสใหม่ต้องยากพอ (New Password Validation)
    // เงื่อนไข: 8 ตัวขึ้นไป + ตัวใหญ่ + ตัวเล็ก + ตัวเลข
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
          message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัว, มีตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก และตัวเลข" 
      });
    }

    // (Option) เช็คเพิ่ม: รหัสใหม่ต้องไม่ซ้ำกับรหัสเดิม
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
        return res.status(400).json({ message: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม" });
    }

    // 3. Hash และบันทึก
    const hashNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashNewPassword
      }
    });

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
  }
};