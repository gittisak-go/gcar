import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FeedbackModal from "./FeedbackModal";

import {
  Menu,
  X,
  LogIn,
  UserPlus,
  LogOut,
  Car,
  ChevronDown,
  User,
} from "lucide-react";
import useAuthStore from "../../store/store.js";
import ThemeToggle from "./ThemeToggle.jsx";
import logo from "../../assets/images/logo-1.png";

const Navbar = () => {
  const { user, profile, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    setIsOpen(false);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setDropdownOpen(false);
    navigate("/");
  };

  const isLinkActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "หน้าแรก" },
    { path: "/about", label: "เกี่ยวกับเรา" },
    { path: "/models", label: "รถเช่า" },
    { path: "/testimonials", label: "รีวิว" },
    { path: "/team", label: "ทีมงาน" },
    { path: "/contact", label: "ติดต่อ" },
    { path: "/guide", label: "คู่มือการใช้งาน" },

  ];

  // Insert Admin Label if Role is appropriate
  if (profile && (profile.role === 'staff' || profile.role === 'super_admin')) {
    navItems.push({ path: "/admin", label: "จัดการระบบ (Admin)" });
  }

  return (
  <>
    {feedbackOpen && (
      <FeedbackModal onClose={() => setFeedbackOpen(false)} />
    )}

    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* LEFT SIDE: Toggle + Logo */}
          <div className="flex items-center space-x-4">
            <ThemeToggle /> {/* Theme switch on the far left */}

            <Link
              to="/"
              className="flex items-center space-x-2 text-2xl font-bold group"
            >
              <img src={logo} alt="Rungroj Car Rental" className="h-10 w-auto transform group-hover:scale-105 transition-transform" />
              <div className="flex flex-col leading-none">
                 <div className="flex">
                    <span className="text-gray-900 dark:text-white tracking-tight text-lg">Rungroj</span>
                    <span className="text-pink-500 tracking-tight text-lg ml-1">CarRental</span>
                 </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-all hover:text-pink-500 relative py-1
                  ${
                    isLinkActive(item.path)
                      ? "text-pink-500"
                      : "text-gray-700 dark:text-zinc-300"
                  }
                  after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-pink-500 
                  after:left-0 after:bottom-0 after:transition-all hover:after:w-full
                  ${isLinkActive(item.path) ? "after:w-full" : ""}`}
              >
                {item.label}
              </Link>
            ))}

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
            <button
  onClick={() => setFeedbackOpen(true)}
  className="px-4 py-2 border border-red-500 text-red-500
             rounded-lg hover:bg-red-500 hover:text-white
             transition-all font-medium">
   แสดงความคิดเห็น
</button>

              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/30 transition-all border border-pink-400/20"
                  >
                    <span>บัญชี</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-xl shadow-xl py-2 border border-gray-100 dark:border-zinc-800"
                      >
                        <button
                          onClick={() => navigate('/profile')}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-zinc-300 hover:bg-pink-50 dark:hover:bg-zinc-800 hover:text-pink-500 transition-colors flex items-center space-x-2"
                        >
                          <User className="w-4 h-4" />
                          <span>โปรไฟล์</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-zinc-300 hover:bg-pink-50 dark:hover:bg-zinc-800 hover:text-pink-500 transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>ออกจากระบบ</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <motion.div whileHover="hover" initial="rest" animate="rest">
                    <Link
                      to="/login"
                      className="relative flex items-center space-x-2 px-4 py-2 rounded-lg
               text-gray-700 dark:text-zinc-300 transition-all duration-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>เข้าสู่ระบบ</span>
                    </Link>
                  </motion.div>

                  <Link
                    to="/register"
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-pink-500/30 transition-all transform hover:scale-105 border border-pink-400/20 font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>สมัครสมาชิก</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-700 dark:text-zinc-300 hover:text-pink-500 transition-colors bg-gray-100 dark:bg-zinc-800 rounded-lg"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t dark:border-zinc-800 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 text-center">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-sm font-medium transition-all hover:text-pink-500 
                    ${
                      isLinkActive(item.path)
                        ? "text-pink-500 bg-pink-50 dark:bg-pink-900/10"
                        : "text-gray-700 dark:text-zinc-300"
                    }
                    p-3 rounded-xl hover:bg-pink-50 dark:hover:bg-zinc-800`}
                  >
                    {item.label}
                  </Link>
                ))}
                {!user && (
                   <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                     <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-semibold">เข้าสู่ระบบ</Link>
                     <Link to="/register" onClick={() => setIsOpen(false)} className="w-full py-3 rounded-xl bg-pink-500 text-white font-semibold shadow-lg shadow-pink-500/20">สมัครสมาชิก</Link>
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>  );
};

export default Navbar;
