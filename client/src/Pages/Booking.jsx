import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchVehicles, fetchVehicleById } from "../lib/vehicles";
import { createReservation, calculatePreviewPrice } from "../lib/reservations";
import useAuthStore from "../store/store";
import PaymentModal from "../components/payment/PaymentModal";

/* ================= Tips Data ================= */
const tips = [
  { text: "ตรวจสอบประเภทเชื้อเพลิงก่อนจอง", icon: "⛽" },
  { text: "รับรถแต่เช้าเพื่อหลีกเลี่ยงการจราจร", icon: "⏰" },
  { text: "ตรวจสภาพรถก่อนออกเดินทาง", icon: "🔍" },
  { text: "ใช้แอปนำทางที่คุณถนัด", icon: "🗺️" },
];

/* ================= Helper ================= */
const excludeActiveCar = (collection, activeId) =>
  collection.filter((item) => item.id !== activeId);
const isValidDateRange = (start, end) => {
  if (!start || !end) return true; // Allow empty dates during selection
  return new Date(start) < new Date(end);
};

// Format date to mm/dd/yyyy format
const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

// Parse mm/dd/yyyy to Date object
const parseDateFromInput = (dateString) => {
  if (!dateString) return null;
  const [month, day, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day);
};

/* ================= Custom Date Input Component ================= */
const DateInput = ({ label, value, onChange, minDate, error, placeholder = "วว/ดด/ปปปป" }) => {
  const [displayValue, setDisplayValue] = useState("");
  
  useEffect(() => {
    if (value) {
      setDisplayValue(formatDateForDisplay(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e) => {
    const input = e.target.value;
    setDisplayValue(input);
    
    // Only validate if we have a complete date
    if (input.length === 10 && input.includes('/')) {
      const date = parseDateFromInput(input);
      if (date && !isNaN(date.getTime())) {
        onChange(date.toISOString());
      }
    } else if (input === "") {
      onChange("");
    }
  };

  const handleBlur = () => {
    if (displayValue && displayValue.includes('/')) {
      const date = parseDateFromInput(displayValue);
      if (date && !isNaN(date.getTime())) {
        // Format it properly
        const formatted = formatDateForDisplay(date.toISOString());
        setDisplayValue(formatted);
        onChange(date.toISOString());
      }
    }
  };

  // Create a date string for the HTML date picker
  const getHTMLDateValue = () => {
    if (!value) return "";
    const date = new Date(value);
    return date.toISOString().split('T')[0];
  };

  const handleHTMLDateChange = (e) => {
    if (e.target.value) {
      const date = new Date(e.target.value);
      onChange(date.toISOString());
    } else {
      onChange("");
    }
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`p-3 bg-white dark:bg-zinc-800 border ${
            error ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' : 'border-gray-200 dark:border-zinc-700'
          } rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all w-full`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <label htmlFor={`${label.replace(/\s+/g, '-')}-native`} className="cursor-pointer">
            <svg className="w-5 h-5 text-gray-400 hover:text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </label>
          <input
            id={`${label.replace(/\s+/g, '-')}-native`}
            type="date"
            value={getHTMLDateValue()}
            onChange={handleHTMLDateChange}
            min={minDate ? new Date(minDate).toISOString().split('T')[0] : undefined}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        รูปแบบ: {placeholder}
      </div>
    </div>
  );
};

/* ================= Map Component ================= */
const BookingMap = ({ location, setLocation }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const mapInstance = useRef(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    mapInstance.current = L.map(mapRef.current, {
      center: [17.3866, 102.7761],
      zoom: 12,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapInstance.current);

    mapInstance.current.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      setMarker(lat, lng);
    });

    return () => mapInstance.current.remove();
  }, []);

  const setMarker = async (lat, lng) => {
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    else {
      markerRef.current = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
      }).addTo(mapInstance.current);
    }
    mapInstance.current.setView([lat, lng], 10, { animate: true });

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`
      );
      const data = await res.json();
      const address = data.address || {};
      const city = address.city || address.town || address.village || "";
      const state = address.state || "";
      setLocation(`${city}, ${state} — Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
    } catch {
      setLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
    }
  };

  const handleSearchChange = async () => {
    const query = searchRef.current.value;
    if (!query) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=en&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setMarker(lat, lon);
    setSuggestions([]);
    searchRef.current.value = item.display_name;
  };

  return (
    <div className="mb-4">
      <div className="relative mb-2">
        <input
          type="text"
          ref={searchRef}
          placeholder="ค้นหาสถานที่..."
          onChange={handleSearchChange}
          className="w-full p-3 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-zinc-800 placeholder-gray-400 dark:placeholder-zinc-500 outline-none focus:ring-2 focus:ring-pink-500"
        />
        {suggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-b-lg max-h-40 overflow-auto shadow-lg z-[9999]"
          >
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                className="p-3 hover:bg-pink-500 hover:text-white cursor-pointer transition border-b border-gray-100 dark:border-zinc-700 last:border-b-0"
                onClick={() => handleSelectSuggestion(s)}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        ref={mapRef}
        className="w-full rounded-lg shadow-md border border-gray-300 dark:border-zinc-700"
        style={{ height: "300px" }}
      ></div>

      <textarea
        value={location}
        readOnly
        placeholder="สถานที่ที่เลือกจะแสดงที่นี่"
        className="mt-3 p-3 border border-gray-300 dark:border-zinc-700 rounded-lg w-full text-gray-900 dark:text-white bg-white dark:bg-zinc-800 placeholder-gray-400 dark:placeholder-zinc-500 resize-none overflow-auto focus:ring-2 focus:ring-pink-500"
        rows={2}
      />
    </div>
  );
};

/* ================= Main Component ================= */
const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [selectedCar, setSelectedCar] = useState(null);
  const [allCars, setAllCars] = useState([]);
  const [rentalDetails, setRentalDetails] = useState({
    pickUpDate: "",
    dropOffDate: "",
    location: "",
    branch: "", // สาขาที่เลือก
  });
  const [dateError, setDateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [reservation, setReservation] = useState(null);

  // ข้อมูลสาขา
  const branches = [
    { id: "main", name: "สาขาหลัก — รถเช่าอุดรฯ", location: "17.386613, 102.776114", address: "อุดรธานี" },
    { id: "airport", name: "สนามบินอุดรธานี", location: "17.386613, 102.776114", address: "ต.หมากแข้ง อ.เมือง จ.อุดรธานี 41000" },
    { id: "custom", name: "อื่นๆ (เลือกบนแผนที่)", location: null, address: null },
  ];

  /* Fetch vehicle from Supabase */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchVehicleById(id);
      if (!cancelled && data) setSelectedCar(data);
    })();
    return () => { cancelled = true; };
  }, [id]);

  /* Fetch all vehicles for "related cars" section */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await fetchVehicles();
      if (!cancelled) setAllCars(data);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDateChange = (name, value) => {
    const updatedDetails = { ...rentalDetails, [name]: value };
    setRentalDetails(updatedDetails);

    // Validate dates
    if (updatedDetails.pickUpDate && updatedDetails.dropOffDate) {
      const pickUp = new Date(updatedDetails.pickUpDate);
      const dropOff = new Date(updatedDetails.dropOffDate);
      
      if (dropOff <= pickUp) {
        setDateError("❌ วันคืนรถต้องหลังวันรับรถ");
      } else if ((dropOff - pickUp) < 86400000) { // Less than 1 day (24 hours)
        setDateError("❌ ระยะเวลาเช่าขั้นต่ำ 1 วัน");
      } else {
        setDateError("");
      }
    } else {
      setDateError(""); // Clear error if one date is empty
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "pickUpDate" || name === "dropOffDate") {
      handleDateChange(name, value);
    } else {
      setRentalDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates before submission
    if (!isValidDateRange(rentalDetails.pickUpDate, rentalDetails.dropOffDate)) {
      setDateError("❌ วันคืนรถต้องหลังวันรับรถ");
      return;
    }

    if (!rentalDetails.location) {
      alert("⚠️ กรุณาเลือกสถานที่บนแผนที่!");
      return;
    }

    if (dateError) {
      return; // Don't proceed if there's an error
    }

    // Lazy auth check — redirect to login if not logged in
    if (!user) {
      if (confirm("กรุณาเข้าสู่ระบบก่อนยืนยันการจอง\nต้องการไปที่หน้าเข้าสู่ระบบหรือไม่?")) {
        // Redirect with intentions
        navigate("/login", { 
          state: { 
            redirectTo: `/booking/${id}`,
            savedState: rentalDetails 
          } 
        });
      }
      return;
    }

    setIsSubmitting(true);
    
    // Calculate preview price for UI (DB will calculate real price)
    const previewPrice = calculatePreviewPrice(selectedCar.price, rentalDetails.pickUpDate, rentalDetails.dropOffDate);
    
    // Create reservation in Supabase
    const { data: resData, error } = await createReservation({
      vehicleId: selectedCar.id,
      pickupDate: rentalDetails.pickUpDate,
      dropoffDate: rentalDetails.dropOffDate,
      pickupLocation: rentalDetails.location,
      // No total_price sent here as per new rules
    });

    setIsSubmitting(false);

    if (error) {
      if (error.code === "OVERLAP") {
        setDateError(error.message);
        alert(error.message);
      } else {
        alert(`❌ เกิดข้อผิดพลาด: ${error.message || "ไม่สามารถจองได้"}`);
      }
      return;
    }

    // Show payment modal with data from DB (which includes calculated price)
    // Fallback to previewPrice if trigger hasn't fired yet or returned plain data
    setReservation({ 
      ...resData, 
      total_price: resData.total_price || previewPrice,
      vehicles: selectedCar // Pass vehicle object for modal display
    });
    setShowPayment(true);
  };

  const getMinDropOffDate = () => {
    if (!rentalDetails.pickUpDate) return "";
    const pickUpDate = new Date(rentalDetails.pickUpDate);
    // Add minimum 1 day gap for drop-off
    pickUpDate.setDate(pickUpDate.getDate() + 1);
    return pickUpDate.toISOString();
  };

  const isFormValid = () => {
    const hasValidLocation = rentalDetails.branch === "custom" 
      ? rentalDetails.location  // ถ้าเลือก "อื่นๆ" ต้องเลือกที่บนแผนที่
      : rentalDetails.branch;   // ถ้าเลือกสาขา ถือว่ามี location แล้ว
    
    return rentalDetails.pickUpDate && 
           rentalDetails.dropOffDate && 
           hasValidLocation && 
           !dateError;
  };

  const relatedCars = selectedCar
    ? excludeActiveCar(allCars, selectedCar.id)
    : [];

  return selectedCar ? (
    <div className="container mx-auto p-6 pt-28 transition-colors duration-300">
      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          onClose={() => {
            setShowPayment(false);
            setRentalDetails({ pickUpDate: "", dropOffDate: "", location: "", branch: "" });
            setDateError("");
          }}
          reservation={reservation}
          vehicle={selectedCar}
        />
      )}
      <div className="flex flex-col md:flex-row md:space-x-10">
        {/* Left: Car Image */}
        <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
          <img
            src={selectedCar.image}
            alt={selectedCar.name}
            className="w-full max-w-xl h-80 object-cover rounded-2xl shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:brightness-105 transition-all duration-500"
          />
        </div>

        {/* Right: Form + Map */}
        <div className="w-full md:w-1/2 bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl p-8 transition-colors">
          <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">{selectedCar.name}</h2>
          <p className="text-xl text-gray-600 dark:text-zinc-400 mb-4">
            {selectedCar.category} —{" "}
            <span className="text-pink-500 font-bold">฿{selectedCar.price}/วัน</span>
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-semibold text-gray-500 dark:text-zinc-400">{selectedCar.rating}</span>
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, idx) => (
                  <svg
                    key={idx}
                    xmlns="http://www.w3.org/2000/svg"
                    fill={idx < Math.floor(selectedCar.rating) ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 17.25l-6.403 3.377 1.233-7.264L1.43 7.642l7.361-.734L12 1.5l3.522 5.377 7.361.734-5.733 5.721 1.233 7.264L12 17.25z"
                    />
                  </svg>
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500 dark:text-zinc-500">({selectedCar.reviews} รีวิว)</span>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition">
              <div className="text-2xl mb-2">🪑</div>
              <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{selectedCar.features.seats} ที่นั่ง</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition">
              <div className="text-2xl mb-2">🧳</div>
              <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{selectedCar.features.luggage} กระเป๋า</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition">
              <div className="text-2xl mb-2">⛽</div>
              <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{selectedCar.features.fuel} เชื้อเพลิง</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DateInput
                label="วันรับรถ"
                value={rentalDetails.pickUpDate}
                onChange={(value) => handleDateChange("pickUpDate", value)}
                minDate={new Date().toISOString()}
                placeholder="วว/ดด/ปปปป"
              />
              <DateInput
                label="วันคืนรถ"
                value={rentalDetails.dropOffDate}
                onChange={(value) => handleDateChange("dropOffDate", value)}
                minDate={getMinDropOffDate()}
                error={dateError}
                placeholder="วว/ดด/ปปปป"
              />
            </div>

            {/* Date Error Message - More Prominent */}
            {dateError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-r-lg animate-pulse">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-red-700 dark:text-red-300">เลือกวันที่ไม่ถูกต้อง</h4>
                    <p className="text-red-600 dark:text-red-400 mt-1">{dateError}</p>
                    <p className="text-sm text-red-500 dark:text-red-400/80 mt-2">
                      กรุณาเลือกวันคืนรถที่อยู่หลังวันรับรถ (ขั้นต่ำ 1 วัน)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* สถานที่รับ-คืนรถ */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                สถานที่รับ-คืนรถเช่า
              </label>
              <div className="grid grid-cols-1 gap-3">
                {branches.map((branch) => (
                  <label
                    key={branch.id}
                    className={`relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      rentalDetails.branch === branch.id
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-md'
                        : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-pink-300 dark:hover:border-pink-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="branch"
                      value={branch.id}
                      checked={rentalDetails.branch === branch.id}
                      onChange={(e) => {
                        const newBranch = e.target.value;
                        const selectedBranch = branches.find(b => b.id === newBranch);
                        setRentalDetails({
                          ...rentalDetails,
                          branch: newBranch,
                          location: selectedBranch?.location || rentalDetails.location,
                        });
                      }}
                      className="mt-1 w-4 h-4 text-pink-500 focus:ring-pink-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📍</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {branch.name}
                        </span>
                      </div>
                      {branch.address && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                          {branch.address}
                        </p>
                      )}
                    </div>
                    {rentalDetails.branch === branch.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* แผนที่ - แสดงเฉพาะเมื่อเลือก "อื่นๆ" */}
            {rentalDetails.branch === "custom" && (
              <BookingMap
                location={rentalDetails.location}
                setLocation={(loc) =>
                  setRentalDetails({ ...rentalDetails, location: loc })
                }
              />
            )}

            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`mt-2 w-full py-4 font-bold rounded-xl shadow-lg transition-all transform ${
                isFormValid() && !isSubmitting
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-pink-500/30 hover:shadow-pink-500/50 active:scale-[0.98] text-white'
                  : 'bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังดำเนินการจอง...
                </div>
              ) : (
                isFormValid() ? '🚗 ยืนยันการจอง' : 'กรอกข้อมูลให้ครบเพื่อจอง'
              )}
            </button>

            {/* Validation Summary */}
            <div className="mt-4 space-y-3 text-sm">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${rentalDetails.pickUpDate ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${rentalDetails.pickUpDate ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-zinc-700'}`}>
                  {rentalDetails.pickUpDate ? '✓' : '○'}
                </div>
                <span>วันรับรถ: {rentalDetails.pickUpDate ? formatDateForDisplay(rentalDetails.pickUpDate) : 'ยังไม่เลือก'}</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${rentalDetails.dropOffDate && !dateError ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${rentalDetails.dropOffDate && !dateError ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-zinc-700'}`}>
                  {rentalDetails.dropOffDate && !dateError ? '✓' : '○'}
                </div>
                <span>วันคืนรถ: {rentalDetails.dropOffDate ? formatDateForDisplay(rentalDetails.dropOffDate) : 'ยังไม่เลือก'} {dateError && <span className="text-red-500">- ไม่ถูกต้อง</span>}</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                (rentalDetails.branch && rentalDetails.branch !== 'custom') || (rentalDetails.branch === 'custom' && rentalDetails.location)
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  (rentalDetails.branch && rentalDetails.branch !== 'custom') || (rentalDetails.branch === 'custom' && rentalDetails.location)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-zinc-700'
                }`}>
                  {(rentalDetails.branch && rentalDetails.branch !== 'custom') || (rentalDetails.branch === 'custom' && rentalDetails.location) ? '✓' : '○'}
                </div>
                <span>สถานที่: {
                  rentalDetails.branch
                    ? rentalDetails.branch === 'custom'
                      ? rentalDetails.location ? 'เลือกบนแผนที่แล้ว' : 'กรุณาเลือกบนแผนที่'
                      : branches.find(b => b.id === rentalDetails.branch)?.name
                    : 'ยังไม่เลือก'
                }</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* More Cars */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">รถอื่นที่คุณอาจชอบ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedCars.map((car) => (
            <div
              key={car.id}
              onClick={() => navigate(`/booking/${car.id}`)}
              className="group p-5 rounded-xl bg-white dark:bg-zinc-900 shadow-lg hover:shadow-2xl hover:scale-[1.02] cursor-pointer transition-all duration-300 border border-gray-100 dark:border-zinc-800"
            >
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-40 object-cover rounded-lg mb-4 group-hover:brightness-110 transition"
              />
              <h4 className="font-semibold text-gray-800 dark:text-white">{car.name}</h4>
              <p className="text-sm text-gray-500 dark:text-zinc-400">{car.category}</p>
              <p className="mt-2 font-bold text-pink-500">฿{car.price}/วัน</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">เคล็ดลับการเช่ารถ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-zinc-800 dark:to-zinc-900 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-100 dark:border-zinc-700 flex flex-col items-center justify-center text-center"
            >
              <div className="text-3xl mb-3">{tip.icon}</div>
              <p className="text-gray-700 dark:text-zinc-200 font-medium">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-zinc-400">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg">กำลังโหลดข้อมูลรถ...</p>
      </div>
    </div>
  );
};

export default CarDetailPage;
