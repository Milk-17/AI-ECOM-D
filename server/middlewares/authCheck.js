const jwt = require('jsonwebtoken')
const prisma  = require('../config/prisma')

exports.authCheck = async (req,res,next) => {
    try {
        //code
        const headerToken = req.headers.authorization
        // 🔒 REMOVED: console.log(headerToken) - ไม่ log auth header

        if(!headerToken){
            return res.status(401).json({ message: 'No token ,authorization'})
        }
        const token = headerToken.split(" ")[1]

        const decode = jwt.verify(token,process.env.SECRET)
        req.user = decode

        const user = await prisma.user.findFirst({
            where:{
                email: req.user.email
            }
        })
        if(!user || !user.enable){
            return res.status(400).json({ message : 'This account cannot access'}) //ถ้า User ไม่มีหรือปิดอยู่ จะแสดงบรรทัดนี้
        }
        next()
    } catch (err){
        // 🔒 SECURITY: ไม่ log error details ให้ client เห็น
        console.error('Auth verification failed:', err.message); // Log เฉพาะ message
        res.status(401).json({ message: "Token is invalid or expired"})
    }
}


exports.adminCheck = async (req,res,next) =>{
    try{
        //code
        const { email } = req.user
        const adminUser = await prisma.user.findFirst({
            where:{ email: email }
        })    
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ message : 'Acess Deined : Admin Only'})
        }   
        //console.log('admin check',adminUser)
        next()
    }catch(err){
        console.error('Admin check failed:', err.message); // 🔒 ไม่ log full error
        res.status(500).json({message : 'Admin access deied middlewares'})
    }
}
