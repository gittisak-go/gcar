import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, AlertCircle, CheckCircle } from "lucide-react";

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile`,
    });

    setIsLoading(false);
    if (error) {
      setIsError(true);
      setMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } else {
      setMessage("ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว! กรุณาตรวจสอบอีเมลของคุณ");
      setIsError(false);
      setTimeout(() => onClose(), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors"><X className="w-5 h-5" /></button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-pink-50 dark:bg-pink-900/20"><Mail className="w-6 h-6 text-pink-500" /></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">รีเซ็ตรหัสผ่าน</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">กรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 ml-1">อีเมล</label>
            <div className="relative">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required disabled={isLoading}
                className="w-full px-4 py-3 pl-11 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all outline-none disabled:opacity-50" />
              <Mail className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <AnimatePresence>
            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 p-4 rounded-xl border ${isError ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400" : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400"}`}>
                {isError ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                <p className="text-sm font-medium">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex flex-col gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading}
              className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold shadow-lg shadow-pink-500/30 hover:bg-pink-600 transition-all disabled:opacity-70">
              {isLoading ? "กำลังดำเนินการ..." : "ส่งลิงก์รีเซ็ต"}
            </motion.button>
            <button type="button" onClick={onClose} disabled={isLoading} className="w-full py-2 text-sm text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

