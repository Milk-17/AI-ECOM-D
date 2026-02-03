// rafce
import React, { useEffect } from "react" // <--- 1. เพิ่ม useEffect
import AppRoutes from "./routes/AppRoutes"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// <--- 2. เพิ่ม Import ส่วนที่ต้องใช้เช็ค Token
import useEcomStore from "./store/ecom-store";
import { jwtDecode } from "jwt-decode";

const App = () => {
  //Javascript
  
  // <--- 3. ดึง Token และฟังก์ชัน Logout มาจาก Store
  const token = useEcomStore((state) => state.token);
  const clearStore = useEcomStore((state) => state.logout);

  // <--- 4. Idle Timeout: ถ้าไม่ทำ activity เกิน 30 นาที จะ logout
  useEffect(() => {
    if (!token) return; // ถ้าไม่มี token ไม่ต้องเช็ก

    let idleTimer;
    const IDLE_TIME = 30 * 60 * 1000; // 30 นาที (milliseconds)

    // ฟังก์ชัน: ตั้งค่า timer ใหม่
    const resetIdleTimer = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      
      // ตั้ง timer ใหม่ - ถ้าไม่มี activity 30 นาที → logout
      idleTimer = setTimeout(() => {
        clearStore();
        console.log("Idle timeout: User logged out due to inactivity");
      }, IDLE_TIME);
    };

    // ตั้งค่า timer เมื่อ component mount
    resetIdleTimer();

    // ฟังก์ชัน: สำหรับ events ที่บ่งชี้ user กำลัง active
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetIdleTimer);
    });

    // Clean up: ลบ event listeners และ clear timer
    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [token, clearStore]);


  return (
    <>
    <ToastContainer />
      <AppRoutes/>
    </>

  )
}

export default App