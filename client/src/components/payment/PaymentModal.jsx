import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MessageCircle, QrCode, CheckCircle, Copy, Image as ImageIcon } from "lucide-react";
import bankImage from "../../assets/images/bank.jpg";

const PROMPTPAY_NUMBER = "0963638519";
const LINE_URL = "https://line.me/R/ti/p/@rungroj";
const FACEBOOK_URL = "https://m.me/553199731216723";

const PaymentModal = ({ onClose, reservation, vehicle }) => {
  const totalPrice = reservation?.total_price ?? 0;
  const vehicleName = vehicle?.name ?? "รถเช่า";

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("คัดลอกแล้ว!");
  };

  // PromptPay QR — use promptpay.io service for QR generation
  const promptPayQrUrl = `https://promptpay.io/${PROMPTPAY_NUMBER}/${totalPrice}.png`;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 200 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"><X size={22} /></button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">จองสำเร็จ!</h2>
            <p className="text-gray-600 dark:text-zinc-400 mt-1">กรุณาชำระเงินเพื่อยืนยันการจอง</p>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-zinc-400">รถ</span>
              <span className="font-semibold dark:text-white">{vehicleName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-zinc-400">ยอดรวม</span>
              <span className="text-2xl font-bold text-pink-500">฿{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* PromptPay QR Code */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-500" /> ชำระผ่าน พร้อมเพย์ / ธนาคาร
            </h3>
            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 flex flex-col items-center">
              {/* Bank Image */}
              <div className="w-full mb-4 flex justify-center">
                   <img src={bankImage} alt="Bank Account" className="max-w-full h-auto rounded-lg shadow-sm" style={{ maxHeight: '200px' }} />
              </div>
              
              <div className="w-full border-t border-gray-100 dark:border-zinc-700 my-2"></div>
              
              <img src={promptPayQrUrl} alt="PromptPay QR Code" className="w-48 h-48 rounded-lg mb-3 bg-white p-2" 
                onError={(e) => { e.target.style.display = 'none'; }} />
              
              <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-300">
                <Phone className="w-4 h-4" />
                <span className="font-mono font-semibold">{PROMPTPAY_NUMBER}</span>
                <button onClick={() => copyToClipboard(PROMPTPAY_NUMBER)} className="text-pink-500 hover:text-pink-600"><Copy className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-center text-gray-500 dark:text-zinc-500 mt-2">สแกน QR Code หรือโอนมาที่เลขบัญชีด้านบน</p>
            </div>
          </div>

          {/* Social Contact */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">หรือติดต่อชำระเงินผ่าน</h3>

            <a href={LINE_URL} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#06C755] text-white rounded-xl font-semibold hover:bg-[#05B74C] transition-all shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
              แชท LINE
            </a>

            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-xl font-semibold hover:bg-[#166FE5] transition-all shadow-sm">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.434 5.503 3.678 7.2V22l3.378-1.854c.9.25 1.855.384 2.944.384 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.068 12.445l-2.547-2.714-4.97 2.714 5.467-5.804 2.609 2.714 4.908-2.714-5.467 5.804z"/></svg>
              Messenger Facebook
            </a>

            <div className="flex gap-3 mt-4">
              <a href="tel:0866348619" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all">
                <Phone className="w-4 h-4" /> 086-634-8619
              </a>
              <a href="tel:0963638519" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all">
                <Phone className="w-4 h-4" /> 096-363-8519
              </a>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-900/50">
            <p className="text-sm text-pink-700 dark:text-pink-300">
              <strong>หมายเหตุ:</strong> หลังชำระเงินแล้ว กรุณาแจ้งสลิปผ่าน LINE หรือ Facebook Messenger เพื่อยืนยันการจอง ทางร้านจะตอบกลับภายใน 30 นาที
            </p>
          </div>

          <button onClick={onClose} className="w-full mt-4 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all">
            เข้าใจแล้ว
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;

