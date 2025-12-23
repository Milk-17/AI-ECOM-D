import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import { readProduct, updateProduct } from "../../api/product";
import { toast } from "react-toastify";
import Uploadfile from "./Uploadfile";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Box, Save, ArrowLeft } from "lucide-react"; // เพิ่ม Icons

const initialState = {
  title: "",
  description: {},
  price: 0,
  quantity: 0,
  categoryId: "",
  images: [],
};

const FormEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = useEcomStore((state) => state.token);
  const categories = useEcomStore((state) => state.categories);
  const getCategory = useEcomStore((state) => state.getCategory);

  const [form, setForm] = useState(initialState);
  const [selectedMainId, setSelectedMainId] = useState(""); // เก็บ Main Category ID
  const [specKey, setSpecKey] = useState(""); // key สำหรับ specification
  const [specValue, setSpecValue] = useState(""); // value สำหรับ specification

  // 1. โหลดข้อมูล Categories และ Product เมื่อเข้ามาหน้านี้
  useEffect(() => {
    getCategory(token);
    fetchProduct(token, id);
  }, []);

  const fetchProduct = async (token, id) => {
    try {
      const res = await readProduct(token, id);
      console.log("Product Data:", res.data);
      
      // ใส่ข้อมูลลง Form
      setForm({
          ...res.data,
          // Mapping ให้ตรงกับ Form: categoryId ในฟอร์มเราคือ SubCategory ID
          categoryId: res.data.subCategoryId,
          // Mapping carges เป็น images เพื่อให้สามารถแสดงรูปเดิม
          images: res.data.images || []
      });

      // ตั้งค่า Main Category เพื่อให้ Dropdown แสดงถูกตัว
      setSelectedMainId(res.data.categoryId); 
      
    } catch (err) {
      console.log("Error fetch data", err);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
    }
  };

  const handleOnChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันสำหรับเพิ่ม specification
  const handleAddSpec = () => {
    if (specKey.trim() && specValue.trim()) {
      setForm({
        ...form,
        description: {
          ...form.description,
          [specKey]: specValue,
        },
      });
      setSpecKey("");
      setSpecValue("");
    }
  };

  // ฟังก์ชันสำหรับลบ specification
  const handleRemoveSpec = (key) => {
    const newDesc = { ...form.description };
    delete newDesc[key];
    setForm({ ...form, description: newDesc });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ส่งข้อมูลไปอัปเดต
      const res = await updateProduct(token, id, form);
      toast.success(`แก้ไขสินค้า "${res.data.title}" เรียบร้อย`);
      navigate("/admin/product");
    } catch (err) {
      console.log(err);
      toast.error("แก้ไขสินค้าไม่สำเร็จ");
    }
  };

  // Logic ดึง SubCategory ตาม Main ที่เลือก (หรือที่โหลดมา)
  const selectedMainCategory = categories.find(
    (cat) => cat.id === Number(selectedMainId)
  );
  const subCategories = selectedMainCategory?.subCategories || [];

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center gap-2">
                <Box className="text-yellow-500" size={28} />
                <h1 className="text-2xl font-bold text-gray-800">แก้ไขข้อมูลสินค้า</h1>
            </div>
            <Link to="/admin/product">
                <button type="button" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition">
                    <ArrowLeft size={20} /> กลับ
                </button>
            </Link>
        </div>

        {/* Title & Description */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ชื่อสินค้า</label>
            <input
              className="border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-yellow-400 outline-none transition"
              onChange={handleOnChange}
              value={form.title}
              name="title"
              placeholder="Product Title"
              required
            />
          </div>
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">ราคา (บาท)</label>
            <input
              className="border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-yellow-400 outline-none transition"
              type="number"
              onChange={handleOnChange}
              value={form.price}
              name="price"
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">จำนวน (ชิ้น)</label>
            <input
              className="border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-yellow-400 outline-none transition"
              type="number"
              onChange={handleOnChange}
              value={form.quantity}
              name="quantity"
              min="0"
              required
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">หมวดหมู่หลัก</label>
            <select
              className="border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-yellow-400 outline-none bg-white cursor-pointer"
              value={selectedMainId}
              onChange={(e) => {
                setSelectedMainId(e.target.value);
                setForm({ ...form, categoryId: "" }); // Reset Sub เมื่อเปลี่ยน Main
              }}
              required
            >
              <option value="" disabled>กรุณาเลือกหมวดหมู่หลัก</option>
              {categories.map((item, index) => (
                <option key={index} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">หมวดหมู่ย่อย</label>
            <select
              className="border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-yellow-400 outline-none bg-white cursor-pointer disabled:bg-gray-100"
              name="categoryId"
              value={form.categoryId}
              onChange={handleOnChange}
              disabled={!selectedMainId}
              required
            >
              <option value="" disabled>กรุณาเลือกหมวดหมู่ย่อย</option>
              {subCategories.map((item, index) => (
                <option key={index} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-2 border-t pt-4">
          <label className="block text-sm font-medium text-gray-700">
            รายละเอียด (Specifications)
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                className="border border-gray-300 p-2.5 rounded-md flex-1 focus:ring-2 focus:ring-yellow-400 outline-none"
                placeholder="เช่น Brand, Model, Socket..."
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
              />
              <input
                className="border border-gray-300 p-2.5 rounded-md flex-1 focus:ring-2 focus:ring-yellow-400 outline-none"
                placeholder="เช่น AMD, RYZEN 7 9800X3D..."
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                เพิ่ม
              </button>
            </div>
            
            {/* แสดงรายการ specifications ที่เพิ่มแล้ว */}
            {Object.keys(form.description).length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  Specifications ที่เพิ่มแล้ว:
                </div>
                <div className="space-y-2">
                  {Object.entries(form.description).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center bg-white p-2 rounded border border-gray-200"
                    >
                      <div className="flex gap-2 flex-1">
                        <input
                          type="text"
                          value={key}
                          disabled
                          className="flex-1 p-1 px-2 bg-gray-100 rounded text-sm text-gray-600 border border-gray-300"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => {
                            setForm({
                              ...form,
                              description: {
                                ...form.description,
                                [key]: e.target.value,
                              },
                            });
                          }}
                          className="flex-1 p-1 px-2 rounded text-sm border border-gray-300 focus:ring-2 focus:ring-yellow-400 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(key)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                      >
                        ลบ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <hr className="my-4" />

        {/* Upload File */}
        <Uploadfile form={form} setForm={setForm} />

        <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition-all duration-200 font-bold w-full md:w-auto self-end flex items-center justify-center gap-2">
          <Save size={20} /> บันทึกการแก้ไข
        </button>

      </form>
    </div>
  );
};

export default FormEditProduct;