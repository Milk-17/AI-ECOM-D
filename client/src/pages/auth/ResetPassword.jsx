// หน้า ResetPassword
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, Loader2, Lock, KeyRound } from "lucide-react";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check validation เบื้องต้น
    if (password !== confirm) {
      return toast.error("รหัสผ่านไม่ตรงกัน");
    }
    if (password.length < 8) {
      return toast.error("รหัสผ่านต้องอย่างน้อย 8 ตัวอักษร");
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
          <p className="text-gray-500 text-sm sm:text-base">กรอกรหัสผ่านใหม่ของคุณ</p>
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
            <p className="text-xs text-gray-500 mt-1">
              ต้อง: 8+ ตัวอักษร, ตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข
            </p>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="ยืนยันรหัสผ่าน"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 sm:py-3 rounded-lg shadow-md transition-all duration-200 flex justify-center items-center disabled:bg-amber-400 disabled:cursor-not-allowed"
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
            <Link 
              to="/login" 
              className="text-amber-600 hover:text-amber-700 hover:underline font-medium"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;