// Thai Date Utilities

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

const THAI_DAYS = [
  "วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"
];

const THAI_DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

/**
 * แปลงวันที่เป็นรูปแบบภาษาไทยแบบเต็ม
 * @param {Date|string} date - วันที่ที่ต้องการแปลง
 * @param {boolean} useBuddhistYear - ใช้พุทธศักราชหรือไม่ (default: true)
 * @returns {string} - วันที่ในรูปแบบ "15 กุมภาพันธ์ 2569"
 */
export const formatThaiDate = (date, useBuddhistYear = true) => {
  if (!date) return "";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  
  const day = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const year = useBuddhistYear ? d.getFullYear() + 543 : d.getFullYear();
  
  return `${day} ${month} ${year}`;
};

/**
 * แปลงวันที่เป็นรูปแบบภาษาไทยแบบสั้น
 * @param {Date|string} date - วันที่ที่ต้องการแปลง
 * @param {boolean} useBuddhistYear - ใช้พุทธศักราชหรือไม่ (default: true)
 * @returns {string} - วันที่ในรูปแบบ "15 ก.พ. 69"
 */
export const formatThaiDateShort = (date, useBuddhistYear = true) => {
  if (!date) return "";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  
  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()];
  const year = useBuddhistYear ? (d.getFullYear() + 543) % 100 : d.getFullYear() % 100;
  
  return `${day} ${month} ${String(year).padStart(2, '0')}`;
};

/**
 * แปลงวันที่เป็นรูปแบบภาษาไทยพร้อมวัน
 * @param {Date|string} date - วันที่ที่ต้องการแปลง
 * @param {boolean} useBuddhistYear - ใช้พุทธศักราชหรือไม่ (default: true)
 * @param {boolean} shortDay - ใช้ชื่อวันแบบสั้นหรือไม่ (default: false)
 * @returns {string} - วันที่ในรูปแบบ "วันศุกร์ที่ 15 กุมภาพันธ์ 2569"
 */
export const formatThaiDateWithDay = (date, useBuddhistYear = true, shortDay = false) => {
  if (!date) return "";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  
  const dayName = shortDay ? THAI_DAYS_SHORT[d.getDay()] : THAI_DAYS[d.getDay()];
  const day = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const year = useBuddhistYear ? d.getFullYear() + 543 : d.getFullYear();
  
  return `${dayName}ที่ ${day} ${month} ${year}`;
};

/**
 * แปลงวันที่เป็นรูปแบบสำหรับแสดงช่วงวันที่
 * @param {Date|string} startDate - วันที่เริ่มต้น
 * @param {Date|string} endDate - วันที่สิ้นสุด
 * @param {boolean} useBuddhistYear - ใช้พุทธศักราชหรือไม่ (default: true)
 * @returns {string} - วันที่ในรูปแบบ "15 ก.พ. - 20 ก.พ. 2569"
 */
export const formatThaiDateRange = (startDate, endDate, useBuddhistYear = true) => {
  if (!startDate || !endDate) return "";
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
  
  const startDay = start.getDate();
  const startMonth = THAI_MONTHS_SHORT[start.getMonth()];
  const endDay = end.getDate();
  const endMonth = THAI_MONTHS_SHORT[end.getMonth()];
  const year = useBuddhistYear ? end.getFullYear() + 543 : end.getFullYear();
  
  // ถ้าเดือนเดียวกัน
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${startDay} - ${endDay} ${endMonth} ${year}`;
  }
  
  // ถ้าคนละเดือน
  const startYear = useBuddhistYear ? start.getFullYear() + 543 : start.getFullYear();
  if (start.getFullYear() === end.getFullYear()) {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
  }
  
  // ถ้าคนละปี
  return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${year}`;
};

/**
 * คำนวณจำนวนวันระหว่างสองวันที่
 * @param {Date|string} startDate - วันที่เริ่มต้น
 * @param {Date|string} endDate - วันที่สิ้นสุด
 * @returns {number} - จำนวนวัน
 */
export const calculateDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * แปลงเวลาเป็นรูปแบบภาษาไทย
 * @param {Date|string} date - วันที่และเวลา
 * @returns {string} - เวลาในรูปแบบ "14:30 น."
 */
export const formatThaiTime = (date) => {
  if (!date) return "";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes} น.`;
};

/**
 * แปลงวันที่และเวลาเป็นรูปแบบภาษาไทยแบบเต็ม
 * @param {Date|string} date - วันที่และเวลา
 * @param {boolean} useBuddhistYear - ใช้พุทธศักราชหรือไม่ (default: true)
 * @returns {string} - วันที่และเวลาในรูปแบบ "15 กุมภาพันธ์ 2569 เวลา 14:30 น."
 */
export const formatThaiDateTime = (date, useBuddhistYear = true) => {
  if (!date) return "";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  
  const thaiDate = formatThaiDate(d, useBuddhistYear);
  const thaiTime = formatThaiTime(d);
  
  return `${thaiDate} เวลา ${thaiTime}`;
};
