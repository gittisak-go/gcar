import { supabase } from "./supabase";

/* =====================================================
   Default images — used when image_url is null in DB
===================================================== */
const DEFAULT_IMAGES = {
  "Toyota Yaris Ativ": "https://img.thaibizpost.com/uploads/2023-01/new-toyota-yaris-ativ-2023.jpg",
  "Honda City": "https://www.honda.co.th/assets/images/city/exterior/exterior-1.jpg",
  "Toyota Fortuner": "https://www.toyota.co.th/media/product/series/thumbnail/fortuner.png",
  "Toyota Hilux Revo": "https://www.toyota.co.th/media/product/series/thumbnail/hilux-revo.png",
  "Honda HR-V": "https://www.honda.co.th/assets/images/hrv/exterior/exterior-1.jpg",
  "Nissan Almera": "https://www-asia.nissan-cdn.net/content/dam/Nissan/th/vehicles/almera/2023/overview/almera-overview-hero.jpg",
  "MG ZS EV": "https://www.mgcars.com/uploads/model/mg-zs-ev/exterior.jpg",
  "Isuzu D-Max": "https://www.isuzu-tis.com/storage/products/d-max/gallery/exterior-1.jpg",
};

/* =====================================================
   Hardcoded fallback — if Supabase returns nothing
===================================================== */
const FALLBACK_VEHICLES = [
  { id: "fb-1", name: "Toyota Yaris Ativ", category: "เก๋ง", price_per_day: 899, seats: 5, fuel_type: "เบนซิน", rating: 4.9, features: { luggage: 3 }, status: "available" },
  { id: "fb-2", name: "Honda City", category: "เก๋ง", price_per_day: 999, seats: 5, fuel_type: "เบนซิน", rating: 4.8, features: { luggage: 4 }, status: "available" },
  { id: "fb-3", name: "Toyota Fortuner", category: "SUV", price_per_day: 2500, seats: 7, fuel_type: "ดีเซล", rating: 4.9, features: { luggage: 5 }, status: "available" },
  { id: "fb-4", name: "Toyota Hilux Revo", category: "กระบะ", price_per_day: 1500, seats: 5, fuel_type: "ดีเซล", rating: 4.7, features: { luggage: 6 }, status: "available" },
  { id: "fb-5", name: "Honda HR-V", category: "อีโค", price_per_day: 1800, seats: 5, fuel_type: "ไฮบริด", rating: 4.8, features: { luggage: 4 }, status: "available" },
  { id: "fb-6", name: "Nissan Almera", category: "เก๋ง", price_per_day: 800, seats: 5, fuel_type: "เบนซิน", rating: 4.6, features: { luggage: 3 }, status: "available" },
  { id: "fb-7", name: "MG ZS EV", category: "อีโค", price_per_day: 2200, seats: 5, fuel_type: "ไฟฟ้า", rating: 4.7, features: { luggage: 4 }, status: "available" },
  { id: "fb-8", name: "Isuzu D-Max", category: "กระบะ", price_per_day: 1400, seats: 5, fuel_type: "ดีเซล", rating: 4.8, features: { luggage: 6 }, status: "available" },
];

/* =====================================================
   Normalize — maps Supabase row → UI-friendly shape
===================================================== */
export function normalizeVehicle(v) {
  return {
    id: v.id,
    name: v.name,
    category: v.category,
    price: Number(v.price_per_day),
    image: v.image_url || DEFAULT_IMAGES[v.name] || "https://placehold.co/600x400?text=Car",
    rating: Number(v.rating) || 0,
    status: v.status,
    features: {
      seats: String(v.seats ?? 5),
      luggage: String(v.features?.luggage ?? 0),
      fuel: v.fuel_type || "เบนซิน",
    },
  };
}

/* =====================================================
   Queries
===================================================== */

/** Fetch all available vehicles (public — no auth needed) */
export async function fetchVehicles() {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    // fallback to hardcoded data
    return { data: FALLBACK_VEHICLES.map(normalizeVehicle), error: null };
  }
  return { data: data.map(normalizeVehicle), error };
}

/** Fetch single vehicle by id */
export async function fetchVehicleById(id) {
  // Try Supabase first
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    // Try fallback by id string match
    const fb = FALLBACK_VEHICLES.find((v) => v.id === id);
    if (fb) return { data: normalizeVehicle(fb), error: null };
    return { data: null, error };
  }
  return { data: normalizeVehicle(data), error };
}

/** Filter vehicles by category */
export async function fetchVehiclesByCategory(category) {
  let q = supabase.from("vehicles").select("*").eq("status", "available");
  if (category && category !== "ทั้งหมด" && category !== "All") {
    q = q.eq("category", category);
  }
  const { data, error } = await q.order("price_per_day", { ascending: true });
  if (error || !data || data.length === 0) {
    let fallback = FALLBACK_VEHICLES;
    if (category && category !== "ทั้งหมด" && category !== "All") {
      fallback = fallback.filter((v) => v.category === category);
    }
    return { data: fallback.map(normalizeVehicle), error: null };
  }
  return { data: data.map(normalizeVehicle), error };
}
