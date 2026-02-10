import React from "react";
import { motion } from "framer-motion";
import {
  Car,
  Search,
  CalendarCheck,
  User,
  Star,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    icon: <Search className="w-8 h-8 text-pink-500" />,
    title: "ค้นหารถ",
    desc: "เลือกดูรถที่มีพร้อมรายละเอียดสเปค ราคา และรูปภาพ",
  },
  {
    icon: <Car className="w-8 h-8 text-pink-500" />,
    title: "เลือกรถ",
    desc: "เลือกรถที่เหมาะกับการเดินทางและงบประมาณของคุณ",
  },
  {
    icon: <CalendarCheck className="w-8 h-8 text-pink-500" />,
    title: "จองทันที",
    desc: "จองรถของคุณได้เพียงไม่กี่คลิก พร้อมการยืนยันทันที",
  },
  {
    icon: <User className="w-8 h-8 text-pink-500" />,
    title: "จัดการโปรไฟล์",
    desc: "ดูการจอง อัปเดตข้อมูลส่วนตัว และจัดการบัญชีของคุณ",
  },
];

const features = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
    text: "การยืนยันตัวตนที่ปลอดภัยและการปกป้องข้อมูล",
  },
  {
    icon: <Star className="w-6 h-6 text-yellow-500" />,
    text: "คะแนนและรีวิวจากผู้ใช้งานจริง",
  },
  {
    icon: <Car className="w-6 h-6 text-blue-500" />,
    text: "รถหลากหลายประเภทสำหรับทุกความต้องการ",
  },
];

const UserGuide = () => {
  return (
    <div className="min-h-screen px-6 py-20 bg-gray-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          คู่มือผู้ใช้ 🚗
        </h1>
        <p className="mt-4 text-gray-600 dark:text-zinc-400">
          เรียนรู้วิธีใช้งานระบบรถเช่าอย่างมีประสิทธิภาพและรับประสบการณ์ที่ดีที่สุด
        </p>
      </motion.div>

      {/* Steps Section */}
      <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto mb-20">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md text-center"
          >
            <div className="flex justify-center mb-4">{step.icon}</div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          คุณสมบัติหลัก
        </h2>

        <div className="space-y-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 text-gray-700 dark:text-zinc-300"
            >
              {f.icon}
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default UserGuide;

