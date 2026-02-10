import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Errorpage = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg
          className="paper mb-8"
          viewBox="0 0 300 300"
          width="300px"
          height="300px"
          role="img"
          aria-label="A piece of paper torn in half"
        >
          <g
            className="paper__outline text-zinc-900 dark:text-zinc-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(61,4)"
          >
            <g className="paper__top" transform="translate(0,25)">
              <polygon
                className="fill-zinc-200 dark:fill-zinc-800 stroke-none"
                points="0 148,0 0,137 0,187 50,187 148,155 138,124 148,93 138,62 148,31 138"
                transform="translate(-12,12)"
              />
              <polygon
                className="fill-white dark:fill-zinc-900 stroke-none"
                points="0 148,0 0,137 0,187 50,187 148,155 138,124 148,93 138,62 148,31 138"
              />
              <polygon
                className="fill-zinc-200 dark:fill-zinc-800 stroke-none"
                points="137 0,132 55,187 50,142 45"
              />
              <polyline points="137 0,142 45,187 50" />
              <polyline points="0 148,0 0,137 0,187 50,187 148" />
              <g className="stroke-zinc-300 dark:stroke-zinc-700">
                <polyline points="22 88,165 88" />
                <polyline points="22 110,165 110" />
                <polyline points="22 132,165 132" />
              </g>
              <polyline
                className="paper__tear"
                points="0 148,31 138,62 148,93 138,124 148,155 138,187 148"
                strokeDasharray="198 198"
                strokeDashoffset="-198"
              />
            </g>
            <g className="paper__bottom" transform="translate(0,25)">
              <polygon
                className="fill-zinc-200 dark:fill-zinc-800 stroke-none"
                points="0 148,31 138,62 148,93 138,124 148,155 138,187 148,187 242,0 242"
                transform="translate(-12,12)"
              />
              <polygon
                className="fill-white dark:fill-zinc-900 stroke-none"
                points="0 148,31 140,62 148,93 138,124 148,155 138,187 148,187 242,0 242"
              />
              <polyline points="187 148,187 242,0 242,0 148" />
              <g className="stroke-zinc-300 dark:stroke-zinc-700">
                <polyline points="22 154,165 154" />
                <polyline points="22 176,165 176" />
                <polyline points="22 198,94 198" />
              </g>
              <polyline
                className="paper__tear"
                points="0 148,31 138,62 148,93 138,124 148,155 138,187 148"
                strokeDasharray="198 198"
                strokeDashoffset="-198"
              />
            </g>
          </g>
        </svg>
      </motion.div>

      <div className="max-w-md">
        <h1 className="text-6xl font-black text-pink-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Page Not Found</h2>
        <p className="text-gray-600 dark:text-zinc-400 mb-8 leading-relaxed">
          We couldn’t find the page you were looking for. It may have been
          moved, or it just doesn’t exist.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-pink-500 text-white font-bold rounded-lg shadow-lg shadow-pink-500/30 hover:bg-pink-600 hover:scale-105 transition-all active:scale-95"
        >
          Go Back Home
        </Link>
      </div>
    </main>
  );
};

export default Errorpage;
