import { Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import UserGuide from "./Pages/UserGuide";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Models from "./Pages/Models";
import Services from "./Pages/Services";
import Testimonials from "./Pages/Testimonials";
import Booking from "./Pages/Booking";
import Team from "./Pages/Team";
import Contact from "./Pages/Contact";
import NotFound from "./Pages/NotFound";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import LearnMore from "./Pages/LearnMore";
import Profile from "./Pages/Profile";
import AdminDashboard from "./Pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import { MainLayout } from "./layout/MainLayout";
import { AuthLayout } from "./layout/AuthLayout";

import ScrollToTop from "./components/ScrollToTop";
import { MouseTrail } from "@stichiboi/react-elegant-mouse-trail";

function App() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <ScrollToTop />
      {isLargeScreen && <MouseTrail strokeColor="#ec4899" lineWidthStart={30} />}

      <AnimatePresence mode="wait">
        <Routes>
          {/* Auth routes — no navbar/footer */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/guide" element={<UserGuide />} />
          </Route>

          {/* Main routes — all publicly browsable (no login wall) */}
          <Route element={<MainLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/models" element={<Models />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/learnmore" element={<LearnMore />} />
            {/* Booking — publicly browsable, auth prompted only at confirm */}
            <Route path="/booking/:id" element={<Booking />} />
            {/* Profile — protected */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
