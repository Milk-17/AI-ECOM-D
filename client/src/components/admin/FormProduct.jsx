import { useEffect, useState } from "react";
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
  Filter,
  XCircle,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Plus // เพิ่ม Plus กลับเข้ามา
} from "lucide-react"; 
import { numberFormat } from "../../utils/number";

// 1. ลบ productUrl ออกจาก initialState
const initialState = {
  title: "",
  description: {}, 
  price: 0,
  quantity: 0,
  categoryId: "",
  images: [],
  // productUrl: "",  <-- ลบทิ้ง
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

  // --- Filter State ---
  const [search, setSearch] = useState("");
  const [filterMainCatId, setFilterMainCatId] = useState("");
  const [filterSubCatId, setFilterSubCatId] = useState("");

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 

  useEffect(() => {
    getCategory(token);
    getProduct(1000); 
  }, [getCategory, getProduct, token]);

  // ตรวจ sessionStorage สำหรับ toast หลังรีหน้า
  useEffect(() => {
    const pendingToast = sessionStorage.getItem("product_toast");
    if (pendingToast) {
      sessionStorage.removeItem("product_toast");
      toast.success(pendingToast);
    }
  }, []);

  // --- Handle Form Input ---
  const handleOnChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) {
      toast.warning("กรุณาเลือกหมวดหมู่ย่อย");
      return;
    }
    if (form.price < 0 || form.quantity < 0) {
      toast.warning("ราคาและจำนวนต้องไม่ติดลบ");
      return;
    }

    try {
      // ส่ง form ไป Backend (ไม่ต้องมี productUrl แล้ว)
      const res = await createProduct(token, form);
      const productTitle = res.data?.product?.title || form.title;
      
      // เก็บ toast ไว้ใน sessionStorage แล้วรีหน้า
      sessionStorage.setItem("product_toast", `เพิ่มสินค้า "${productTitle}" เรียบร้อยแล้ว`);
      window.location.reload();
    } catch (err) {
      const errMsg = err.response?.data?.message || "เกิดข้อผิดพลาด";
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
    if (window.confirm("ยืนยันการลบสินค้า?")) {
      try {
        await deleteProduct(token, id);
        toast.success("ลบสินค้าเรียบร้อยแล้ว");
        actionDeleteProduct(id);
      } catch (err) {
        console.log(err);
        toast.error("ลบสินค้าไม่สำเร็จ");
      }
    }
  };

  // --- Logic การกรองข้อมูล ---
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    let matchesCategory = true;

    if (filterSubCatId) {
        matchesCategory = item.subCategoryId === Number(filterSubCatId);
    } else if (filterMainCatId) {
        matchesCategory = item.categoryId === Number(filterMainCatId);
    }

    return matchesSearch && matchesCategory;
  });

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterMainCatId, filterSubCatId]);

  // --- Helpers ---
  const formMainCategory = categories.find(cat => cat.id === Number(formMainCatId));
  const formSubCategories = formMainCategory?.subCategories || [];

  const filterMainCategory = categories.find(cat => cat.id === Number(filterMainCatId));
  const filterSubCategories = filterMainCategory?.subCategories || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  return (
    <div className="w-full px-2 sm:px-4 py-4 sm:py-8">
      
      {/* ----------------- SECTION 1: FORM เพิ่มสินค้า ----------------- */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 mb-6 sm:mb-8">
        <div className="bg-blue-600 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-white">
            <Package size={20} className="sm:w-6 sm:h-6" />
            <h1 className="text-base sm:text-xl font-bold">เพิ่มสินค้าใหม่ (Add New Product)</h1>
        </div>

        <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">                
                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า (Product Name)</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm sm:text-base"
                        onChange={handleOnChange}
                        value={form.title}
                        name="title"
                        placeholder="Ex. Gaming Mouse Logitech G Pro..."
                        required
                    />
                </div>

                {/* 2. ลบช่อง Product URL ออกไปแล้ว เพราะใช้ Auto Slug */}

                {/* Price & Qty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (Price)</label>
                        <input
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm sm:text-base"
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
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm sm:text-base"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่หลัก (Main Category)</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 bg-white focus:outline-none text-sm sm:text-base"
                            value={formMainCatId}
                            onChange={(e) => {
                                setFormMainCatId(e.target.value);
                                setForm({ ...form, categoryId: "" }); 
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
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 bg-white focus:outline-none disabled:bg-gray-200 disabled:cursor-not-allowed text-sm sm:text-base"
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
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
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
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap"
                        >
                            <Plus size={18} className="inline sm:hidden"/>
                            <span className="hidden sm:inline">เพิ่ม</span>
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(form.description).map(([key, value]) => (
                            <span key={key} className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 px-2 py-1 rounded text-xs font-medium text-gray-700">
                                <span className="max-w-[150px] truncate">{key}: {value}</span>
                                <XCircle 
                                    size={14} 
                                    className="cursor-pointer text-gray-400 hover:text-red-500 flex-shrink-0" 
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

                <button className="w-full bg-emerald-600 text-white py-2.5 sm:py-3 rounded-lg font-bold shadow-md hover:bg-emerald-700 transition flex justify-center items-center gap-2 text-sm sm:text-base">
                    <CheckCircle2 size={18} className="sm:w-5 sm:h-5" /> บันทึกสินค้า (Save Product)
                </button>
            </form>
        </div>
      </div>

      {/* ----------------- SECTION 2: SEARCH & FILTER ----------------- */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="ค้นหาชื่อสินค้า..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <Filter size={16} className="text-gray-500 hidden sm:block" />
                    <select 
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-full cursor-pointer"
                        value={filterMainCatId}
                        onChange={(e) => {
                            setFilterMainCatId(e.target.value);
                            setFilterSubCatId(""); 
                        }}
                    >
                        <option value="">ทั้งหมด (All Main)</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                
                <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none flex-1 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                    value={filterSubCatId}
                    onChange={(e) => setFilterSubCatId(e.target.value)}
                    disabled={!filterMainCatId}
                >
                    <option value="">ทั้งหมด (All Sub)</option>
                    {filterSubCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                
                {(search || filterMainCatId) && (
                    <button 
                        onClick={() => {
                            setSearch("");
                            setFilterMainCatId("");
                            setFilterSubCatId("");
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-bold whitespace-nowrap"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* ----------------- SECTION 3: TABLE ----------------- */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
        {/* Mobile: แสดง info ว่ามีกี่รายการ */}
        <div className="p-3 bg-gray-50 border-b sm:hidden">
          <p className="text-xs text-gray-600">
            แสดง {currentProducts.length} จาก {filteredProducts.length} รายการ
          </p>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold tracking-wider">
                    <tr>
                        <th className="p-2 sm:p-4 text-center w-12 sm:w-16">No.</th>
                        <th className="p-2 sm:p-4 text-center w-16 sm:w-24">Image</th>
                        <th className="p-2 sm:p-4">สินค้า (Product)</th>
                        <th className="p-2 sm:p-4 text-center">ราคา</th>
                        <th className="p-2 sm:p-4 text-center">คลัง</th>
                        <th className="p-2 sm:p-4 text-center hidden md:table-cell">ขายแล้ว</th>
                        <th className="p-2 sm:p-4 text-right hidden lg:table-cell">อัพเดท</th>
                        <th className="p-2 sm:p-4 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {currentProducts.length > 0 ? currentProducts.map((item, index) => {
                         const realIndex = indexOfFirstItem + index + 1;
                         const isOutOfStock = item.quantity === 0;
                         const isLowStock = item.quantity > 0 && item.quantity < 10;
                         
                         const productSlug = item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0E00-\u0E7F-]+/g, '');
                         const viewLink = `/product/${item.id}-${productSlug}`;

                         return (
                            <tr key={item.id} className="hover:bg-gray-50 transition duration-150 group">
                                <td className="p-2 sm:p-4 text-center text-gray-400 text-xs">{realIndex}</td>
                                
                                <td className="p-2 sm:p-4 text-center">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden mx-auto">
                                        {item.images && item.images.length > 0 && item.images[0] ? (
                                            <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon size={16} className="sm:w-5 sm:h-5 text-gray-400" />
                                        )}
                                    </div>
                                </td>

                                <td className="p-2 sm:p-4">
                                    <Link to={viewLink} target="_blank" className="font-bold text-gray-800 line-clamp-2 sm:line-clamp-1 hover:text-blue-600 text-xs sm:text-sm" title="คลิกเพื่อดูหน้าสินค้าจริง">
                                        {item.title}
                                    </Link>
                                    <p className="text-xs text-gray-400 mt-0.5">ID: {item.id}</p>
                                </td>

                                <td className="p-2 sm:p-4 text-center font-mono font-medium text-blue-600 text-xs sm:text-sm">
                                    {numberFormat(item.price)}
                                </td>

                                <td className="p-2 sm:p-4 text-center">
                                    {isOutOfStock ? (
                                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold border border-red-100">
                                            <AlertCircle size={10} className="sm:w-3 sm:h-3"/> หมด
                                        </span>
                                    ) : isLowStock ? (
                                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold border border-orange-100">
                                            ต่ำ ({item.quantity})
                                        </span>
                                    ) : (
                                        <span className="text-gray-600 text-xs sm:text-sm">{item.quantity}</span>
                                    )}
                                </td>

                                <td className="p-2 sm:p-4 text-center text-xs sm:text-sm text-gray-600 hidden md:table-cell">{item.sold}</td>
                                <td className="p-2 sm:p-4 text-right text-xs text-gray-500 hidden lg:table-cell">{formatDate(item.updatedAt)}</td>

                                <td className="p-2 sm:p-4 text-center">
                                    <div className="flex justify-center gap-1 sm:gap-2">
                                        <Link 
                                            to={`/admin/product/${item.id}`}
                                            className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition shadow-sm"
                                            title="Edit"
                                        >
                                            <Pencil size={14} className="sm:w-4 sm:h-4" />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 sm:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition shadow-sm"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                         )
                    }) : (
                        <tr>
                            <td colSpan="8" className="p-6 sm:p-10 text-center text-gray-400">
                                <Package size={36} className="sm:w-12 sm:h-12 mx-auto mb-2 opacity-20"/>
                                <p className="text-sm">ไม่พบสินค้า (No Products Found)</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="p-3 sm:p-4 border-t border-gray-100 flex justify-center items-center gap-3 sm:gap-4 bg-gray-50">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={16} className="sm:w-4 sm:h-4"/>
                </button>
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                    หน้า {currentPage} / {totalPages}
                </span>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={16} className="sm:w-4 sm:h-4"/>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default FormProduct;