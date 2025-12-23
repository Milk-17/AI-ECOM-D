import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom"; // อย่าลืม import Link
import { Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react"; // ใช้ Icon สวยๆ

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // เพิ่ม Loading State

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // เริ่มโหลด
    try {
      // ยิงไปที่ Backend (ต้องแน่ใจว่า path ถูกต้อง)
      const res = await axios.post("http://localhost:5001/api/forgot-password", { email });
      toast.success(res.data.message || "ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลแล้ว (Reset link sent!)");
      setEmail(""); // เคลียร์ช่อง
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาด (Something went wrong)");
    } finally {
      setLoading(false); // หยุดโหลดไม่ว่าจะสำเร็จหรือล้มเหลว
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <KeyRound size={32} />
            </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">ลืมรหัสผ่าน?</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
            ไม่ต้องห่วง! กรอกอีเมลของคุณด้านล่าง <br/> เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">อีเมลของคุณ</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10 border border-gray-300 px-3 py-2.5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
              </div>
          </div>

          <button 
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-semibold flex justify-center items-center disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={loading} // ปิดปุ่มขณะโหลด
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin mr-2" size={20} /> กำลังส่ง...
                </>
            ) : (
                "ส่งลิงก์รีเซ็ต (Send Reset Link)"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1 transition">
                <ArrowLeft size={16} /> กลับไปหน้าเข้าสู่ระบบ
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;