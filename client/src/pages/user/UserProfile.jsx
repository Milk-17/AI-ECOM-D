// client/src/pages/user/UserProfile.jsx
import React, { useState, useEffect } from "react";
import useEcomStore from "../../store/ecom-store";
import { updateUserProfile, changePassword } from "../../api/user"; // ✅ Import changePassword เพิ่ม
import { toast } from "react-toastify";
import { User, Mail, Edit2, Save, MapPin, History, X, CheckCircle, Lock, Key } from "lucide-react"; // ✅ เพิ่ม Icon
import { Link } from "react-router-dom";
import moment from "moment/min/moment-with-locales";

const avatars = [
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Apples",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Midnight",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=George",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Precious",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Missy",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Dusty"
];

const UserProfile = () => {
  const user = useEcomStore((state) => state.user);
  const token = useEcomStore((state) => state.token);
  const actionUpdateUser = useEcomStore((state) => state.actionUpdateUser);

  // --- State: ข้อมูล Profile ---
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    updatedAt: "",
    picture: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- State: เปลี่ยนรหัสผ่าน ---
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangePassword, setIsChangePassword] = useState(false); // เปิด/ปิด Card เปลี่ยนรหัส
  const [loadingPass, setLoadingPass] = useState(false);


  // Sync Data
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        updatedAt: user.updatedAt || "",
        picture: user.picture || avatars[0]
      });
    }
  }, [user]);

  // Handle Profile Inputs
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Handle Password Inputs
  const handleChangePassword = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const selectAvatar = (url) => {
    setUserData({ ...userData, picture: url });
  };

  // --- Submit: Update Profile ---
  const handleUpdateProfile = async () => {
    if (!userData.name) return toast.warning("กรุณากรอกชื่อ");

    setLoading(true);
    try {
      const res = await updateUserProfile(token, { 
        name: userData.name,
        picture: userData.picture 
      });
      
      actionUpdateUser({
        name: userData.name,
        picture: userData.picture
      });

      toast.success("บันทึกข้อมูลสำเร็จ!");
      setIsEditing(false);
    } catch (err) {
      console.log(err);
      const errMsg = err.response?.data?.message || "อัปเดตไม่สำเร็จ";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Submit: Change Password ---
  const handleUpdatePassword = async () => {
     const { currentPassword, newPassword, confirmPassword } = passwordData;

     if (!currentPassword || !newPassword || !confirmPassword) {
         return toast.warning("กรุณากรอกข้อมูลให้ครบถ้วน");
     }
     if (newPassword !== confirmPassword) {
         return toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
     }
     if (newPassword.length < 6) {
         return toast.warning("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
     }

     setLoadingPass(true);
     try {
         const res = await changePassword(token, { currentPassword, newPassword });
         toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
         setIsChangePassword(false);
         // เคลียร์ค่า Form
         setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
     } catch (err) {
         console.log(err);
         const errMsg = err.response?.data?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ (รหัสเดิมอาจผิด)";
         toast.error(errMsg);
     } finally {
         setLoadingPass(false);
     }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <User className="text-blue-600" /> ข้อมูลส่วนตัว (My Profile)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- Card 1: รูปโปรไฟล์ (ซ้าย) --- */}
        <div className="md:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center">
            <div className="relative mb-6 group">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                {userData.picture ? (
                    <img 
                        src={userData.picture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onError = null; e.target.src = "https://cdn-icons-png.flaticon.com/128/149/149071.png"; }}
                    />
                ) : (
                    <User size={64} className="text-blue-400" />
                )}
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{userData.name || "User"}</h2>

          </div>
        </div>

        {/* --- ส่วนขวา (รวม Card ข้อมูล และ Card รหัสผ่าน) --- */}
        <div className="md:col-span-2 space-y-6">
            
            {/* --- Card 2: รายละเอียดบัญชี --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-700">รายละเอียดบัญช (Account details)</h3>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${isEditing ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                    >
                        {isEditing ? <><X size={16}/> ยกเลิก</> : <><Edit2 size={16}/> แก้ไขข้อมูล</>}
                    </button>
                </div>

                <div className="space-y-5">
                    {/* ส่วนเลือก Avatar (ซ่อน/แสดง) */}
                    {isEditing && (
                        <div className="mb-6 animate-fade-in bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">เลือกรูปโปรไฟล์ใหม่ (Choose a new profile picture )</label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 justify-items-center">
                                {avatars.map((url, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => selectAvatar(url)}
                                        className={`relative cursor-pointer rounded-full p-1 transition-all duration-200 
                                            ${userData.picture === url ? 'ring-2 ring-blue-500 scale-110 bg-white shadow-sm' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={url} alt="avatar" className="w-10 h-10 rounded-full bg-gray-200"/>
                                        {userData.picture === url && <div className="absolute -top-1 -right-1 text-blue-500 bg-white rounded-full shadow-sm"><CheckCircle size={14}/></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Form Profile */}
                    <div>
                        
                        {isEditing ? (
                            <input name="name" value={userData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"/>
                        ) : (
                            <div className="text-gray-800 font-medium py-2 px-1 border-b border-transparent">{userData.name}</div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 cursor-not-allowed">
                            <Mail size={16} /><span>{userData.email}</span>
                        </div>
                    </div>

                    {/* ปุ่ม Save Profile */}
                    {isEditing && (
                        <div className="pt-4 flex justify-end animate-fade-in">
                            <button onClick={handleUpdateProfile} disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2 disabled:bg-gray-400">
                                {loading ? "กำลังบันทึก..." : <><Save size={18} /> บันทึกการเปลี่ยนแปลง</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Card 3: เปลี่ยนรหัสผ่าน (เพิ่มใหม่) --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <Lock size={20} className="text-gray-400"/> ความปลอดภัยและรหัสผ่าน (Security and password)
                    </h3>
                    <button 
                        onClick={() => setIsChangePassword(!isChangePassword)}
                        className="text-blue-600 text-sm hover:underline font-medium"
                    >
                        {isChangePassword ? "ซ่อน" : "เปลี่ยนรหัสผ่าน"}
                    </button>
                </div>

                {isChangePassword && (
                    <div className="animate-fade-in space-y-4 pt-4 border-t border-gray-100">
                        {/* รหัสผ่านปัจจุบัน */}
                        <div className="relative">
                            <Key size={16} className="absolute top-3 left-3 text-gray-400"/>
                            <input 
                                type="password" 
                                name="currentPassword"
                                placeholder="รหัสผ่านปัจจุบัน"
                                value={passwordData.currentPassword}
                                onChange={handleChangePassword}
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* รหัสผ่านใหม่ */}
                            <div className="relative">
                                <Lock size={16} className="absolute top-3 left-3 text-gray-400"/>
                                <input 
                                    type="password" 
                                    name="newPassword"
                                    placeholder="รหัสผ่านใหม่"
                                    value={passwordData.newPassword}
                                    onChange={handleChangePassword}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            {/* ยืนยันรหัสผ่าน */}
                            <div className="relative">
                                <Lock size={16} className="absolute top-3 left-3 text-gray-400"/>
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    placeholder="ยืนยันรหัสผ่านใหม่"
                                    value={passwordData.confirmPassword}
                                    onChange={handleChangePassword}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                             <button 
                                onClick={handleUpdatePassword}
                                disabled={loadingPass}
                                className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-black transition flex items-center gap-2 disabled:bg-gray-400 shadow-sm"
                            >
                                {loadingPass ? "กำลังเปลี่ยน..." : "ยืนยันการเปลี่ยนรหัสผ่าน"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* เมนูลัด */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/user/history" className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition flex items-center gap-4 group">
                    <div className="bg-blue-50 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition"><History size={24} /></div>
                    <div><h4 className="font-bold text-gray-800">ประวัติการสั่งซื้อ</h4><p className="text-xs text-gray-500">ติดตามสถานะสินค้าของคุณ</p></div>
                </Link>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-green-400 hover:shadow-md transition flex items-center gap-4 group cursor-pointer">
                    <div className="bg-green-50 p-3 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition"><MapPin size={24} /></div>
                    <div><h4 className="font-bold text-gray-800">ที่อยู่จัดส่ง</h4><p className="text-xs text-gray-500">จัดการที่อยู่ของคุณ</p></div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile; 