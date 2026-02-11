import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2, Lock, KeyRound, Check, X } from "lucide-react"; // เพิ่ม Check, X ถ้าอยากใช้ icon

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- 🔥 จุดที่ 1: Logic เช็คความปลอดภัย (Real-time) ---
  const isValidLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirm) {
      return toast.error("รหัสผ่านไม่ตรงกัน");
    }

    // ใช้ Logic เดียวกันเช็คก่อนส่ง (เพื่อความชัวร์)
    if (!isValidLength || !hasUpper || !hasLower || !hasNumber) {
        return toast.error("รหัสผ่านไม่ผ่านตามเงื่อนไขความปลอดภัย");
    }

    setLoading(true);
    try {
      const res = await api.post(`/reset-password/${token}`, { password });
      toast.success(res.data.message || "รีเซ็ตรหัสผ่านสำเร็จ");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-amber-100 p-4 rounded-full">
              <KeyRound className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">รีเซ็ตรหัสผ่าน</h1>
          <p className="text-gray-500 text-sm sm:text-base">ตั้งค่ารหัสผ่านใหม่ที่ปลอดภัยของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่านใหม่"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* --- 🔥 จุดที่ 2: แสดงผล Visual Feedback ตรงนี้ --- */}
            {password.length > 0 && (
                <div className="flex gap-2 text-xs mt-2 flex-wrap p-2 bg-gray-50 rounded-md border border-gray-100">
                    <span className={`flex items-center gap-1 ${isValidLength ? "text-green-600 font-medium" : "text-gray-400"}`}>
                        {isValidLength ? <Check size={12}/> : <div className="w-3 h-3 rounded-full bg-gray-300"/>} 8 ตัวอักษร
                    </span>
                    <span className={`flex items-center gap-1 ${hasUpper ? "text-green-600 font-medium" : "text-gray-400"}`}>
                        {hasUpper ? <Check size={12}/> : <div className="w-3 h-3 rounded-full bg-gray-300"/>} ตัวใหญ่
                    </span>
                    <span className={`flex items-center gap-1 ${hasLower ? "text-green-600 font-medium" : "text-gray-400"}`}>
                        {hasLower ? <Check size={12}/> : <div className="w-3 h-3 rounded-full bg-gray-300"/>} ตัวเล็ก
                    </span>
                    <span className={`flex items-center gap-1 ${hasNumber ? "text-green-600 font-medium" : "text-gray-400"}`}>
                        {hasNumber ? <Check size={12}/> : <div className="w-3 h-3 rounded-full bg-gray-300"/>} ตัวเลข
                    </span>
                </div>
            )}
            {/* ----------------------------------------------- */}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="ยืนยันรหัสผ่าน"
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                    confirm && password !== confirm 
                    ? "border-red-500 focus:ring-red-500" // แดงถ้ารหัสไม่ตรง
                    : "border-gray-300 focus:ring-amber-500"
                }`}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
             {/* แจ้งเตือนถ้ารหัสไม่ตรง */}
             {confirm && password !== confirm && (
                <p className="text-xs text-red-500 mt-1 pl-1">รหัสผ่านไม่ตรงกัน</p>
             )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isValidLength || !hasUpper || !hasLower || !hasNumber || password !== confirm} // ปิดปุ่มถ้าเงื่อนไขไม่ครบ
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 sm:py-3 rounded-lg shadow-md transition-all duration-200 flex justify-center items-center disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                <span>กำลังรีเซ็ต...</span>
              </>
            ) : (
              <span>รีเซ็ตรหัสผ่าน</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 border-t pt-6">
          <p>
            จำรหัสผ่านได้แล้ว?{" "}
            <Link to="/login" className="text-amber-600 hover:text-amber-700 hover:underline font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;