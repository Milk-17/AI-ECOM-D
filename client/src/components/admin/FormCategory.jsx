import React, { useState, useEffect } from 'react';
import { 
  createCategory, 
  listCategory, 
  removeCategory,
  createSubCategory, 
  removeSubCategory,
  updateCategory,     // <--- อย่าลืม import
  updateSubCategory   // <--- อย่าลืม import
} from '../../api/Category';
import useEcomStore from '../../store/ecom-store';
import { toast } from "react-toastify";
import { Trash2, Edit2, Plus, FolderOpen, CornerDownRight, Layers, X, Save } from 'lucide-react'; // เพิ่ม X และ Save icon

const FormCategory = () => {
  const token = useEcomStore((state) => state.token);
  const [name, setName] = useState('');
  const categories = useEcomStore((state) => state.categories);
  const getCategory = useEcomStore((state) => state.getCategory);
  const [parentId, setParentId] = useState(''); 

  // --- State สำหรับ Modal แก้ไข ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, name: '', type: '' }); // type: 'main' | 'sub'

  useEffect(() => {
    getCategory(token);
  }, [getCategory, token]);

  // --- Functions: Create ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!name) return toast.warning("กรุณากรอกชื่อหมวดหมู่");
    try {
      let res;
      if (parentId) {
        res = await createSubCategory(token, { name, categoryId: parentId });
        toast.success(`สร้างหมวดหมู่ย่อย "${res.data.name}" สำเร็จ`);
      } else {
        res = await createCategory(token, { name });
        toast.success(`สร้างหมวดหมู่หลัก "${res.data.name}" สำเร็จ`);
      }
      setName('');
      setParentId('');
      getCategory(token);
    } catch (err) {
      console.log(err);
      const msg = err.response?.data?.message || "เกิดข้อผิดพลาด";
      toast.error(msg);
    }
  };

  // --- Functions: Remove ---
  const handleRemoveCategory = async (id, name) => {
    if (window.confirm(`ยืนยันการลบหมวดหมู่หลัก "${name}"? (ต้องลบหมวดหมู่ย่อยออกก่อน)`)) {
      try {
        const res = await removeCategory(token, id);
        toast.success(`ลบ "${res.data.name}" สำเร็จ`);
        getCategory(token);
      } catch (err) {
        const msg = err.response?.data?.message || "ลบไม่สำเร็จ";
        toast.error(msg);
      }
    }
  };

  const handleRemoveSubCategory = async (id, name) => {
    if (window.confirm(`ยืนยันการลบหมวดหมู่ย่อย "${name}"?`)) {
      try {
        const res = await removeSubCategory(token, id);
        toast.success(`ลบ "${res.data.name}" สำเร็จ`);
        getCategory(token);
      } catch (err) {
        const msg = err.response?.data?.message || "ลบไม่สำเร็จ";
        toast.error(msg);
      }
    }
  };

  // --- Functions: Edit (Modal) ---
  const openEditModal = (id, currentName, type) => {
    setEditData({ id, name: currentName, type });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if(!editData.name) return toast.warning("กรุณากรอกชื่อใหม่");

    try {
        let res;
        // เช็คว่าเป็น Main หรือ Sub เพื่อเรียก API ให้ถูกตัว
        if(editData.type === 'main'){
            res = await updateCategory(token, editData.id, { name: editData.name });
        } else {
            res = await updateSubCategory(token, editData.id, { name: editData.name }); // ถ้าจะย้ายหมวดแม่ด้วย ต้องส่ง categoryId เพิ่ม
        }

        toast.success(`แก้ไขชื่อเป็น "${res.data.name}" สำเร็จ`);
        getCategory(token); // โหลดข้อมูลใหม่
        setIsModalOpen(false); // ปิด Modal
        
    } catch (err) {
        console.log(err);
        const msg = err.response?.data?.message || "แก้ไขไม่สำเร็จ";
        toast.error(msg);
    }
  };


  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen relative">
        
        {/* --- Header Section --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Layers className="text-blue-600" size={28} />
                จัดการหมวดหมู่สินค้า (Category Management)
            </h1>
            <p className="text-gray-500 mt-1 ml-10">สร้าง แก้ไข และจัดการโครงสร้างหมวดหมู่สินค้าของร้านค้า</p>
        </div>

        {/* --- Form Section --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                
                {/* Input Name */}
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหมวดหมู่</label>
                    <input
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        type='text'
                        placeholder="เช่น CPU, การ์ดจอ, โน้ตบุ๊ค" 
                    />
                </div>

                {/* Dropdown Parent */}
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่หลัก (Optional)</label>
                    <select
                        value={parentId}
                        onChange={(e) => setParentId(e.target.value)}
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer bg-white"
                    >
                        <option value=''>-- สร้างเป็นหมวดหมู่หลัก --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                
                {/* Submit Button */}
                <button className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 font-medium">
                    <Plus size={20} />
                    <span>เพิ่มหมวดหมู่</span>
                </button>
            </form>
        </div>

        {/* --- List Section --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center">
                <span>โครงสร้างหมวดหมู่ปัจจุบัน</span>
                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">
                    Total: {categories.length} Main Categories
                </span>
            </div>
            
            <ul className="divide-y divide-gray-100">
                {categories.map(main => (
                    <React.Fragment key={main.id}>
                        {/* Main Category Row */}
                        <li className="group flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-md text-blue-600">
                                    <FolderOpen size={20} />
                                </div>
                                <span className="font-semibold text-gray-800 text-lg">{main.name}</span>
                            </div>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                {/* ปุ่ม Edit Main */}
                                <button
                                    onClick={() => openEditModal(main.id, main.name, 'main')}
                                    className="text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 p-2 rounded-full transition-all"
                                    title="แก้ไขชื่อ"
                                >
                                    <Edit2 size={18} />
                                </button>
                                {/* ปุ่ม Delete Main */}
                                <button
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
                                    onClick={() => handleRemoveCategory(main.id, main.name)}
                                    title="ลบหมวดหมู่หลัก"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </li>
                        
                        {/* SubCategory Rows */}
                        {main.subCategories.length > 0 && (
                            <div className="bg-slate-50 border-b border-gray-100 pb-2">
                                {main.subCategories.map(sub => (
                                    <li key={sub.id} className="flex justify-between items-center pl-16 pr-6 py-2 hover:bg-slate-100 transition-colors relative group/sub">
                                            <div className="flex items-center gap-2">
                                                <CornerDownRight size={16} className="text-gray-400" />
                                                <span className="text-gray-600 font-medium">{sub.name}</span>
                                            </div>
                                            
                                            <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-all">
                                                 {/* ปุ่ม Edit Sub */}
                                                 <button
                                                    onClick={() => openEditModal(sub.id, sub.name, 'sub')}
                                                    className="text-gray-400 hover:text-yellow-500 p-1.5 rounded transition-all"
                                                    title="แก้ไขชื่อ"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {/* ปุ่ม Delete Sub */}
                                                <button
                                                    className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-all"
                                                    onClick={() => handleRemoveSubCategory(sub.id, sub.name)}
                                                    title="ลบหมวดหมู่ย่อย"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                    </li>
                                ))}
                            </div>
                        )}
                    </React.Fragment>
                ))}

                {categories.length === 0 && (
                    <li className="p-8 text-center text-gray-400">
                        ยังไม่มีหมวดหมู่สินค้า เริ่มต้นสร้างได้เลย!
                    </li>
                )}
            </ul>
        </div>


        {/* --- MODAL UPDATE --- */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90%]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            แก้ไขชื่อ {editData.type === 'main' ? 'หมวดหมู่หลัก' : 'หมวดหมู่ย่อย'}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleUpdate}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">ชื่อใหม่</label>
                            <input 
                                type="text"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500"
                                value={editData.name}
                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                type="submit"
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center gap-2"
                            >
                                <Save size={18} />
                                บันทึก
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

    </div>
  )
}

export default FormCategory;