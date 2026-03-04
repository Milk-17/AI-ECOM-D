import { Outlet } from "react-router-dom";
import MainNav from "../components/MainNav";
import ChatbotWidget from "../components/ChatbotWidget";

const Layout = () => {
  return (
    <div>
      <MainNav />
      
      <main className="h-full px-4 mt-2 mx-auto">
        <Outlet />
      </main>

      <ChatbotWidget />
    </div>
  );
};

export default Layout;
