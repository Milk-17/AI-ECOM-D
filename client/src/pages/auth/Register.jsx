import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import zxcvbn from "zxcvbn";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, UserPlus, User } from "lucide-react";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// --- Schema Validation (แปลไทย) ---
// Backend requirement: password must have uppercase, lowercase, and numbers (8+ chars)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร" }),
    email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
    password: z.string()
      .min(8, { message: "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" })
      .regex(passwordRegex, { message: "รหัสผ่านต้องมีอักษรพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

const Register = () => {
  const [passwordScore, setPasswordScore] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const password = watch().password;
    if (password) {
      const score = zxcvbn(password).score;
      setPasswordScore(score);
    } else {
      setPasswordScore(0);
    }
  }, [watch().password]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/register", data);

      if (res.data.success) {
        toast.success(res.data.message); // สมมติว่า Backend ส่ง message มา หรือจะแก้เป็น "ลงทะเบียนสำเร็จ" ก็ได้
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน";
      toast.error(errMsg);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = () => {
    switch (passwordScore) {
      case 0:
      case 1: return "bg-red-500";
      case 2: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-green-500";
      default: return "bg-gray-200";
    }
  };

  // แปลระดับความปลอดภัยของรหัสผ่าน
  const getStrengthText = () => {
    switch (passwordScore) {
      case 0:
      case 1: return "อ่อนมาก"; // Very Weak
      case 2: return "อ่อน"; // Weak
      case 3: return "ปานกลาง"; // Good
      case 4: return "ดีมาก"; // Strong
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
             <div className="bg-blue-100 p-3 rounded-full">
                <UserPlus className="w-8 h-8 text-blue-600" />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">สร้างบัญชีผู้ใช้</h1>
          <p className="text-gray-500 text-sm">สมัครสมาชิกวันนี้! กรอกข้อมูลของคุณด้านล่าง</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
            <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                {...register("name")}
                placeholder="กรอกชื่อของคุณ"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">อีเมล</label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                {...register("email")}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="ตั้งรหัสผ่าน"
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}

            {/* Password Strength Meter */}
            {watch().password?.length > 0 && (
                <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">ความปลอดภัย</span>
                        <span className="text-xs font-medium text-gray-700">{getStrengthText()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ${getProgressColor()}`} 
                            style={{ width: `${(passwordScore + 1) * 20}%` }}
                        ></div>
                    </div>
                </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
            <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-md transition-all duration-200 flex justify-center items-center disabled:bg-blue-400 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin mr-2" size={20} /> กำลังลงทะเบียน...
                </>
            ) : (
                "สมัครสมาชิก"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-4">
            มีบัญชีอยู่แล้วใช่ไหม?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
                เข้าสู่ระบบ
            </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;