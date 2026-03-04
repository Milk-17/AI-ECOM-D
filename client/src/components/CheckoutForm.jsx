import { useState } from "react";
import { saveOrder } from "../api/user";
import useEcomStore from "../store/ecom-store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function CheckoutForm() {
  const token = useEcomStore((state) => state.token);
  const clearCart = useEcomStore((state) => state.clearCart);
  const getProduct = useEcomStore((state) => state.getProduct);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await saveOrder(token, {});
      console.log(res);
      clearCart();
      getProduct(100);
      toast.success("สั่งซื้อสำเร็จ!");
      navigate("/user/history");
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || "เกิดข้อผิดพลาดในการสั่งซื้อ";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">ยืนยันการสั่งซื้อ</h3>
        <p className="text-gray-600 mb-4">
          กดปุ่มด้านล่างเพื่อยืนยันการสั่งซื้อสินค้า
        </p>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "กำลังดำเนินการ..." : "ยืนยันการสั่งซื้อ"}
        </button>
      </div>
    </form>
  );
}