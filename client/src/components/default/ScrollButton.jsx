import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Modern way to check scroll position
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 p-3 rounded-full transition-all duration-500 ease-in-out transform z-[40]
        /* Light Mode Styles */
        bg-pink-500 hover:bg-pink-600 text-white shadow-lg
        /* Dark Mode Styles */
        dark:bg-pink-600 dark:hover:bg-pink-500 dark:border dark:border-pink-400/20
        /* Cool Neon Glow in Dark Mode */
        dark:shadow-[0_0_20px_rgba(249,115,22,0.4)]
        /* Animation States */
        ${visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-10 scale-50 pointer-events-none"
        }
        hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-pink-400`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-6 h-6 animate-bounce" />
    </button>
  );
};

export default ScrollButton;
