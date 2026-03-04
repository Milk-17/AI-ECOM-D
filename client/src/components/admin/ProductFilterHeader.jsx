import { Search, Filter, RefreshCcw } from "lucide-react";

const ProductFilterHeader = ({ 
    search, 
    setSearch, 
    categoryFilter, 
    setCategoryFilter, 
    categories,
    handleReset 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      
      {/* 1. ช่องค้นหา (Search) */}
      <div className="relative w-full md:w-1/3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
          placeholder="ค้นหาชื่อสินค้า..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 2. ตัวกรองหมวดหมู่ (Filter) & Reset */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative flex items-center w-full md:w-auto">
            <Filter size={18} className="absolute left-3 text-gray-500 pointer-events-none" />
            <select
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer w-full md:w-48 appearance-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            </select>
        </div>

        {/* ปุ่ม Reset */}
        {(search || categoryFilter) && (
            <button 
                onClick={handleReset}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium whitespace-nowrap"
                title="ล้างตัวกรอง"
            >
                <RefreshCcw size={16} /> ล้างค่า
            </button>
        )}
      </div>
    </div>
  );
};

export default ProductFilterHeader;