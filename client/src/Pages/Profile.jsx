import { useState, useEffect } from "react";
import {
  User, Mail, Phone, Calendar, CheckCircle, Clock,
  Car, ChevronRight, Save, X, LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/store";
import { fetchMyReservations } from "../lib/reservations";
import { useReservationRealtime } from "../hooks/useReservationRealtime";
import { formatThaiDateRange } from "../lib/dateUtils";

const STATUS_MAP = {
  pending: { label: "รอยืนยัน", color: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" },
  active: { label: "กำลังใช้งาน", color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" },
  completed: { label: "เสร็จสิ้น", color: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
  cancelled: { label: "ยกเลิก", color: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400" },
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, logout, myReservations, setReservations } = useAuthStore();
  const reservations = myReservations || [];
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(true);

  // Activate Realtime
  useReservationRealtime();

  // Editable fields
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  // Fetch reservations
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingReservations(true);
      const { data } = await fetchMyReservations();
      if (!cancelled) {
        setReservations(data || []);
        setLoadingReservations(false);
      }
    })();
    return () => { cancelled = true; };
  }, [setReservations]);

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const activeReservations = reservations.filter((r) => ["pending", "confirmed", "active"].includes(r.status));
  // const historyReservations = reservations.filter((r) => ["completed", "cancelled"].includes(r.status));

  const totalSpent = reservations
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + Number(r.total_price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-300 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-3xl font-bold text-pink-600 dark:text-pink-400 border-4 border-white dark:border-zinc-800 shadow-md">
                {profile?.full_name ? profile.full_name[0].toUpperCase() : <User size={32} />}
              </div>
              <div className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full border-2 border-white dark:border-zinc-900">
                <CheckCircle size={12} className="text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold uppercase">ชื่อ-นามสกุล</label>
                    <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-pink-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold uppercase">เบอร์โทร</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-pink-500 outline-none transition" />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{profile?.full_name || "ผู้ใช้งาน"}</h1>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1"><Mail size={16} /> {user?.email}</div>
                    {profile?.phone && <div className="flex items-center gap-1"><Phone size={16} /> {profile.phone}</div>}
                    <div className="flex items-center gap-1"><Calendar size={16} /> สมาชิกตั้งแต่ {new Date(profile?.created_at || user?.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "short" })}</div>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4 md:mt-0 self-start">
              {isEditing ? (
                <>
                  <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition shadow-sm">
                    <Save size={16} /> บันทึก
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition">
                    <X size={16} /> ยกเลิก
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition shadow-sm">
                    แก้ไขโปรไฟล์
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition">
                    <LogOut size={16} /> ออกจากระบบ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
              <h3 className="font-semibold mb-4 text-gray-500 dark:text-zinc-400 text-sm uppercase tracking-wider">สถิติการเช่า</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{reservations.length}</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">การจองทั้งหมด</div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">฿{totalSpent.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">ยอดรวม</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
              <h3 className="font-semibold mb-4 text-gray-500 dark:text-zinc-400 text-sm uppercase tracking-wider">เมนูลัด</h3>
              <div className="space-y-2">
                <button onClick={() => navigate("/models")} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition text-left">
                  <span className="flex items-center gap-2"><Car size={18} className="text-pink-500" /> จองรถ</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
                <button onClick={() => navigate("/contact")} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition text-left">
                  <span className="flex items-center gap-2"><Phone size={18} className="text-pink-500" /> ติดต่อเรา</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-zinc-800">
              {[
                { key: "overview", label: "ภาพรวม" },
                { key: "history", label: "ประวัติทั้งหมด" },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab.key ? "text-pink-500" : "text-gray-500 hover:text-gray-700"}`}>
                  {tab.label}
                  {activeTab === tab.key && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500"></div>}
                </button>
              ))}
            </div>

            {/* Active Rentals */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Car size={20} className="text-pink-500" /> การจองที่กำลังดำเนินการ
                </h3>
                {loadingReservations ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">กำลังโหลด...</p>
                  </div>
                ) : activeReservations.length > 0 ? (
                  activeReservations.map((res) => (
                    <ReservationCard key={res.id} reservation={res} />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm py-4">ไม่มีการจองที่กำลังดำเนินการ</p>
                )}
              </div>
            )}

            {/* History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock size={20} className="text-gray-400" />
                {activeTab === "history" ? "ประวัติทั้งหมด" : "กิจกรรมล่าสุด"}
              </h3>
              {loadingReservations ? (
                <div className="text-sm text-gray-500 py-4">กำลังโหลด...</div>
              ) : (activeTab === "history" ? reservations : reservations.slice(0, 5)).length > 0 ? (
                (activeTab === "history" ? reservations : reservations.slice(0, 5)).map((res) => (
                  <ReservationCard key={res.id} reservation={res} />
                ))
              ) : (
                <p className="text-gray-500 text-sm py-4">ยังไม่มีประวัติการจอง — <button onClick={() => navigate("/models")} className="text-pink-500 underline">เลือกรถเลย!</button></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= Reservation Card ================= */
const ReservationCard = ({ reservation }) => {
  const vehicle = reservation.vehicles;
  const status = STATUS_MAP[reservation.status] || STATUS_MAP.pending;

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow">
      <div className="flex-1 flex justify-between">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-zinc-100">{vehicle?.name || "รถเช่า"}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mt-1">
            <Calendar size={14} />
            <span>
              {formatThaiDateRange(reservation.pickup_date, reservation.dropoff_date)}
            </span>
          </div>
          <p className="text-sm font-semibold mt-2 text-pink-500">
            ฿{Number(reservation.total_price || 0).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-end justify-between">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;

