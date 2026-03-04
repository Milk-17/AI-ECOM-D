import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, LogIn } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const actionLogin = useEcomStore((state) => state.actionLogin);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOnChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await actionLogin(form);
      const role = res.data.payload.role;
      roleRedirect(role);
      toast.success("ยินดีต้อนรับกลับมา");
    } catch (err) {
      console.log(err);
      const status = err.response?.status;
      const data = err.response?.data;
      // รองรับทั้ง JSON { message: "..." } และ plain string
      const errMsg = typeof data === 'string' ? data : data?.message;

      if (status === 429) {
        toast.warning(errMsg || 'คุณลองเข้าสู่ระบบมากเกินไป กรุณารอสักครู่', { autoClose: 5000 });
      } else {
        toast.error(errMsg || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    } finally {
      setLoading(false);
    }
  };

  const roleRedirect = (role) => {
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 text-sm sm:text-base">ยินดีต้อนรับกลับมา กรุณากรอกข้อมูลของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">อีเมล</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                placeholder="your@email.com"
                type="email"
                onChange={handleOnChange}
                name="email"
                value={form.email}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                placeholder="กรอกรหัสผ่าน"
                type={showPassword ? "text" : "password"}
                onChange={handleOnChange}
                name="password"
                value={form.password}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link 
              to="/forgot-password" 
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 rounded-lg shadow-md transition-all duration-200 flex justify-center items-center disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <span>เข้าสู่ระบบ</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 border-t pt-6">
          <p>
            ยังไม่มีบัญชี?{" "}
            <Link 
              to="/register" 
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              สมัครสมาชิก
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;