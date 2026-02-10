import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  User,
  MessageCircle,
  Star,
  MessageSquare,
} from "lucide-react";

const LINE_URL = "https://line.me/R/ti/p/@rungroj";
const FACEBOOK_URL = "https://m.me/553199731216723";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  // References for the Map
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    console.log("Form submitted:", formData);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  // --- Map Initialization Logic ---
  useEffect(() => {
    // 1. Prevent re-initialization if map already exists
    if (mapRef.current) return;

    // 2. Fix for Leaflet default marker icons in React/Webpack environments
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // 3. Initialize Map if container exists
    if (mapContainerRef.current) {
      // Coordinates for Udon Thani Airport (precise)
      const lat = 17.38661299500792;
      const lng = 102.7761144090884;

      mapRef.current = L.map(mapContainerRef.current).setView([lat, lng], 14);

      // Add OpenStreetMap Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      // Add Marker
      L.marker([lat, lng])
        .addTo(mapRef.current)
        .bindPopup("<b>Rungroj CarRental</b><br>สาขาสนามบินอุดรธานี")
        .openPopup();
    }

    // 4. Cleanup function to remove map instance on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const contactInfo = [
    {
      icon: Phone,
      title: "โทรศัพท์",
      details: ["086-634-8619", "096-363-8519"],
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Mail,
      title: "อีเมล",
      details: ["rungrojcarrental@gmail.com"],
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
    },
    {
      icon: MapPin,
      title: "สถานที่",
      details: ["สาขาสนามบินอุดรธานี", "ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000"],
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: Clock,
      title: "เวลาทำการ",
      details: [
        "จันทร์ - ศุกร์: 8:00 - 20:00",
        "เสาร์: 8:00 - 18:00",
        "อาทิตย์: 9:00 - 17:00",
      ],
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900 pt-8 transition-colors duration-300">
      {/* Hero Section */}
      <section className="pt-16 pb-4">
        <div className="container mx-auto px-4">
          <motion.div
            variants={fadeIn}
            initial="initial"
            whileInView="whileInView"
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-full mb-6
                         cursor-pointer hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors duration-200"
            >
              <MessageSquare className="w-5 h-5 text-pink-500" />
              <span className="text-pink-700 dark:text-pink-400 font-medium">
                ติดต่อเรา
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 dark:text-white">
              ติดต่อ <span className="text-pink-500">เรา</span>
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 text-lg leading-relaxed">
              เรายินดีรับฟังความคิดเห็นของคุณ เพื่อให้บริการรถเช่าที่ดียิ่งขึ้น
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information Column */}
            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
              className="space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${info.bgColor} rounded-xl p-6 hover:scale-105 transition-all border border-transparent dark:border-zinc-800`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <info.icon className={`w-6 h-6 ${info.color}`} />
                      <h3 className="text-xl font-semibold dark:text-zinc-100">
                        {info.title}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {info.details.map((detail, idx) => (
                        <p
                          key={idx}
                          className="text-gray-600 dark:text-zinc-400 text-sm"
                        >
                          {detail}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Leaflet Map Implementation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-lg border border-transparent dark:border-zinc-700 h-80 relative z-0"
              >
                <div ref={mapContainerRef} className="w-full h-full z-0" />
              </motion.div>
            </motion.div>

            {/* Contact Form Column */}
            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="whileInView"
              className="bg-white dark:bg-zinc-900 rounded-xl p-8 border border-gray-100 dark:border-zinc-800 shadow-xl transition-colors"
            >
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="w-6 h-6 text-pink-500" />
                <h2 className="text-2xl font-bold dark:text-white">
                  ส่งข้อความถึงเรา
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-gray-700 dark:text-zinc-300 font-medium text-sm"
                  >
                    ชื่อ-นามสกุล
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="กรอกชื่อของคุณ"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 
                               text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 
                               transition-all placeholder-gray-400 dark:placeholder-zinc-500"
                      required
                    />
                    <User className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-gray-700 dark:text-zinc-300 font-medium text-sm"
                  >
                    อีเมล
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="กรอกอีเมลของคุณ"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 
                               text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 
                               transition-all placeholder-gray-400 dark:placeholder-zinc-500"
                      required
                    />
                    <Mail className="w-5 h-5 text-gray-400 dark:text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-gray-700 dark:text-zinc-300 font-medium text-sm"
                  >
                    หัวข้อ
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="กรอกหัวข้อ"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 
                             text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 
                             transition-all placeholder-gray-400 dark:placeholder-zinc-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-gray-700 dark:text-zinc-300 font-medium text-sm"
                  >
                    ข้อความ
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="พิมพ์ข้อความของคุณที่นี่"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 
                             text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 
                             transition-all resize-none placeholder-gray-400 dark:placeholder-zinc-500"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-lg flex items-center justify-center gap-2 shadow-lg
                           ${
                             isSubmitted
                               ? "bg-green-500 shadow-green-500/20"
                               : "bg-pink-500 shadow-pink-500/30"
                           } 
                           text-white font-bold transition-all`}
                >
                  {isSubmitted ? (
                    <>
                      <Star className="w-5 h-5" />
                      <span>ส่งข้อความสำเร็จ!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>ส่งข้อความ</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Social Contact Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">หรือติดต่อเราโดยตรง</p>
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#06C755] text-white rounded-xl font-semibold hover:bg-[#05B74C] transition-all shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                  แชท LINE
                </a>
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-xl font-semibold hover:bg-[#166FE5] transition-all shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.434 5.503 3.678 7.2V22l3.378-1.854c.9.25 1.855.384 2.944.384 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.068 12.445l-2.547-2.714-4.97 2.714 5.467-5.804 2.609 2.714 4.908-2.714-5.467 5.804z"/></svg>
                  Messenger Facebook
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
