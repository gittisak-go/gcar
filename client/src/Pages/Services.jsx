import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Star,
  Shield,
  Car,
  Settings,
  Users,
  CreditCard,
  Clock,
  BarChart,
  PhoneCall,
  Calendar,
  CheckCircle,
  MapPin,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                               Animation Configs                            */
/* -------------------------------------------------------------------------- */

const sectionFade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut" },
};

const cardReveal = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, ease: "easeOut", delay },
});

const cardHover = {
  whileHover: { scale: 1.03, y: -6 },
  transition: { duration: 0.25, ease: "easeOut" },
};

/* -------------------------------------------------------------------------- */
/*                               Helper Components                             */
/* -------------------------------------------------------------------------- */

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <motion.div {...sectionFade} className="text-center mb-16">
    <div className="flex items-center justify-center gap-2 mb-4">
      {Icon && <Icon className="w-6 h-6 text-pink-500" />}
      <h2 className="text-3xl font-bold dark:text-white">{title}</h2>
    </div>
    {subtitle && (
      <p className="text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
        {subtitle}
      </p>
    )}
  </motion.div>
);

const ServiceCard = ({ icon: Icon, title, description, color, bgColor, delay }) => (
  <motion.div
    {...cardReveal(delay)}
    {...cardHover}
    className={`${bgColor} rounded-2xl p-8
      border border-transparent dark:border-zinc-800/60
      shadow-sm hover:shadow-lg`}
  >
    <Icon className={`w-9 h-9 mb-4 ${color}`} />
    <h3 className="text-xl font-semibold mb-2 dark:text-zinc-100">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-zinc-400">{description}</p>
  </motion.div>
);

const StepCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    {...cardReveal(delay)}
    {...cardHover}
    className="bg-white dark:bg-zinc-900 p-8 rounded-2xl
      border border-gray-200 dark:border-zinc-800 text-center"
  >
    <Icon className="w-10 h-10 mx-auto mb-4 text-pink-500" />
    <h4 className="text-xl font-semibold mb-2 dark:text-white">
      {title}
    </h4>
    <p className="text-gray-600 dark:text-zinc-400">{description}</p>
  </motion.div>
);

/* -------------------------------------------------------------------------- */
/*                                   Data                                     */
/* -------------------------------------------------------------------------- */

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
    title: "เช็ครถว่างทันที",
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
    icon: BarChart,
    title: "ระบบจัดการ",
    description: "แดชบอร์ดครบ จัดการง่าย",
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
  },
  {
    icon: PhoneCall,
    title: "บริการระดับพรีเมียม",
    description: "ดูแลเป็นพิเศษสำหรับลูกค้าประจำ",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
];

const steps = [
  {
    icon: MapPin,
    title: "เลือกสถานที่",
    description: "เลือกจุดรับรถและวันที่",
  },
  {
    icon: Car,
    title: "เลือกรถ",
    description: "เลือกรถที่เหมาะกับคุณ",
  },
  {
    icon: CheckCircle,
    title: "ยืนยันและออกเดินทาง",
    description: "ชำระเงินปลอดภัย ออกเดินทางได้เลย",
  },
];

/* -------------------------------------------------------------------------- */
/*                               Main Component                                */
/* -------------------------------------------------------------------------- */

const Services = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900 pt-10">
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div {...sectionFade} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
              <Star className="w-5 h-5 text-pink-500" />
              <span className="font-medium">บริการของเรา</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 dark:text-white">
              สัมผัสบริการรถเช่าที่ดีที่สุดใน{" "}
              <span className="text-pink-500">อุดรธานี</span>
            </h1>

            <p className="text-gray-600 dark:text-zinc-400 text-lg">
              บริการรถเช่าที่เชื่อถือได้ โปร่งใส และเน้นลูกค้าเป็นหลัก
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <SectionHeader
            icon={Settings}
            title="บริการหลัก"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureCards.map((item, idx) => (
              <ServiceCard key={idx} {...item} delay={idx * 0.08} />
            ))}
          </div>

          {/* How It Works */}
          <motion.div {...sectionFade} className="mt-32">
            <h3 className="text-3xl font-bold text-center mb-12 dark:text-white">
              ขั้นตอนการใช้บริการ
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, idx) => (
                <StepCard key={idx} {...step} delay={idx * 0.1} />
              ))}
            </div>
          </motion.div>

          {/* Premium Services */}
          <motion.div {...sectionFade} className="mt-32">
            <h3 className="text-3xl font-bold text-center mb-16 dark:text-white">
              บริการพรีเมียม
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advancedFeatures.map((item, idx) => (
                <ServiceCard key={idx} {...item} delay={idx * 0.08} />
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div {...sectionFade} className="mt-40 text-center">
            <h3 className="text-3xl font-bold mb-4 dark:text-white">
              พร้อมจองรถแล้วหรือยัง?
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 mb-8">
              สัมผัสความสะดวกสบาย เชื่อถือได้ ราคาโปร่งใส
            </p>

            <Link
              to="/models"
              className="inline-block px-8 py-3 rounded-xl font-medium
                border border-pink-500 text-pink-500
                hover:bg-pink-500 hover:text-white transition"
            >
              ดูรถเช่า
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;

