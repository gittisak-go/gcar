import { Outlet } from "react-router-dom";
import Navbar from "../components/default/Navbar"; // Adjust path if needed
import Footer from "../components/default/Footer";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-black text-white transition-colors duration-300">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
