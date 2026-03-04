import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldX } from "lucide-react";

const LoadingToRedirect = () => {
  const [count, setCount] = useState(3);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((currentCount) => {
        if (currentCount === 1) {
          clearInterval(interval);
          setRedirect(true);
        }
        return currentCount - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  // คำนวณ progress สำหรับ ring animation (3 → 0)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = ((3 - count) / 3) * circumference;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="relative flex flex-col items-center gap-6 p-10 bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-sm w-full mx-4 animate-fade-in">
        {/* Glow effect behind icon */}
        <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-60" />

        {/* Shield icon with pulse */}
        <div className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 animate-pulse">
          <ShieldX className="text-red-500" size={40} strokeWidth={1.5} />
        </div>

        {/* Message */}
        <div className="text-center space-y-2 z-10">
          <h2 className="text-xl font-bold text-gray-800">
            ไม่มีสิทธิ์เข้าถึง
          </h2>
          <p className="text-sm text-gray-500">
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้
            <br />
            กำลังนำคุณกลับไปหน้าหลัก...
          </p>
        </div>

        {/* Countdown ring */}
        <div className="relative flex items-center justify-center z-10">
          <svg width="80" height="80" className="-rotate-90">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius / 1.5}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="5"
            />
            {/* Progress ring */}
            <circle
              cx="40"
              cy="40"
              r={radius / 1.5}
              fill="none"
              stroke="#ef4444"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference / 1.5}
              strokeDashoffset={(circumference / 1.5) - (progress / 1.5)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="absolute text-2xl font-bold text-red-500">
            {count}
          </span>
        </div>

        {/* Bottom bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden z-10">
          <div
            className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${((3 - count) / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingToRedirect;