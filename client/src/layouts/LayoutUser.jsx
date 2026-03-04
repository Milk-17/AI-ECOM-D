import { Outlet } from "react-router-dom";
import MainNav from "../components/MainNav";

const LayoutUser = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutUser;
