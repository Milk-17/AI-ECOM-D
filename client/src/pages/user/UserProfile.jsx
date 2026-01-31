// client/src/pages/user/UserProfile.jsx
import React, { useState, useEffect } from "react";
import useEcomStore from "../../store/ecom-store";
import { updateUserProfile, changePassword } from "../../api/user";
import { toast } from "react-toastify";
import { User, Mail, Edit2, Save, MapPin, History, X, CheckCircle, Lock, Key, Eye, EyeOff } from "lucide-react";
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


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
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <User size={32} /> ข้อมูลส่วนตัว
        </h1>
        <p className="text-blue-100 mt-2 text-sm">จัดการข้อมูลโปรไฟล์และความปลอดภัยของบัญชีคุณ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- Card 1: รูปโปรไฟล์ (ซ้าย) --- */}
        <div className="md:col-span-1">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg border border-blue-100 flex flex-col items-center text-center">
            <div className="relative mb-6 group">
              <div className="w-36 h-36 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center p-1 shadow-xl">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
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
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{userData.name || "User"}</h2>
            <p className="text-sm text-gray-600 flex items-center gap-1"><Mail size={14}/> {userData.email}</p>
          </div>
        </div>

        {/* --- ส่วนขวา (รวม Card ข้อมูล และ Card รหัสผ่าน) --- */}
        <div className="md:col-span-2 space-y-6">
            
            {/* --- Card 2: รายละเอียดบัญชี --- */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Edit2 size={18} className="text-blue-600"/> รายละเอียดบัญชี
                    </h3>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                          isEditing 
                            ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" 
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                        }`}
                    >
                        {isEditing ? <><X size={16}/> ยกเลิก</> : <><Edit2 size={16}/> แก้ไขข้อมูล</>}
                    </button>
                </div>

                <div className="space-y-5">
                    {/* ส่วนเลือก Avatar (ซ่อน/แสดง) */}
                    {isEditing && (
                        <div className="mb-6 animate-fade-in bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
                            <label className="block text-sm font-bold text-gray-700 mb-4 text-center flex items-center justify-center gap-2">
                              <User size={18} className="text-blue-600"/> เลือกรูปโปรไฟล์ใหม่
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 justify-items-center">
                                {avatars.map((url, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => selectAvatar(url)}
                                        className={`relative cursor-pointer rounded-full p-1 transition-all duration-300 ${
                                          userData.picture === url 
                                            ? 'ring-4 ring-blue-500 scale-110 bg-white shadow-lg' 
                                            : 'hover:scale-110 opacity-60 hover:opacity-100 hover:ring-2 hover:ring-blue-300'
                                        }`}
                                    >
                                        <img src={url} alt="avatar" className="w-12 h-12 rounded-full bg-gray-200"/>
                                        {userData.picture === url && (
                                          <div className="absolute -top-1 -right-1 text-blue-500 bg-white rounded-full shadow-md">
                                            <CheckCircle size={16}/>
                                          </div>
                                        )}
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
                            <button 
                              onClick={handleUpdateProfile} 
                              disabled={loading} 
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? "กำลังบันทึก..." : <><Save size={18} /> บันทึกการเปลี่ยนแปลง</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Card 3: เปลี่ยนรหัสผ่าน (เพิ่มใหม่) --- */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                 <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Lock size={20} className="text-blue-600"/> ความปลอดภัยและรหัสผ่าน
                    </h3>
                    <button 
                        onClick={() => setIsChangePassword(!isChangePassword)}
                        className="text-blue-600 text-sm hover:text-blue-700 font-semibold hover:underline transition"
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
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                placeholder="รหัสผ่านปัจจุบัน"
                                value={passwordData.currentPassword}
                                onChange={handleChangePassword}
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* รหัสผ่านใหม่ */}
                            <div className="relative">
                                <Lock size={16} className="absolute top-3 left-3 text-gray-400"/>
                                <input 
                                    type={showNewPassword ? "text" : "password"}
                                    name="newPassword"
                                    placeholder="รหัสผ่านใหม่"
                                    value={passwordData.newPassword}
                                    onChange={handleChangePassword}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {/* ยืนยันรหัสผ่าน */}
                            <div className="relative">
                                <Lock size={16} className="absolute top-3 left-3 text-gray-400"/>
                                <input 
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="ยืนยันรหัสผ่านใหม่"
                                    value={passwordData.confirmPassword}
                                    onChange={handleChangePassword}
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                             <button 
                                onClick={handleUpdatePassword}
                                disabled={loadingPass}
                                className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white px-8 py-3 rounded-xl transition-all transform hover:scale-105 flex items-center gap-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loadingPass ? "กำลังเปลี่ยน..." : <><Key size={18}/> ยืนยันการเปลี่ยนรหัสผ่าน</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* เมนูลัด */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/user/history" className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-md border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-4 group">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                      <History size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">ประวัติการสั่งซื้อ</h4>
                      <p className="text-xs text-gray-600 mt-1">ติดตามสถานะสินค้าของคุณ</p>
                    </div>
                </Link>
                <Link to="/checkout" className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-md border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-4 group">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                      <MapPin size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">ที่อยู่จัดส่ง</h4>
                      <p className="text-xs text-gray-600 mt-1">จัดการที่อยู่ของคุณ</p>
                    </div>
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile; 