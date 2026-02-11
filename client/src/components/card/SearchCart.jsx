import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { numberFormat } from "../../utils/number";

const SearchCart = () => {
  const getProduct = useEcomStore((state) => state.getProduct);
  const actionSearchFilters = useEcomStore((state) => state.actionSearchFilters);
  const getCategory = useEcomStore((state) => state.getCategory);
  const categories = useEcomStore((state) => state.categories);

  const [text, setText] = useState("");
  const [mainCategorySelected, setMainCategorySelected] = useState(null);
  const [subCategorySelected, setSubCategorySelected] = useState(null);
  const [price, setPrice] = useState([0, 100000]); // ตั้ง default กว้างๆ ไว้ก่อน
  const [minInput, setMinInput] = useState(0);
  const [maxInput, setMaxInput] = useState(100000);
  const [ok, setOk] = useState(false); // ตัวแปรสำหรับ trigger เมื่อหยุดเลื่อนเมาส์

  // 1. โหลด category ครั้งแรก
  useEffect(() => {
    getCategory();
  }, []);

  // -----------------------------------------------------------
  //  HERO SECTION: รวมพลัง 3 useEffect เป็น 1 เดียวตรงนี้ครับ
  // -----------------------------------------------------------
  useEffect(() => {
    const delay = setTimeout(() => {
      // 1. คำนวณ Category ID
      let categoryIds = [];

      if (subCategorySelected) {
        // ถ้าเลือก Sub ให้ส่ง Sub ID
        categoryIds = [subCategorySelected];
      } else if (mainCategorySelected) {
        // ถ้าเลือก Main ให้ส่ง Sub ID ทั้งหมดของ Main นั้น
        const selectedMain = categories.find((c) => c.id === mainCategorySelected);
        if (selectedMain?.subCategories) {
          categoryIds = selectedMain.subCategories.map((s) => s.id);
        }
      }

      // 2. มัดรวม Payload (ข้อมูลที่จะส่งหลังบ้าน)
      const payload = {
        query: text,       // ส่งคำค้นหา
        category: categoryIds, // ส่งหมวดหมู่ (ถ้ามี)
        price: price       // ส่งราคา [min, max]
      };

      // 3. ยิง API ทีเดียว (ถ้าไม่มี filter อะไรเลย อาจจะดึง getProduct หรือส่ง payload ว่างก็ได้)
      // แต่ในระบบนี้ส่งไปให้ searchFilters จัดการเลยง่ายสุด
      actionSearchFilters(payload);

    }, 300); // Debounce 300ms (รอให้ user พิมพ์หรือเลื่อนเสร็จก่อน)

    return () => clearTimeout(delay);
  }, [text, mainCategorySelected, subCategorySelected, ok]); 
  //  Dependency Array: สั่งให้ทำงานเมื่อ Text เปลี่ยน, หมวดหมู่เปลี่ยน, หรือ ok (ราคา) เปลี่ยน

  // -----------------------------------------------------------


  // Handler สำหรับ Slider (เมื่อลาก)
  const handlePrice = (value) => {
    setPrice(value);
    setMinInput(value[0]);
    setMaxInput(value[1]);
  };
  
  // Handler สำหรับ Slider (เมื่อปล่อยเมาส์) -> ค่อยยิง API
  const handlePriceAfterChange = (value) => {
      // เมื่อปล่อยเมาส์ค่อยสลับสถานะ ok เพื่อไป trigger useEffect ด้านบน
      setOk(!ok); 
  }

  // Handler สำหรับพิมพ์ Min
  const handleMinInput = (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    
    const val = parseInt(value) || 0;
    setMinInput(val);
    const newMax = Math.max(val, maxInput);
    setPrice([val, newMax]);
    setMaxInput(newMax);
  };

  // เมื่อออกจาก input (Blur) -> ค่อยยิง API
  const handleMinBlur = () => {
    setOk(!ok);
  };

  // Handler สำหรับพิมพ์ Max
  const handleMaxInput = (e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    
    const val = parseInt(value) || 0;
    setMaxInput(val);
    const newMin = Math.min(val, minInput);
    setPrice([newMin, val]);
    setMinInput(newMin);
  };

  // เมื่อออกจาก input (Blur) -> ค่อยยิง API
  const handleMaxBlur = () => {
    setOk(!ok);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ค้นหาสินค้า</h1>

      {/* Search by Text */}
      <input
        type="text"
        placeholder="ค้นหาสินค้า..."
        className="border rounded-md w-full mb-4 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <hr className="mb-4"/>

      {/* Search by Category */}
      <div className="mb-4">
        <h1 className="font-semibold mb-2">หมวดหมู่สินค้า</h1>

        {/* Main Category */}
        <select
          className="border rounded-md px-2 py-1 w-full mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={mainCategorySelected || ""}
          onChange={(e) => {
            const mainId = Number(e.target.value) || null;
            setMainCategorySelected(mainId);
            setSubCategorySelected(null); // reset sub when main changes
          }}
        >
          <option value="">-- เลือกหมวดหมู่หลัก --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Sub Category */}
        {mainCategorySelected && (
          <select
            className="border rounded-md px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={subCategorySelected || ""}
            onChange={(e) => {
              const subId = Number(e.target.value) || null;
              setSubCategorySelected(subId);
            }}
          >
            <option value="">-- เลือกหมวดหมู่ย่อย --</option>
            {categories
              .find((c) => c.id === mainCategorySelected)
              ?.subCategories?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        )}
      </div>

      <hr className="mb-4" />

      {/* Search by Price */}
      <div>
        <h1 className="font-semibold mb-2">ค้นหาในช่วงราคา</h1>
        
        {/* Input Min/Max */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="text-xs text-gray-600 block mb-1">ราคาต่ำสุด</label>
            <input
              type="text"
              inputMode="numeric"
              className="border rounded-md px-2 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={minInput}
              onChange={handleMinInput}
              onBlur={handleMinBlur}
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-600 block mb-1">ราคาสูงสุด</label>
            <input
              type="text"
              inputMode="numeric"
              className="border rounded-md px-2 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={maxInput}
              onChange={handleMaxInput}
              onBlur={handleMaxBlur}
              placeholder="100000"
            />
          </div>
        </div>

        {/* Slider */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Min : {numberFormat(price[0])}</span>
            <span>Max : {numberFormat(price[1])}</span>
          </div>
          <Slider
            range
            min={0}
            max={150000}
            value={price}
            onChange={handlePrice} // ทำงานตอนลาก (เปลี่ยนตัวเลขเฉยๆ ยังไม่ยิง API)
            onAfterChange={handlePriceAfterChange} //  ทำงานตอนปล่อยเมาส์ (ยิง API)
            trackStyle={[{ backgroundColor: '#2563eb' }]}
            handleStyle={[
                { borderColor: '#2563eb', backgroundColor: '#2563eb' },
                { borderColor: '#2563eb', backgroundColor: '#2563eb' }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchCart;