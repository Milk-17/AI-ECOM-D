// rafce
import React, { useEffect } from "react" 
import AppRoutes from "./routes/AppRoutes"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useEcomStore from "./store/ecom-store";
import { jwtDecode } from "jwt-decode";

const App = () => {
  //Javascript
  
  const token = useEcomStore((state) => state.token);
  const clearStore = useEcomStore((state) => state.logout);

  // Token Expiration Check
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // ถ้า token หมดอายุแล้ว logout ทันที
      if (decoded.exp < currentTime) {
        console.log('Token expired, logging out...');
        clearStore();
        window.location.href = "/";
        return;
      }

      // ตั้ง timeout ให้ logout เมื่อ token ใกล้หมดอายุ
      const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
      const expiryTimer = setTimeout(() => {
        console.log('Token expired, logging out...');
        clearStore();
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        window.location.href = "/";
      }, timeUntilExpiry);

      return () => clearTimeout(expiryTimer);
    } catch (error) {
      console.error('Token decode error:', error);
      clearStore();
    }
  }, [token, clearStore]);

  // Idle Timeout: ปรับเป็น 30 นาที (สอดคล้องกับ token 1 วัน)
  useEffect(() => {
    if (!token) return; // ถ้าไม่มี token ไม่ต้องเช็ก

    let idleTimer;
    
    const IDLE_TIME = 30 * 60 * 1000; // 30 นาที (milliseconds)

    const resetIdleTimer = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      
      // ตั้ง timer ใหม่ - ถ้าไม่มี activity 30 นาที -> logout
      idleTimer = setTimeout(() => {
        clearStore();
        alert("ไม่มีการใช้งาน ระบบออกจากระบบอัตโนมัติ (30 นาที)"); 
        console.log("Idle timeout: User logged out due to inactivity (30 minutes)");
        window.location.href = "/"; // ดีดไปหน้า Login ทันที
      }, IDLE_TIME);
    };

    // เริ่มทำงานครั้งแรก
    resetIdleTimer();

    // Event ที่จะถือว่า User ยัง active อยู่
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetIdleTimer);
    });

    // Clean up
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