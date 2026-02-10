import React from "react";
import { motion } from "framer-motion";
import {
  Star,
  Shield,
  Car,
  CheckCircle,
  Award,
  Settings,
  Users,
  CreditCard,
  Clock,
  BarChart,
  PhoneCall,
  Calendar,
} from "lucide-react";

const About = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  const featureCards = [
    {
      icon: Shield,
      title: "จองง่ายปลอดภัย",
      description: "ระบบจองที่ปลอดภัย เงื่อนไขไม่ยุ่งยาก",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Car,
      title: "รถหลากหลาย",
      description: "รถเช่าหลากรุ่น ทั้งขับเองและพร้อมคนขับ",
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
    },
    {
      icon: Users,
      title: "บริการ 24 ชม.",
      description: "พร้อมดูแลลูกค้าตลอด 24 ชั่วโมง",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: CreditCard,
      title: "ชำระง่าย",
      description: "ไม่ต้องใช้บัตรเครดิต จ่ายสะดวก",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  const advancedFeatures = [
    {
      icon: Clock,
      title: "เช็ครถว่างได้ทันที",
      description: "ดูสถานะรถว่างได้แบบเรียลไทม์",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      icon: Calendar,
      title: "ระยะเวลายืดหยุ่น",
      description: "เช่าได้ตั้งแต่รายชั่วโมงถึงรายเดือน",
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
    },
    {
      icon: CreditCard,
      title: "ชำระเงินหลายช่องทาง",
      description: "รองรับทั้งเงินสด โอน และบัตร",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      icon: BarChart,
      title: "ระบบจัดการ",
      description: "แดชบอร์ดครบ จัดการง่าย",
      color: "text-teal-500",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      icon: PhoneCall,
      title: "ช่วยเหลือตลอด 24 ชม.",
      description: "ทีมงานพร้อมช่วยเหลือตลอดเวลา",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  const stats = [
    { value: "15K+", label: "ลูกค้าพอใจ" },
    { value: "10+", label: "จุดรับ-ส่ง" },
    { value: "98%", label: "ความพอใจ" },
    { value: "24/7", label: "บริการลูกค้า" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900 pt-8 transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="whileInView"
            className="text-center max-w-3xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-full mb-6
                         cursor-pointer hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors duration-200"
              >
            <Star className="w-5 h-5 text-pink-500" />
            <span className="text-pink-700 dark:text-pink-400 font-medium">
              เกี่ยวกับเรา
            </span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 dark:text-white">
              สัมผัสประสบการณ์
              <span className="text-pink-500"> รถเช่าที่ดีที่สุด</span>
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 text-lg leading-relaxed">
              ยินดีต้อนรับสู่ Rungroj CarRental รุ่งโรจน์คาร์เร้นท์ เราให้บริการรถเช่าอุดรธานี ทั้งรถเช่าขับเอง และรถเช่าพร้อมคนขับ ด้วยรถใหม่ สะอาด ปลอดภัย
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-zinc-950/50">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="whileInView"
            className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-6 h-6 text-pink-500" />
                <h2 className="text-3xl font-bold dark:text-white">พันธกิจของเรา</h2>
              </div>
              <p className="text-gray-600 dark:text-zinc-400 leading-relaxed mb-6">
                พันธกิจของเราคือการมอบประสบการณ์รถเช่าที่สะดวก โปร่งใส และเน้นลูกค้าเป็นศูนย์กลาง เราเชื่อว่าการเช่ารถควรง่าย ราคาเข้าถึงได้ และไร้ความกังวล
              </p>
              <ul className="space-y-4">
                {[
                  "ขั้นตอนการจองง่ายและสะดวก",
                  "ราคาโปร่งใส ไม่มีค่าใช้จ่ายแอบแฝง",
                  "บริการลูกค้า 24 ชั่วโมง",
                  "รถใหม่ สะอาด ตรวจสภาพสม่ำเสมอ",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-pink-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-zinc-300">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-lg text-center group hover:bg-pink-50 dark:hover:bg-pink-900/20 border border-transparent dark:border-zinc-800 transition-all">
                  <h3 className="text-3xl font-bold text-pink-500 mb-2 group-hover:scale-110 transition-transform">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 dark:text-zinc-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Basic Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="whileInView"
            className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Settings className="w-6 h-6 text-pink-500" />
              <h2 className="text-3xl font-bold dark:text-white">จุดเด่นของเรา</h2>
            </div>
            <p className="text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
              ค้นพบว่าทำไมลูกค้าถึงเลือก Rungroj CarRental
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {featureCards.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${feature.bgColor} rounded-lg p-6 hover:scale-105 transition-transform border border-transparent dark:border-zinc-800/50`}>
                <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold mb-2 dark:text-zinc-100">{feature.title}</h3>
                <p className="text-gray-600 dark:text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Advanced Features */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="whileInView"
            className="mt-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-4 dark:text-white">ฟีเจอร์พิเศษ</h3>
              <p className="text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
                แอปพลิเคชันของเรามีฟีเจอร์ครบครัน เพื่อการเช่ารถที่ราบรื่น
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advancedFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 hover:border-pink-200 dark:hover:border-pink-500/50 
                           transition-all hover:-translate-y-1 group">
                  <div
                    className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center 
                                mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-zinc-100">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-zinc-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
