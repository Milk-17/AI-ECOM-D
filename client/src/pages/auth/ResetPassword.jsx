// หน้า ResetPassword
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false); // เพิ่ม Loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check validation เบื้องต้น
    if (password !== confirm) {
        return toast.error("Passwords do not match");
    }
    if (password.length < 6) {
        return toast.error("Password must be at least 6 characters");
    }

    setLoading(true); // เริ่มโหลด
    try {
      // ตรวจสอบ URL Backend ให้แน่ใจว่า Port 5001 ถูกต้อง
      const res = await axios.post(`http://localhost:5001/api/reset-password/${token}`, { password });
      
      toast.success(res.data.message || "Password reset successful");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false); // หยุดโหลดไม่ว่าจะสำเร็จหรือล้มเหลว
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>
        
        <input
          type="password"
          placeholder="New password"
          className="border px-3 py-2 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading} // ล็อกช่องตอนโหลด
        />
        
        <input
          type="password"
          placeholder="Confirm password"
          className="border px-3 py-2 w-full mb-4 rounded"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          disabled={loading} // ล็อกช่องตอนโหลด
        />
        
        <button 
            className={`w-full py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`}
            disabled={loading}
        >
          {loading ? "Processing..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;