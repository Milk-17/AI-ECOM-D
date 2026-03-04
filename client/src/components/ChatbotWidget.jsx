// src/components/ChatbotWidget.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Send, X, MessageCircle, Cpu, ShoppingCart, ExternalLink, RefreshCw 
} from "lucide-react";
import useEcomStore from "../store/ecom-store";
import { toast } from "react-toastify";
import { getProductById } from "../api/product";

// --- 1. Helper Function ---
const parseMessageWithLinks = (text) => {
  if (!text) return null;
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlPattern);

  return parts.map((part, index) => {
    // Use a fresh regex for each test to avoid lastIndex issues
    if (/^https?:\/\//.test(part)) {
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

// --- 2. Component: PC Build Card ---
const PcBuildCard = ({ data }) => {
  const actionAddtoCart = useEcomStore((state) => state.actionAddtoCart);
  
  const hasMultipleOptions = data.options && data.options.length > 0;
  const hasRelatedProducts = data.related_products && data.related_products.length > 0;
  
  const [activeTab, setActiveTab] = useState(0);

  let items = [];
  let currentBuild = {};

  if (hasMultipleOptions) {
    currentBuild = data.options[activeTab];
    items = currentBuild.items || [];
  } else if (hasRelatedProducts) {
    currentBuild = { name: "สินค้าที่เกี่ยวข้อง", total_price: 0 }; 
    items = data.related_products;
  } else {
    currentBuild = data;
    items = data.items || [];
  }

  const handleSelectBuild = async () => {
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // เพิ่มสินค้าทั้งหมดลงตะกร้า
      for (const item of items) {
        try {
          // ดึง product ID จาก URL (เช่น "/product/11" -> 11)
          const productId = item.url ? parseInt(item.url.split('/').pop()) : null;
          
          if (productId) {
            // ดึงข้อมูล product แบบเต็มจาก API
            const response = await getProductById(productId);
            const productData = response.data;
            
            // สร้าง product object สำหรับเพิ่มลงตะกร้า
            const product = {
              id: productData.id,
              title: productData.title,
              description: productData.description,
              price: productData.price,
              images: productData.images || [], 
              categoryId: productData.categoryId,
              quantity: productData.quantity,
            };
            
            actionAddtoCart(product);
            successCount++;
          }
        } catch (error) {
          console.error(`Error fetching product ${item.name}:`, error);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`เพิ่มสินค้า ${successCount} รายการลงตะกร้าแล้ว`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      if (errorCount > 0) {
        toast.warning(`ไม่สามารถเพิ่มสินค้า ${errorCount} รายการได้`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
    } catch (error) {
      console.error("Error adding products to cart:", error);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มสินค้า", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="w-full max-w-sm mt-3 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 font-sans">
      
      {/* Header Message */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <p className="text-sm text-gray-800 font-medium leading-relaxed">
            {parseMessageWithLinks(data.message)}
        </p>
      </div>

      {/* Tabs Selector */}
      {hasMultipleOptions && (
        <div className="flex border-b border-gray-200 bg-white">
          {data.options.map((opt, idx) => {
            const isActive = activeTab === idx;
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
                {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></div>}
              </button>
            );
          })}
        </div>
      )}

      {/* Sub-Header */}
      <div className="px-4 py-2 bg-blue-50/30 border-b border-blue-50 flex justify-between items-center">
          <span className="text-xs font-bold text-blue-800">
             {currentBuild.name}
          </span>
          <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
             {items.length} รายการ
          </span>
      </div>

      {/* List Items */}
      <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto custom-scrollbar bg-white">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-3 p-3 hover:bg-gray-50 transition-colors group items-start">
            
            {/* Icon */}
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mt-1">
                <Cpu size={16} />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                  {item.component}
                </span>
              </div>
              
              <h4 className="text-xs font-medium text-gray-900 truncate" title={item.name}>
                {item.name}
              </h4>

              <div className="flex justify-between items-end mt-1">
                  <div className="text-sm font-bold text-blue-700">
                      {item.price ? `฿${item.price.toLocaleString()}` : "เช็คราคา"}
                  </div>
                  
                  {item.url && (
                    <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] flex items-center gap-1 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-2 py-1 rounded border border-gray-200 hover:border-blue-200 transition-all"
                    >
                        ดูสินค้า <ExternalLink size={10} />
                    </a>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {currentBuild.total_price > 0 && (
        <div className="bg-gray-900 px-4 py-3 flex justify-between items-center text-white">
          <div className="flex flex-col">
              <span className="text-[10px] font-medium opacity-70">ราคารวม</span>
              <span className="text-lg font-bold">฿{currentBuild.total_price.toLocaleString()}</span>
          </div>
          <button 
              onClick={handleSelectBuild}
              className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/50 font-medium"
          >
              <ShoppingCart size={14} /> เลือกชุดนี้
          </button>
        </div>
      )}
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
        content: "สวัสดีครับ AI จัดสเปคคอม ยินดีให้บริการครับ 🤖" 
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const sessionIdRef = useRef("");

  // --- Drag State ---
  const [btnPos, setBtnPos] = useState({ x: 24, y: 24 }); // distance from right, bottom
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const btnRef = useRef(null);

  const handlePointerDown = useCallback((e) => {
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: btnPos.x,
      posY: btnPos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [btnPos]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    const dx = dragStart.current.x - e.clientX;
    const dy = dragStart.current.y - e.clientY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
    if (!hasMoved.current) return;

    const btnSize = 56; // w-14 = 56px
    const newX = Math.max(8, Math.min(window.innerWidth - btnSize - 8, dragStart.current.posX + dx));
    const newY = Math.max(8, Math.min(window.innerHeight - btnSize - 8, dragStart.current.posY + dy));
    setBtnPos({ x: newX, y: newY });
  }, []);

  const handlePointerUp = useCallback((e) => {
    isDragging.current = false;
    if (!hasMoved.current) {
      setIsOpen((prev) => !prev);
    }
  }, []);
  const messagesEndRef = useRef(null);

  // --- Suggestion Chips ---
  const suggestions = [
    "จัดสเปคคอมเล่นเกม งบ 50,000 บาท",
    "จัดสเปคคอมทำงาน งบ 25,000 บาท",
    "แนะนำ CPU Intel",
    "แนะนำการ์ดจอ RTX 4060",
    "ราคา RAM DDR5",
  ];

  useEffect(() => {
    sessionIdRef.current = `session-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL; 

  if (!N8N_WEBHOOK_URL) {
    console.warn('ChatbotWidget: VITE_N8N_WEBHOOK_URL is not configured');
  }

  const toggleChat = () => setIsOpen((prev) => !prev);

  // --- Handle Submit (Updated with Robust Error Handling) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { from: "user", type: "text", content: userText }]);
    setIsSending(true);

    if (!N8N_WEBHOOK_URL) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", type: "text", content: "ขอโทษครับ ระบบแชทยังไม่ได้ตั้งค่า" },
      ]);
      setIsSending(false);
      return;
    }

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userText,
          sessionId: sessionIdRef.current,
        }),
      });

      // !!! แก้ไขตรงนี้: อ่าน Text ก่อน เพื่อกัน Error ถ้า Server ส่งค่าว่างมา !!!
      const textData = await res.text();

      if (!textData) {
         throw new Error("Empty response from server");
      }

      // พยายามแปลงเป็น JSON
      let data;
      try {
        data = JSON.parse(textData);
      } catch (jsonError) {
        console.error("Non-JSON received:", textData);
        // Fallback: ถ้าไม่ใช่ JSON ให้แสดงข้อความดิบๆ เลย
        data = { message: textData }; 
      }
      
      let newMsg = { from: "bot", type: "text", content: "" };
      const hasProducts = data.related_products && data.related_products.length > 0;

      if (data.type === 'pc_build' || (data.type === 'general_qna' && hasProducts)) {
          newMsg = { from: "bot", type: "pc_build", content: data };
      } else {
          newMsg = {
              from: "bot",
              type: "text",
              content: data.message || data.answer || textData || "ขอโทษครับ ผมไม่เข้าใจคำถาม"
          };
      }
      setMessages((prev) => [...prev, newMsg]);

    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", type: "text", content: "ขอโทษครับ ระบบขัดข้องชั่วคราว หรือเชื่อมต่อไม่ได้" },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-[calc(100vw-2rem)] sm:w-[400px] md:w-[450px] max-w-[95vw] h-[70vh] sm:h-[600px] max-h-[80vh] shadow-2xl rounded-2xl overflow-hidden z-[45] animate-in fade-in slide-in-from-bottom-4 border border-gray-800 flex flex-col font-sans">
          
          {/* Header */}
          <div className="bg-gray-950 px-5 py-4 border-b border-gray-800 flex items-center justify-between shadow-sm z-10">
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                AI PC Builder
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Online
              </p>
            </div>
            <button onClick={toggleChat} className="text-gray-400 hover:text-white p-1 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-900 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.map((msg, index) => {
              const isUser = msg.from === "user";
              return (
                <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[90%] ${!isUser && msg.type === 'pc_build' ? 'w-full' : ''}`}>
                    <span className={`block text-[10px] mb-1 opacity-70 ${isUser ? "text-right text-gray-400" : "text-gray-400"}`}>
                        {isUser ? "You" : "AI"}
                    </span>
                    {msg.type === 'pc_build' ? (
                        <PcBuildCard data={msg.content} />
                    ) : (
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${isUser ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"}`}>
                          {parseMessageWithLinks(msg.content)}
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isSending && (
                <div className="flex justify-start">
                    <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin text-blue-400" />
                        <span className="text-xs text-gray-300">กำลังค้นหาข้อมูล...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* --- INPUT AREA & SUGGESTIONS --- */}
          <div className="bg-gray-950 border-t border-gray-800">
            
            {/* Suggestion Chips */}
            <div className="px-3 pt-3 flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pb-1">
               {suggestions.map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(text)}
                    className="flex-shrink-0 whitespace-nowrap bg-gray-800 text-gray-300 text-[10px] px-3 py-1.5 rounded-full border border-gray-700 hover:bg-gray-700 hover:text-white transition-all active:scale-95"
                  >
                    {text}
                  </button>
               ))}
            </div>

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="p-3">
              <div className="relative flex items-center">
                  <input
                    type="text"
                    className="w-full bg-gray-800 text-sm border-0 rounded-full pl-5 pr-12 py-3 focus:ring-2 focus:ring-blue-600 text-white placeholder-gray-500 transition-all"
                    placeholder="พิมพ์งบประมาณ หรือเลือกคำถามแนะนำ..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isSending}
                  />
                  <button type="submit" disabled={isSending || !input.trim()} className="absolute right-2 p-2 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-md transform active:scale-90">
                    <Send size={16} className={isSending ? "opacity-0" : "opacity-100"} />
                  </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* Toggle Button — Draggable */}
      {!isOpen && (
          <button
            ref={btnRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="fixed w-14 h-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors z-[45] touch-none select-none"
            style={{ right: btnPos.x, bottom: btnPos.y, cursor: isDragging.current ? 'grabbing' : 'grab' }}
          >
            <MessageCircle size={28} />
          </button>
      )}
    </>
  );
};

export default ChatbotWidget;