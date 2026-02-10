import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/store";
import { supabase } from "../lib/supabase";
import { Loader2, Check, X, Car, Edit, Save, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useAdminReservationsRealtime } from "../hooks/useAdminReservationsRealtime";

const AdminDashboard = () => {
  const { user, profile, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  // Data State
  const [reservations, setReservations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState('reservations'); // 'reservations' | 'vehicles'
  const [editingVehicle, setEditingVehicle] = useState(null); // Vehicle being edited
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Subscribe to updates
  useAdminReservationsRealtime((payload) => {
    if (payload.eventType === 'INSERT') {
      fetchReservations(); // New booking came in
    } else if (payload.eventType === 'UPDATE') {
      setReservations(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
    }
  });

  // Check access & Fetch Initial Data
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/login");
      } else if (profile && profile.role !== "super_admin" && profile.role !== "staff") {
        navigate("/"); // Kick user out if not admin
      } else {
        fetchReservations();
        fetchVehicles();
      }
    }
  }, [user, profile, isLoading, navigate]);

  const fetchReservations = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          vehicles ( brand, model, image_url ),
          profiles ( full_name, email, phone_number )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!confirm("ยืนยันการเปลี่ยนสถานะ?")) return;
    
    const { error } = await supabase
      .from("reservations")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) fetchReservations();
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle({ ...vehicle });
    setIsEditModalOpen(true);
  };

  const saveVehicle = async (e) => {
    e.preventDefault();
    if (!editingVehicle) return;

    try {
      const { error } = await supabase
        .from("vehicles")
        .update({
          price_per_day: editingVehicle.price_per_day,
          image_url: editingVehicle.image_url
        })
        .eq("id", editingVehicle.id);

      if (error) throw error;

      alert("บันทึกข้อมูลรถเรียบร้อยแล้ว");
      setIsEditModalOpen(false);
      fetchVehicles();
    } catch (err) {
      console.error("Error updating vehicle:", err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  if (isLoading || (user && !profile)) return <div className="min-h-screen pt-24 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 dark:bg-zinc-900">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ระบบจัดการหลังบ้าน</h1>
            <p className="text-gray-500 dark:text-gray-400">ภาพรวมการจองและจัดการรถ</p>
          </div>
          <button 
            onClick={() => { fetchReservations(); fetchVehicles(); }}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            รีโหลดข้อมูล
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-zinc-700">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'reservations' 
                ? 'text-pink-600 border-b-2 border-pink-600' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            รายการจอง ({reservations.length})
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'vehicles' 
                ? 'text-pink-600 border-b-2 border-pink-600' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            จัดการรถเช่า ({vehicles.length})
          </button>
        </div>

        {/* Reservations View */}
        {activeTab === 'reservations' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="การจองทั้งหมด" value={reservations.length} color="bg-blue-500" />
              <StatCard label="รอดำเนินการ" value={reservations.filter(r => r.status === 'pending').length} color="bg-yellow-500" />
              <StatCard label="ยืนยันแล้ว" value={reservations.filter(r => r.status === 'confirmed').length} color="bg-green-500" />
              <StatCard label="รายได้รวม (บาท)" value={reservations.reduce((acc, curr) => acc + (curr.total_price || 0), 0).toLocaleString()} color="bg-purple-500" />
            </div>

            {/* Reservations Table */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-zinc-700">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">เลขที่จอง</th>
                      <th className="px-6 py-4 font-semibold">ลูกค้า</th>
                      <th className="px-6 py-4 font-semibold">รถที่เช่า</th>
                      <th className="px-6 py-4 font-semibold">วันที่จอง</th>
                      <th className="px-6 py-4 font-semibold">ยอดรวม</th>
                      <th className="px-6 py-4 font-semibold">สถานะ</th>
                      <th className="px-6 py-4 font-semibold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                    {loadingData ? (
                      <tr><td colSpan="7" className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                    ) : reservations.length === 0 ? (
                      <tr><td colSpan="7" className="p-8 text-center text-gray-500">ไม่มีการจองในขณะนี้</td></tr>
                    ) : (
                      reservations.map((res) => (
                        <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
                          <td className="px-6 py-4 font-mono text-gray-500">#{res.id.slice(0, 8)}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 dark:text-white">{res.profiles?.full_name || "ไม่ระบุชื่อ"}</div>
                            <div className="text-xs text-gray-500">{res.profiles?.phone_number}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={res.vehicles?.image_url} alt="car" className="w-10 h-10 object-cover rounded-md bg-gray-200" />
                              <span className="dark:text-white">{res.vehicles?.brand} {res.vehicles?.model}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                            <div>{format(new Date(res.start_date), "dd/MM/yyyy", { locale: th })}</div>
                            <div className="text-xs text-gray-400">ถึง {format(new Date(res.end_date), "dd/MM/yyyy", { locale: th })}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-pink-600">฿{res.total_price?.toLocaleString()}</td>
                          <td className="px-6 py-4">
                           <StatusBadge status={res.status} />
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 text-xs"
                              value={res.status}
                              onChange={(e) => updateStatus(res.id, e.target.value)}
                            >
                              <option value="pending">รอตรวจสอบ</option>
                              <option value="confirmed">ยืนยันแล้ว</option>
                              <option value="cancelled">ยกเลิก</option>
                              <option value="completed">คืนรถแล้ว</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Vehicles Management View */}
        {activeTab === 'vehicles' && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-zinc-700">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-200 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">ID</th>
                      <th className="px-6 py-4 font-semibold">ภาพรถ</th>
                      <th className="px-6 py-4 font-semibold">ยี่ห้อ / รุ่น</th>
                      <th className="px-6 py-4 font-semibold">ประเภท</th>
                      <th className="px-6 py-4 font-semibold">ราคาต่อวัน</th>
                      <th className="px-6 py-4 font-semibold">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                    {vehicles.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-500">ไม่พบรถในระบบ</td></tr>
                    ) : (
                      vehicles.map((car) => (
                        <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
                          <td className="px-6 py-4 font-mono text-gray-500">#{car.id}</td>
                          <td className="px-6 py-4">
                            <img src={car.image_url} alt={car.model} className="w-16 h-10 object-cover rounded bg-gray-200" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 dark:text-white">{car.brand} {car.model}</div>
                            <div className="text-xs text-gray-500">{car.year}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-400 capitalize">{car.type}</td>
                          <td className="px-6 py-4 font-medium text-green-600 text-base">฿{car.price_per_day?.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleEditVehicle(car)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Edit className="w-3 h-3" /> แก้ไข
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Vehicle Modal */}
        {isEditModalOpen && editingVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
               <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
                
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">แก้ไขข้อมูลรถ</h3>
                <div className="mb-6">
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-zinc-700 rounded text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {editingVehicle.brand} {editingVehicle.model}
                  </span>
                </div>

                <form onSubmit={saveVehicle} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ราคาต่อวัน (บาท)
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      value={editingVehicle.price_per_day}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, price_per_day: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ลิ้งค์รูปภาพ (URL)
                    </label>
                    <div className="flex gap-2">
                       <input 
                        type="text" 
                        value={editingVehicle.image_url}
                        onChange={(e) => setEditingVehicle({ ...editingVehicle, image_url: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none text-sm font-mono"
                      />
                    </div>
                    {editingVehicle.image_url && (
                      <div className="mt-2 text-center text-xs text-gray-500">
                         <img src={editingVehicle.image_url} alt="Preview" className="h-24 mx-auto object-contain rounded border border-gray-200 dark:border-zinc-700" />
                         <p className="mt-1">ตัวอย่างรูปภาพ</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button 
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> บันทึก
                    </button>
                  </div>
                </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow border border-gray-100 dark:border-zinc-700 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
    </div>
    <div className={`w-2 h-12 rounded-full ${color}`}></div>
  </div>
);

export default AdminDashboard;

