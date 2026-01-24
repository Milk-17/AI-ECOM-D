// src/components/ChatbotWidget.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  Send, X, MessageCircle, Cpu, ShoppingCart, ExternalLink, RefreshCw 
} from "lucide-react";

// --- 1. Helper Function: แปลง URL ในข้อความให้คลิกได้ ---
const parseMessageWithLinks = (text) => {
  if (!text) return null;
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlPattern);

  return parts.map((part, index) => {
    if (urlPattern.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:text-blue-900 underline font-semibold break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// --- 2. Component: PC Build Card (รองรับ Tabs 2 สเปค) ---
const PcBuildCard = ({ data }) => {
  // ตรวจสอบว่าข้อมูลมีหลายตัวเลือกหรือไม่ (Structure ใหม่ vs เก่า)
  const hasMultipleOptions = data.options && data.options.length > 0;
  
  // State สำหรับเลือก Tab (เริ่มที่ 0 = Option 1)
  const [activeTab, setActiveTab] = useState(0);

  // ดึงข้อมูลที่จะแสดงผลปัจจุบัน (ตาม Tab ที่เลือก หรือข้อมูลชุดเดียว)
  const currentBuild = hasMultipleOptions ? data.options[activeTab] : data;
  const items = currentBuild.items || [];

  const handleSelectBuild = () => {
    alert(`คุณเลือกชุด: ${currentBuild.name || "Custom Build"} ราคา ${currentBuild.total_price}`);
    // ตรงนี้สามารถเขียน Logic เพิ่มเพื่อส่งข้อมูลเข้าตะกร้าสินค้าได้
  };

  return (
    <div className="w-full max-w-sm mt-3 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 font-sans">
      
      {/* 2.1 Header Message: ข้อความสรุปจาก AI (แสดงตลอด) */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <p className="text-sm text-gray-800 font-medium leading-relaxed">
            {parseMessageWithLinks(data.message)}
        </p>
      </div>

      {/* 2.2 Tabs Selector (แสดงเฉพาะตอนมีหลายตัวเลือก) */}
      {hasMultipleOptions && (
        <div className="flex border-b border-gray-200 bg-white">
          {data.options.map((opt, idx) => {
            const isActive = activeTab === idx;
            // ดึงชื่อย่อ เช่น "Option 1" จากชื่อเต็ม
            const tabName = opt.name.includes(":") ? opt.name.split(":")[0] : `Option ${idx + 1}`;
            
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex-1 py-3 text-xs font-bold transition-all relative
                  ${isActive 
                    ? "text-blue-600 bg-blue-50/50" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
              >
                {tabName}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 2.3 Sub-Header: ชื่อเต็มของ Option นั้นๆ (เช่น Max Performance) */}
      {hasMultipleOptions && (
         <div className="px-4 py-2 bg-blue-50/30 border-b border-blue-50 flex justify-between items-center">
             <span className="text-xs font-bold text-blue-800">
                {currentBuild.name}
             </span>
             <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                {items.length} ชิ้น
             </span>
         </div>
      )}

      {/* 2.4 List Items (รายการสินค้า) */}
      <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto custom-scrollbar bg-white">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-3 p-3 hover:bg-gray-50 transition-colors group">
            {/* รูปภาพสินค้า */}
            <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 group-hover:border-blue-200 transition-colors">
              {item.image ? (
                <img src={item.image} alt={item.component} className="w-full h-full object-cover" />
              ) : (
                <Cpu size={20} className="text-gray-400" />
              )}
            </div>

            {/* รายละเอียดสินค้า */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  {item.component}
                </span>
              </div>
              <h4 className="text-xs font-medium text-gray-900 truncate mt-1 group-hover:text-blue-700 transition-colors" title={item.name}>
                {item.name}
              </h4>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-bold text-gray-900">
                  ฿{item.price.toLocaleString()}
                </span>
                {item.url && (
                    <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                        ดูสินค้า <ExternalLink size={10} />
                    </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2.5 Footer: ราคารวม และ ปุ่มสั่งซื้อ */}
      <div className="bg-gray-900 px-4 py-3 flex justify-between items-center text-white">
        <div className="flex flex-col">
            <span className="text-[10px] font-medium opacity-70">ราคารวม (ชุดนี้)</span>
            <span className="text-lg font-bold">฿{currentBuild.total_price?.toLocaleString() || 0}</span>
        </div>
        <button 
            onClick={handleSelectBuild}
            className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/50 font-medium"
        >
           <ShoppingCart size={14} /> เลือกสเปคนี้
        </button>
      </div>
    </div>
  );
};

// --- 3. Main Widget ---
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { 
        from: "bot", 
        type: "text", 
        content: "สวัสดีครับ ผมคือ AI ช่วยจัดสเปคคอม 🤖\nลองพิมพ์บอกงบประมาณ หรือสเปคที่อยากได้ เช่น 'งบ 30,000 เล่นเกม' ได้เลยครับ!" 
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const sessionIdRef = useRef("");
  const messagesEndRef = useRef(null);

  // สร้าง Session ID ใหม่ทุกครั้งที่โหลดหน้าเว็บ
  useEffect(() => {
    const newSessionId = `session-${Math.random().toString(36).substring(2, 9)}`;
    sessionIdRef.current = newSessionId;
  }, []);

  // เลื่อน Chat ลงล่างสุดเสมอเมื่อมีข้อความใหม่
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // *** อย่าลืมตั้งค่า VITE_N8N_WEBHOOK_URL ในไฟล์ .env ของคุณ ***
  const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL; 

  const toggleChat = () => setIsOpen((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput("");

    // 1. ใส่ข้อความ user ลงในแชททันที
    setMessages((prev) => [...prev, { from: "user", type: "text", content: userText }]);
    setIsSending(true);

    try {
      // 2. ยิง Request ไปหา n8n
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userText,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();
      
      let newMsg = { from: "bot", type: "text", content: "" };

      // 3. ตรวจสอบประเภทข้อมูลที่ตอบกลับมา
      if (data.type === 'pc_build') {
         // ถ้าเป็นจัดสเปค ส่ง data ก้อนใหญ่ไปให้ Card Render
         newMsg = { from: "bot", type: "pc_build", content: data };
      } else {
         // ถ้าเป็นข้อความปกติ
         newMsg = {
             from: "bot",
             type: "text",
             content: data.message || data.answer || "ขอโทษครับ ผมไม่เข้าใจคำถาม"
         };
      }
      setMessages((prev) => [...prev, newMsg]);

    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", type: "text", content: "ขอโทษครับ เกิดข้อผิดพลาดในการเชื่อมต่อ (Connection Error)" },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-[400px] md:w-[450px] max-w-[95vw] h-[600px] max-h-[80vh] shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 border border-gray-800 flex flex-col font-sans">
          
          {/* --- HEADER --- */}
          <div className="bg-gray-950 px-5 py-4 border-b border-gray-800 flex items-center justify-between shadow-sm z-10">
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                AI PC Builder <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded-full">Beta</span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Online
              </p>
            </div>
            <button onClick={toggleChat} className="text-gray-400 hover:text-white p-1 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* --- CHAT AREA --- */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-900 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.map((msg, index) => {
              const isUser = msg.from === "user";
              return (
                <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[90%] ${!isUser && msg.type === 'pc_build' ? 'w-full' : ''}`}>
                    
                    {/* ชื่อผู้พูด */}
                    <span className={`block text-[10px] mb-1 opacity-70 ${isUser ? "text-right text-gray-400" : "text-gray-400"}`}>
                        {isUser ? "You" : "AI Assistant"}
                    </span>

                    {/* กล่องข้อความ */}
                    {msg.type === 'pc_build' ? (
                        <PcBuildCard data={msg.content} />
                    ) : (
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words
                            ${isUser 
                                ? "bg-blue-600 text-white rounded-br-none" 
                                : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                            }`}
                        >
                          {parseMessageWithLinks(msg.content)}
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Loading Indicator */}
            {isSending && (
                <div className="flex justify-start">
                    <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin text-blue-400" />
                        <span className="text-xs text-gray-300">กำลังค้นหาอุปกรณ์...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* --- INPUT AREA --- */}
          <form onSubmit={handleSubmit} className="p-3 bg-gray-950 border-t border-gray-800">
            <div className="relative flex items-center">
                <input
                  type="text"
                  className="w-full bg-gray-800 text-sm border-0 rounded-full pl-5 pr-12 py-3 focus:ring-2 focus:ring-blue-600 text-white placeholder-gray-500 transition-all"
                  placeholder="พิมพ์งบประมาณ เช่น 30000..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="absolute right-2 p-2 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-md transform active:scale-90"
                >
                  <Send size={16} className={isSending ? "opacity-0" : "opacity-100"} />
                  {isSending && <div className="absolute inset-0 flex items-center justify-center"><RefreshCw size={14} className="animate-spin" /></div>}
                </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TOGGLE BUTTON (Floating) --- */}
      {!isOpen && (
          <button
            onClick={toggleChat}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center active:scale-90 transition-all z-40 animate-bounce-slow"
          >
            <MessageCircle size={28} />
          </button>
      )}
    </>
  );
};

export default ChatbotWidget;