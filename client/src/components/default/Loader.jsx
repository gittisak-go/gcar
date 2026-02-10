import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      /* Transition between pure white and deep Zinc-950 */
      className="fixed inset-0 bg-white dark:bg-zinc-950 z-[100] flex items-center justify-center transition-colors duration-500 overflow-hidden"
    >
      <div className="relative">
        {/* Decorative Background Glow (Only visible in Dark Mode) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-[120px] pointer-events-none"></div>

        {/* The Car Container */}
        <motion.div
          initial={{ x: -150 }}
          animate={{
            x: 150,
            transition: {
              repeat: Infinity,
              duration: 2.5,
              ease: "linear",
            },
          }}
          className="relative z-10"
        >
          {/* Car Body with Vibrating Animation */}
          <motion.div
            animate={{
              y: [0, -4, 0],
              transition: {
                repeat: Infinity,
                duration: 0.15, // Fast vibration like an engine
                ease: "easeInOut",
              },
            }}
            className="w-24 h-9 bg-pink-500 rounded-lg relative shadow-xl"
          >
            {/* Windows */}
            <div className="absolute top-0 left-4 w-10 h-4 bg-pink-600 dark:bg-pink-700/50 rounded-t-lg"></div>
            <div className="absolute -top-1 right-3 w-7 h-4 bg-pink-600 dark:bg-pink-700/50 rounded-t-lg skew-x-12"></div>

            {/* Headlights with Neon Glow effect in Dark Mode */}
            <div className="absolute right-0 top-2 w-2 h-3 bg-yellow-300 rounded-full shadow-[0_0_15px_rgba(253,224,71,0.8)] dark:shadow-[0_0_25px_rgba(253,224,71,1)]"></div>
            <div className="absolute left-1 top-2 w-1.5 h-2 bg-red-600 rounded-full"></div>

            {/* Spinning Wheels */}
            {[2, 16].map((leftPos, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }}
                style={{ left: `${leftPos * 4}px` }}
                className="absolute -bottom-3 w-6 h-6 bg-zinc-900 dark:bg-black rounded-full border-[3px] border-zinc-300 dark:border-zinc-700 flex items-center justify-center"
              >
                {/* Wheel Spokes */}
                <div className="w-full h-0.5 bg-zinc-400 dark:bg-zinc-600 rotate-45"></div>
                <div className="w-0.5 h-full bg-zinc-400 dark:bg-zinc-600"></div>
              </motion.div>
            ))}

            {/* Exhaust Smoke Particles */}
            <div className="absolute -left-4 top-5 flex space-x-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0 }}
                  animate={{ opacity: [0, 0.5, 0], scale: [1, 2, 0.5], x: -20 }}
                  transition={{ repeat: Infinity, duration: 0.8, delay }}
                  className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Fast Moving Road Stripes */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex space-x-12 w-[400px] justify-center overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ x: 100 }}
              animate={{ x: -300 }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                ease: "linear",
                delay: i * 0.15,
              }}
              className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full shrink-0"
            />
          ))}
        </div>

        {/* Loading Text */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center w-40">
          <motion.p
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
            className="text-zinc-500 dark:text-zinc-400 font-bold tracking-[0.2em] uppercase text-xs"
          >
            Revving up...
          </motion.p>
          <div className="mt-2 w-full h-1 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              animate={{ x: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1/2 h-full bg-pink-500 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;
