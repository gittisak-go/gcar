import { Outlet } from "react-router-dom";
import Navbar from "../components/default/Navbar"; // Adjust path if needed
import Footer from "../components/default/Footer";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-300">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
