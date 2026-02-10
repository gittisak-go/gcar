import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus, Mail, Lock, ChevronRight, Car, Shield, Eye, EyeOff, AlertCircle, Users,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../store/store.js";

const Register = () => {
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) navigate("/profile");
  }, [user, navigate]);

  const handleOAuth = async (provider) => {
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/profile` },
    });
    if (err) setError(`ไม่สามารถสมัครด้วย ${provider} ได้ กรุณาลองใหม่`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน!");
      return;
    }
    if (formData.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.email.split("@")[0] },
      },
    });
    setLoading(false);

    if (err) {
      if (err.message?.includes("already registered")) {
        setError("อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ");
      } else {
        setError("สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    } else {
      alert("สมัครสำเร็จ! 🎉 กรุณาตรวจสอบอีเมลเพื่อยืนยัน");
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900 flex transition-colors duration-300">
      {/* Left Section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="absolute top-20 right-20 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative w-full p-12 flex flex-col justify-between z-10">
          <div>
            <Link to="/" className="flex items-center gap-2 text-white mb-16 group">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-all"><Car className="w-8 h-8" /></div>
              <span className="text-2xl font-bold">Rungroj CarRental</span>
            </Link>
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-bold text-white mb-6 leading-tight">เริ่มต้น<br />การเดินทาง</h1>
                <p className="text-pink-50/90 text-lg leading-relaxed max-w-md">สมัครง่าย ไม่ยุ่งยาก เริ่มจองรถได้ทันที</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-12">
                {[{ icon: Users, title: "สมัครง่าย", desc: "ไม่ต้องใช้เอกสารมากมาย" }, { icon: Shield, title: "ปลอดภัย", desc: "ข้อมูลส่วนตัวถูกเข้ารหัส" }].map((feature, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.1 }} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all border border-white/5">
                    <feature.icon className="w-6 h-6 text-white mb-3" />
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-pink-50/80 text-sm">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Section: Register Form */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden flex flex-col items-center gap-4 mb-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-pink-50 dark:bg-zinc-900 p-2 rounded-lg group-hover:bg-pink-100 dark:group-hover:bg-zinc-800 transition-all"><Car className="w-8 h-8 text-pink-500" /></div>
              <span className="text-2xl font-bold"><span className="text-gray-900 dark:text-white">Rungroj</span> <span className="text-pink-500">CarRental</span></span>
            </Link>
          </motion.div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 dark:text-white">สมัครสมาชิก</h2>
            <p className="text-gray-600 dark:text-zinc-400">สมัครง่ายๆ เริ่มจองรถได้เลย</p>
          </div>

          {/* Social Signup — fastest path */}
          <div className="space-y-3 mb-6">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => handleOAuth("google")}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-100 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm flex items-center justify-center gap-3">
              <img src="https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/google_logo-google_icongoogle-512.png" alt="Google" className="w-5 h-5" />
              สมัครด้วย Google
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => handleOAuth("facebook")}
              className="w-full px-4 py-3 bg-[#1877F2] text-white rounded-lg font-bold hover:bg-[#166FE5] transition-all shadow-sm flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              สมัครด้วย Facebook
            </motion.button>
          </div>

          <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-zinc-800"></div></div><div className="relative flex justify-center"><span className="px-4 text-sm text-gray-500 bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900 transition-colors">หรือสมัครด้วยอีเมล</span></div></div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">อีเมล</label>
              <div className="relative">
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full px-4 py-3 pl-12 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-zinc-500" placeholder="you@example.com" />
                <Mail className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute left-4 top-3.5" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">รหัสผ่าน</label>
              <div className="relative">
                <input type={showPassword.password ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="w-full px-4 py-3 pl-12 pr-12 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-zinc-500" placeholder="อย่างน้อย 6 ตัวอักษร" />
                <Lock className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute left-4 top-3.5" />
                <button type="button" onClick={() => setShowPassword({ ...showPassword, password: !showPassword.password })} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors">
                  {showPassword.password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <input type={showPassword.confirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required className="w-full px-4 py-3 pl-12 pr-12 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-zinc-500" placeholder="กรอกรหัสผ่านอีกครั้ง" />
                <Lock className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute left-4 top-3.5" />
                <button type="button" onClick={() => setShowPassword({ ...showPassword, confirmPassword: !showPassword.confirmPassword })} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors">
                  {showPassword.confirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200/50 dark:border-red-900/50">
                <AlertCircle className="w-5 h-5" /><p className="text-sm">{error}</p>
              </motion.div>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="w-full px-4 py-3 bg-pink-500 text-white rounded-lg font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus className="w-5 h-5" />สมัครสมาชิก</>}
            </motion.button>
          </form>
          <p className="mt-8 text-center text-gray-600 dark:text-zinc-400">
            มีบัญชีอยู่แล้ว?{" "}
            <Link to="/login" className="text-pink-500 dark:text-pink-400 font-bold hover:text-pink-600 transition-colors inline-flex items-center gap-1">เข้าสู่ระบบ<ChevronRight className="w-4 h-4" /></Link>
          </p>
          <p className="mt-4 text-center">
            <Link to="/models" className="text-sm text-gray-500 dark:text-zinc-500 hover:text-pink-500 transition-colors">← ดูรถเช่าก่อนโดยไม่ต้องสมัคร</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

