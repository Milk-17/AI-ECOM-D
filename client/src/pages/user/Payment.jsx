import useEcomStore from "../../store/ecom-store";
import CheckoutForm from "../../components/CheckoutForm";

const Payment = () => {
  const token = useEcomStore((s) => s.token);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ชำระเงิน</h1>
      <CheckoutForm />
    </div>
  );
};

export default Payment;