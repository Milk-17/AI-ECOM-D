import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import { createProduct, deleteProduct } from "../../api/product";
import { toast } from "react-toastify";
import Uploadfile from "./Uploadfile";
import { Link } from "react-router-dom";
import {
  Pencil,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Filter,
  XCircle,
  AlertCircle,
  CheckCircle2,
  ImageIcon
} from "lucide-react"; 
import { numberFormat } from "../../utils/number";

const initialState = {
  title: "",
  description: {}, 
  price: 0,
  quantity: 0,
  categoryId: "",
  images: [],
};

const FormProduct = () => {
  const token = useEcomStore((state) => state.token);
  const categories = useEcomStore((state) => state.categories);
  const getProduct = useEcomStore((state) => state.getProduct);
  const products = useEcomStore((state) => state.products);
  const getCategory = useEcomStore((state) => state.getCategory);
  const actionDeleteProduct = useEcomStore((state) => state.actionDeleteProduct);

  const [form, setForm] = useState(initialState);
  
  // State สำหรับ Form (ตอนเพิ่มสินค้า)
  const [formMainCatId, setFormMainCatId] = useState("");
  const [specKey, setSpecKey] = useState(""); 
  const [specValue, setSpecValue] = useState(""); 

  // --- Filter State (แก้ไขใหม่ แยก Main/Sub) ---
  const [search, setSearch] = useState("");
  const [filterMainCatId, setFilterMainCatId] = useState("");
  const [filterSubCatId, setFilterSubCatId] = useState("");

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 

  useEffect(() => {
    getCategory(token);
    getProduct(1000); // Load เยอะหน่อยเผื่อ Filter
  }, [getCategory, getProduct, token]);

  // --- Handle Form Input ---
  const handleOnChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) {
      toast.warning("กรุณาเลือกหมวดหมู่ย่อย (Please select SubCategory)");
      return;
    }
    if (form.price < 0 || form.quantity < 0) {
      toast.warning("ราคาและจำนวนต้องไม่ติดลบ (Price/Qty must be positive)");
      return;
    }

    try {
      const res = await createProduct(token, form);
      const productTitle = res.data?.product?.title || form.title;
      toast.success(`เพิ่มสินค้า ${productTitle} เรียบร้อย (Success)`);
      
      // Reset form
      setForm({ ...initialState });
      setSpecKey("");
      setSpecValue("");
      setFormMainCatId("");
      getProduct(1000);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong";
      toast.error(errMsg);
    }
  };

  // --- Spec Functions ---
  const handleAddSpec = () => {
    if (specKey.trim() && specValue.trim()) {
      setForm({
        ...form,
        description: { ...form.description, [specKey]: specValue },
      });
      setSpecKey("");
      setSpecValue("");
    }
  };

  const handleRemoveSpec = (key) => {
    const newDesc = { ...form.description };
    delete newDesc[key];
    setForm({ ...form, description: newDesc });
  };

  const handleDelete = async (id) => {
    if (window.confirm("ยืนยันการลบสินค้า? (Confirm Delete?)")) {
      try {
        await deleteProduct(token, id);
        toast.success("ลบสินค้าเรียบร้อย (Deleted)");
        actionDeleteProduct(id);
      } catch (err) {
        console.log(err);
        toast.error("ลบไม่สำเร็จ (Delete Failed)");
      }
    }
  };

  // --- Logic การกรองข้อมูล (New Filter System) ---
  const filteredProducts = products.filter((item) => {
    // 1. Search Text
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    
    // 2. Category Logic
    let matchesCategory = true;

    if (filterSubCatId) {
        // ถ้าเลือก Sub Category -> ต้องตรงเป๊ะๆ
        matchesCategory = item.categoryId === Number(filterSubCatId);
    } else if (filterMainCatId) {
        // ถ้าเลือกแค่ Main Category -> ต้องหาว่าสินค้าอยู่ใน Sub ไหนของ Main นี้บ้าง
        const mainCat = categories.find(c => c.id === Number(filterMainCatId));
        if (mainCat && mainCat.subCategories) {
            const subCatIds = mainCat.subCategories.map(s => s.id);
            matchesCategory = subCatIds.includes(item.categoryId);
        } else {
            matchesCategory = false;
        }
    }

    return matchesSearch && matchesCategory;
  });

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterMainCatId, filterSubCatId]);

  // --- Helpers ---
  // สำหรับ Form (Create)
  const formMainCategory = categories.find(cat => cat.id === Number(formMainCatId));
  const formSubCategories = formMainCategory?.subCategories || [];

  // สำหรับ Filter (Search)
  const filterMainCategory = categories.find(cat => cat.id === Number(filterMainCatId));
  const filterSubCategories = filterMainCategory?.subCategories || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* ----------------- SECTION 1: FORM เพิ่มสินค้า ----------------- */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 mb-8">
        <div className="bg-blue-600 p-4 flex items-center gap-3 text-white">
            <Package size={24} />
            <h1 className="text-xl font-bold">เพิ่มสินค้าใหม่ (Add New Product)</h1>
        </div>

        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า (Product Name)</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        onChange={handleOnChange}
                        value={form.title}
                        name="title"
                        placeholder="Ex. Gaming Mouse Logitech G Pro..."
                        required
                    />
                </div>

                {/* Price & Qty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (Price)</label>
                        <input
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            type="number"
                            onChange={handleOnChange}
                            value={form.price}
                            name="price"
                            min="0"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนคงเหลือ (Quantity)</label>
                        <input
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            type="number"
                            onChange={handleOnChange}
                            value={form.quantity}
                            name="quantity"
                            min="0"
                            required
                        />
                    </div>
                </div>

                {/* Categories (Create Form) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่หลัก (Main Category)</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none"
                            value={formMainCatId}
                            onChange={(e) => {
                                setFormMainCatId(e.target.value);
                                setForm({ ...form, categoryId: "" }); // Reset sub when main changes
                            }}
                            required
                        >
                            <option value="">-- เลือกหมวดหมู่หลัก --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ย่อย (Sub Category)</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none disabled:bg-gray-200 disabled:cursor-not-allowed"
                            value={form.categoryId}
                            name="categoryId"
                            onChange={handleOnChange}
                            disabled={!formMainCatId}
                            required
                        >
                            <option value="">-- เลือกหมวดหมู่ย่อย --</option>
                            {formSubCategories.map((sub) => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Specifications */}
                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">คุณสมบัติเพิ่มเติม (Specifications)</label>
                    <div className="flex gap-2 mb-3">
                        <input
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                            placeholder="หัวข้อ (Ex. CPU)"
                            value={specKey}
                            onChange={(e) => setSpecKey(e.target.value)}
                        />
                        <input
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                            placeholder="รายละเอียด (Ex. Intel i9)"
                            value={specValue}
                            onChange={(e) => setSpecValue(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleAddSpec}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                            <Plus size={18}/>
                        </button>
                    </div>
                    
                    {/* Spec Tags */}
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(form.description).map(([key, value]) => (
                            <span key={key} className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-1 rounded text-xs font-medium text-gray-700">
                                {key}: {value}
                                <XCircle 
                                    size={14} 
                                    className="cursor-pointer text-gray-400 hover:text-red-500" 
                                    onClick={() => handleRemoveSpec(key)}
                                />
                            </span>
                        ))}
                    </div>
                </div>

                {/* Upload Image */}
                <div className="border-t pt-4">
                     <Uploadfile form={form} setForm={setForm} />
                </div>

                <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-emerald-700 transition flex justify-center items-center gap-2">
                    <CheckCircle2 size={20} /> บันทึกสินค้า (Save Product)
                </button>
            </form>
        </div>
      </div>

      {/* ----------------- SECTION 2: SEARCH & FILTER (แก้ไขใหม่) ----------------- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Search */}
            <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text"
                    placeholder="ค้นหาชื่อสินค้า..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Category Filters */}
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-2/3 justify-end">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={18} className="text-gray-500" />
                    <select 
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-full md:w-48 cursor-pointer"
                        value={filterMainCatId}
                        onChange={(e) => {
                            setFilterMainCatId(e.target.value);
                            setFilterSubCatId(""); // Reset sub when main filter changes
                        }}
                    >
                        <option value="">ทั้งหมด (All Main)</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-full md:w-48 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                    value={filterSubCatId}
                    onChange={(e) => setFilterSubCatId(e.target.value)}
                    disabled={!filterMainCatId} // ปิดถ้ายังไม่เลือก Main
                >
                    <option value="">ทั้งหมด (All Sub)</option>
                    {filterSubCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                {/* Reset Button */}
                {(search || filterMainCatId) && (
                    <button 
                        onClick={() => {
                            setSearch("");
                            setFilterMainCatId("");
                            setFilterSubCatId("");
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-bold"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* ----------------- SECTION 3: TABLE ----------------- */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
                    <tr>
                        <th className="p-4 text-center w-16">No.</th>
                        <th className="p-4 text-center w-24">Image</th>
                        <th className="p-4">สินค้า (Product Details)</th>
                        <th className="p-4 text-center">ราคา (Price)</th>
                        <th className="p-4 text-center">คลัง (Stock)</th>
                        <th className="p-4 text-center">ขายแล้ว (Sold)</th>
                        <th className="p-4 text-right">อัพเดท (Updated)</th>
                        <th className="p-4 text-center">จัดการ (Actions)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {currentProducts.length > 0 ? currentProducts.map((item, index) => {
                         const realIndex = indexOfFirstItem + index + 1;
                         const isOutOfStock = item.quantity === 0;
                         const isLowStock = item.quantity > 0 && item.quantity < 10;

                         return (
                            <tr key={item.id} className="hover:bg-gray-50 transition duration-150 group">
                                <td className="p-4 text-center text-gray-400 text-xs">{realIndex}</td>
                                
                                {/* Image */}
                                <td className="p-4 text-center">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden mx-auto">
                                        {item.images && item.images.length > 0 ? (
                                            <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={20} className="text-gray-400" />
                                        )}
                                    </div>
                                </td>

                                {/* Product Name */}
                                <td className="p-4">
                                    <p className="font-bold text-gray-800 line-clamp-1" title={item.title}>{item.title}</p>
                                    <p className="text-xs text-gray-400">ID: {item.id}</p>
                                </td>

                                {/* Price */}
                                <td className="p-4 text-center font-mono font-medium text-blue-600">
                                    {numberFormat(item.price)}
                                </td>

                                {/* Stock Status */}
                                <td className="p-4 text-center">
                                    {isOutOfStock ? (
                                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-bold border border-red-100">
                                            <AlertCircle size={12}/> หมด (Out)
                                        </span>
                                    ) : isLowStock ? (
                                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-full text-xs font-bold border border-orange-100">
                                            ต่ำ ({item.quantity})
                                        </span>
                                    ) : (
                                        <span className="text-gray-600 text-sm">{item.quantity}</span>
                                    )}
                                </td>

                                {/* Sold */}
                                <td className="p-4 text-center text-sm text-gray-600">{item.sold}</td>

                                {/* Date */}
                                <td className="p-4 text-right text-xs text-gray-500">
                                    {formatDate(item.updatedAt)}
                                </td>

                                {/* Actions */}
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <Link 
                                            to={`/admin/product/${item.id}`}
                                            className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition shadow-sm"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition shadow-sm"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                         )
                    }) : (
                        <tr>
                            <td colSpan="8" className="p-10 text-center text-gray-400">
                                <Package size={48} className="mx-auto mb-2 opacity-20"/>
                                <p>ไม่พบสินค้า (No Products Found)</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-4 bg-gray-50">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronLeft size={16}/>
                </button>
                <span className="text-sm font-medium text-gray-600">
                    หน้า {currentPage} / {totalPages}
                </span>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronRight size={16}/>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default FormProduct;