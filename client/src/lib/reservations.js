import { supabase } from "./supabase";

/** Calculate preview price for UI display (days * price_per_day) */
export function calculatePreviewPrice(pricePerDay, pickupDate, dropoffDate) {
  if (!pickupDate || !dropoffDate || !pricePerDay) return 0;
  
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  const diffTime = Math.abs(dropoff - pickup);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays * pricePerDay;
}

/** Create a new reservation (requires auth) */
export async function createReservation({
  vehicleId,
  pickupDate,
  dropoffDate,
  pickupLocation,
  serviceType = "self_drive",
  notes = "",
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: "กรุณาเข้าสู่ระบบก่อนจอง" } };

  // Note: total_price is calculated automatically by database trigger
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      user_id: user.id,
      vehicle_id: vehicleId,
      pickup_date: pickupDate,
      dropoff_date: dropoffDate,
      pickup_location: pickupLocation,
      service_type: serviceType,
      notes,
      status: "pending",
    })
    .select()
    .single();

  return { data, error };
}

/** Fetch reservations for the current user */
export async function fetchMyReservations() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from("reservations")
    .select("*, vehicles(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error };
}
