// src/components/ChatbotWidget.jsx
import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle, HeadphonesIcon } from "lucide-react";

// Function เพื่อแปลง URL ในข้อความเป็น clickable links
const parseMessageWithLinks = (text) => {
  const urlPattern = /(https?:\/\/[^\s]+|\/product\/\d+)/g;
  const parts = text.split(urlPattern);
  
  return parts.map((part, index) => {
    if (urlPattern.test(part)) {
      // ถ้าเป็น URL ให้สร้าง link
      if (part.startsWith("/product/")) {
        // URL แบบ /product/id - ใช้ onClick navigate
        return (
          <a
            key={index}
            href={part}
            className="text-blue-700 hover:text-blue-900 underline font-semibold cursor-pointer hover:bg-blue-50 px-1 rounded"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = part;
            }}
          >
            {part}
          </a>
        );
      } else if (part.startsWith("http")) {
        // URL แบบ http/https - เปิด tab ใหม่
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-900 underline font-semibold hover:bg-blue-50 px-1 rounded"
          >
            {part}
          </a>
        );
      }
    }
    return <span key={index}>{part}</span>;
  });
};

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "สวัสดีครับ มีอะไรให้ช่วยไหมครับ? สอบถามเรื่องสเปคคอมได้เลย" },
  ]);
  const [isSending, setIsSending] = useState(false);

  // ใช้เก็บ Session ID
  const sessionIdRef = useRef("");

  // ใช้สำหรับเลื่อน scroll ไปด้านล่างสุด
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSessionId = `session-${Math.random().toString(36).substring(2, 9)}`;
    sessionIdRef.current = newSessionId;
    console.log("Chat Session ID:", newSessionId);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setIsSending(true);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userText,
          sessionId: sessionIdRef.current,
        }),
      });

      //if (!res.ok) {
      //  throw new Error("Network response was not ok");
     // }
     if (!res.ok) {
      console.error("Server Error:", res.status, res.statusText); // ดูตรงนี้ใน Console
      const text = await res.text(); // ดูข้อความที่ Server ด่ากลับมา
      console.error("Server Response:", text);
      throw new Error(`Network response was not ok: ${res.status}`);
      }

      const data = await res.json();

      const botText =
        data.answer ||
        data.output ||
        data.text ||
        "ขอโทษครับ ระบบไม่ได้รับคำตอบจาก AI";

      setMessages((prev) => [...prev, { from: "bot", text: botText }]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="
            fixed bottom-24 right-4 
            w-[420px] max-w-[95vw]
            max-h-[70vh]
            bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-3xl 
            border border-gray-200 
            flex flex-col overflow-hidden z-40
            animate-in fade-in slide-in-from-bottom-4 duration-300
          "
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
            <div>
              <div className="font-bold text-base flex items-center gap-2">
                <MessageCircle size={20} />
                AI Chatbot ช่วยจัดสเปคคอม
              </div>
              <div className="text-xs text-blue-100 mt-1">
                {isSending ? "⏳ กำลังพิมพ์..." : "🟢 ออนไลน์"}
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white/80 hover:text-white transition-colors hover:bg-white/20 p-1 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* รายการข้อความ */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto text-sm">
            {messages.map((msg, index) => {
              const isUser = msg.from === "user";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in`}
                >
                  <div className="max-w-[85%]">
                    <div
                      className={`text-[11px] font-semibold mb-1 ${
                        isUser ? "text-right text-blue-600" : "text-left text-gray-500"
                      }`}
                    >
                      {isUser ? "คุณ 👤" : "🤖 AI"}
                    </div>
                    <div
                      className={`
                        px-4 py-3 rounded-2xl 
                        whitespace-pre-line break-words
                        ${
                          isUser
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-md"
                            : "bg-white text-gray-800 rounded-bl-none shadow border border-gray-200"
                        }
                      `}
                    >
                      {isUser ? msg.text : parseMessageWithLinks(msg.text)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ตัว marker ด้านล่างสุดเอาไว้ให้ scrollIntoView หา */}
            <div ref={messagesEndRef} />
          </div>

          {/* ช่องพิมพ์ */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 p-4 flex gap-2 bg-white"
          >
            <input
              type="text"
              className="
                flex-1 text-sm border border-gray-300 
                rounded-full px-4 py-2.5
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-gray-400 bg-gray-50
              "
              placeholder="พิมพ์คำถาม เช่น จัดสเปคคอมเล่นเกมงบ 30000"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
            />
            <button
              type="submit"
              className="
                text-sm px-4 py-2.5 rounded-full 
                bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold
                hover:from-blue-600 hover:to-blue-700 active:scale-95 
                transition disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-1 shadow-md
              "
              disabled={isSending}
            >
              <Send size={16} />
              {isSending ? "..." : "ส่ง"}
            </button>
          </form>
        </div>
      )}

      {/* ปุ่มลอยมุมขวาล่าง */}
      <button
        onClick={toggleChat}
        className="
          fixed bottom-6 right-6 
          w-16 h-16 rounded-full shadow-xl 
          bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
          text-white flex items-center justify-center
          active:scale-95 transition z-40
          border-2 border-white
        "
        aria-label="เปิด chat กับ chatbot"
        title="แชทกับ AI Chatbot"
      >
        <HeadphonesIcon size={28} strokeWidth={1.5} />
      </button>
    </>
  );
};

export default ChatbotWidget;
