-- ============================================
-- 🚗 รถเช่าอุดรธานี รุ่งโรจน์ คาร์เร้นท์
-- Database Schema V2: แยก car_models และ vehicles
-- 15 รุ่น × 5 คัน = 75 คัน
-- ============================================
-- วิธีใช้:
-- 1. ไปที่ https://supabase.com/dashboard/project/lpaqjhrjuokvhsdegynn/sql/new
-- 2. Copy ทั้งหมดและ Paste ใน SQL Editor
-- 3. กด "Run" (Ctrl+Enter)
-- ============================================

-- ============================================
-- 1. DROP EXISTING TABLES (ถ้ามี)
-- ============================================
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.car_models CASCADE;

-- ============================================
-- 2. CREATE TABLE: car_models (รุ่นรถ)
-- ============================================
CREATE TABLE public.car_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- ชื่อรุ่น เช่น "City Turbo"
  brand TEXT, -- ยี่ห้อ เช่น "Honda"
  category TEXT NOT NULL, -- ประเภท: เก๋ง, SUV, MPV, กระบะ
  price_per_day NUMERIC(10,2) NOT NULL, -- ราคามาตรฐาน/วัน
  seats INTEGER DEFAULT 5,
  fuel_type TEXT, -- เบนซิน, ดีเซล, ไฮบริด, ไฟฟ้า
  transmission TEXT DEFAULT 'Automatic', -- Auto/Manual
  image_url TEXT,
  features JSONB DEFAULT '{}', -- คุณสมบัติเพิ่มเติม
  description TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. CREATE TABLE: vehicles (คันรถจริง)
-- ============================================
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES public.car_models(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL, -- หมายเลขคัน เช่น "#1", "#2"
  license_plate TEXT, -- ทะเบียนรถ เช่น "กข-1234 อด"
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'retired')),
  mileage INTEGER DEFAULT 0, -- ไมล์สะสม (km)
  last_service_date DATE, -- วันที่เซอร์วิสล่าสุด
  notes TEXT, -- หมายเหตุ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(model_id, vehicle_number) -- ป้องกันหมายเลขซ้ำในรุ่นเดียวกัน
);

-- ============================================
-- 4. CREATE TABLE: reservations (การจอง)
-- ============================================
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  pickup_date DATE NOT NULL,
  dropoff_date DATE NOT NULL,
  location TEXT,
  total_price NUMERIC(10,2), -- คำนวณอัตโนมัติจากทริกเกอร์
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (dropoff_date > pickup_date) -- ต้องคืนหลังรับ
);

-- ============================================
-- 5. CREATE INDEXES
-- ============================================
CREATE INDEX idx_car_models_category ON public.car_models(category);
CREATE INDEX idx_car_models_price ON public.car_models(price_per_day);

CREATE INDEX idx_vehicles_model_id ON public.vehicles(model_id);
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_license ON public.vehicles(license_plate);

CREATE INDEX idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX idx_reservations_vehicle_id ON public.reservations(vehicle_id);
CREATE INDEX idx_reservations_dates ON public.reservations(pickup_date, dropoff_date);
CREATE INDEX idx_reservations_status ON public.reservations(status);

-- ============================================
-- 6. CREATE FUNCTION: อัปเดต updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. CREATE TRIGGERS: updated_at
-- ============================================
CREATE TRIGGER trg_car_models_updated_at
  BEFORE UPDATE ON public.car_models
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- 8. CREATE FUNCTION: คำนวณราคาอัตโนมัติ
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_reservation_total()
RETURNS TRIGGER AS $$
DECLARE
  daily_rate NUMERIC(10,2);
  num_days INTEGER;
BEGIN
  -- ดึงราคา/วันจาก car_models ผ่าน vehicles
  SELECT cm.price_per_day INTO daily_rate
  FROM public.car_models cm
  JOIN public.vehicles v ON v.model_id = cm.id
  WHERE v.id = NEW.vehicle_id;

  -- คำนวณจำนวนวัน
  num_days := NEW.dropoff_date - NEW.pickup_date;

  -- คำนวณราคารวม
  NEW.total_price := daily_rate * num_days;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_reservation_total
  BEFORE INSERT OR UPDATE OF pickup_date, dropoff_date, vehicle_id
  ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.calculate_reservation_total();

-- ============================================
-- 9. CREATE FUNCTION: ตรวจสอบการจองซ้ำ
-- ============================================
CREATE OR REPLACE FUNCTION public.check_vehicle_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- ตรวจสอบว่ามีการจองที่ทับซ้อนหรือไม่
  IF EXISTS (
    SELECT 1 FROM public.reservations
    WHERE vehicle_id = NEW.vehicle_id
      AND status IN ('pending', 'confirmed')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
      AND (
        (NEW.pickup_date, NEW.dropoff_date) OVERLAPS (pickup_date, dropoff_date)
      )
  ) THEN
    RAISE EXCEPTION 'รถคันนี้ถูกจองไปแล้วในช่วงเวลาดังกล่าว';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_vehicle_availability
  BEFORE INSERT OR UPDATE OF pickup_date, dropoff_date, vehicle_id
  ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.check_vehicle_availability();

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policies for car_models (ทุกคนอ่านได้, staff แก้ไขได้)
DROP POLICY IF EXISTS "car_models_select_all" ON public.car_models;
CREATE POLICY "car_models_select_all" ON public.car_models FOR SELECT USING (true);

DROP POLICY IF EXISTS "car_models_modify_staff" ON public.car_models;
CREATE POLICY "car_models_modify_staff" ON public.car_models
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

-- Policies for vehicles (ทุกคนอ่านได้, staff แก้ไขได้)
DROP POLICY IF EXISTS "vehicles_select_all" ON public.vehicles;
CREATE POLICY "vehicles_select_all" ON public.vehicles FOR SELECT USING (true);

DROP POLICY IF EXISTS "vehicles_modify_staff" ON public.vehicles;
CREATE POLICY "vehicles_modify_staff" ON public.vehicles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

-- Policies for reservations (เห็นเฉพาะของตัวเอง, staff เห็นทั้งหมด)
DROP POLICY IF EXISTS "reservations_select_own" ON public.reservations;
CREATE POLICY "reservations_select_own" ON public.reservations
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

DROP POLICY IF EXISTS "reservations_insert_own" ON public.reservations;
CREATE POLICY "reservations_insert_own" ON public.reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reservations_update_own" ON public.reservations;
CREATE POLICY "reservations_update_own" ON public.reservations
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

-- ============================================
-- 11. SEED DATA: 15 รุ่น
-- ============================================
INSERT INTO public.car_models (name, brand, category, price_per_day, seats, fuel_type, transmission, rating, features) VALUES
-- เก๋ง (5 รุ่น)
('City Turbo', 'Honda', 'เก๋ง', 1000.00, 5, 'เบนซิน', 'Automatic', 4.8, '{"doors":4,"bluetooth":true,"aircon":true}'),
('New Yaris Sport', 'Toyota', 'เก๋ง', 800.00, 5, 'เบนซิน', 'Automatic', 4.9, '{"doors":4,"bluetooth":true,"aircon":true}'),
('New Yaris Ativ', 'Toyota', 'เก๋ง', 1000.00, 5, 'เบนซิน', 'Automatic', 4.7, '{"doors":4,"bluetooth":true,"aircon":true}'),
('Almera Sportech', 'Nissan', 'เก๋ง', 800.00, 5, 'เบนซิน', 'Automatic', 4.6, '{"doors":4,"bluetooth":true,"aircon":true}'),
('Ciaz', 'Suzuki', 'เก๋ง', 800.00, 5, 'เบนซิน', 'Automatic', 4.5, '{"doors":4,"bluetooth":true,"aircon":true}'),

-- กระบะ (2 รุ่น)
('Ranger Raptor', 'Ford', 'กระบะ', 2500.00, 5, 'ดีเซล', 'Automatic', 5.0, '{"doors":4,"4wd":true,"bluetooth":true,"aircon":true}'),
('Vigo Champ', 'Toyota', 'กระบะ', 2000.00, 5, 'ดีเซล', 'Manual', 4.8, '{"doors":4,"bluetooth":true,"aircon":true}'),

-- MPV (3 รุ่น)
('Veloz', 'Toyota', 'MPV', 1800.00, 7, 'เบนซิน', 'Automatic', 4.7, '{"doors":5,"bluetooth":true,"aircon":true}'),
('Cross', 'Suzuki', 'MPV', 1800.00, 7, 'เบนซิน', 'Automatic', 4.6, '{"doors":5,"bluetooth":true,"aircon":true}'),
('Xpander', 'Mitsubishi', 'MPV', 1800.00, 7, 'เบนซิน', 'Automatic', 4.8, '{"doors":5,"bluetooth":true,"aircon":true}'),

-- SUV (2 รุ่น)
('Pajero Sport Elite Edition', 'Mitsubishi', 'SUV', 2200.00, 7, 'ดีเซล', 'Automatic', 4.9, '{"doors":5,"4wd":true,"bluetooth":true,"aircon":true}'),
('MU-X', 'Isuzu', 'SUV', 1990.00, 7, 'ดีเซล', 'Automatic', 4.9, '{"doors":5,"4wd":true,"bluetooth":true,"aircon":true}'),

-- รุ่นสำรอง (3 รุ่น) - เตรียมไว้เพิ่มในอนาคต
('Camry Premium', 'Toyota', 'เก๋ง', 1500.00, 5, 'เบนซิน', 'Automatic', 4.8, '{"doors":4,"bluetooth":true,"aircon":true,"sunroof":true}'),
('CX-5 Grand Touring', 'Mazda', 'SUV', 2100.00, 5, 'เบนซิน', 'Automatic', 4.8, '{"doors":5,"4wd":true,"bluetooth":true,"aircon":true}'),
('Accord Hybrid', 'Honda', 'เก๋ง', 1600.00, 5, 'ไฮบริด', 'Automatic', 4.9, '{"doors":4,"bluetooth":true,"aircon":true,"hybrid":true}');

-- ============================================
-- 12. SEED DATA: 75 คัน (15 รุ่น × 5 คัน)
-- ============================================
INSERT INTO public.vehicles (model_id, vehicle_number, license_plate, status, mileage)
SELECT 
  cm.id,
  '#' || n.num::TEXT,
  NULL, -- ใส่ทะเบียนทีหลัง
  'available',
  0
FROM public.car_models cm
CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS n(num)
ORDER BY cm.name, n.num;

-- ============================================
-- 13. สรุปผลลัพธ์
-- ============================================

-- แสดงรุ่นรถทั้งหมด
SELECT 
  cm.brand AS "ยี่ห้อ",
  cm.name AS "รุ่น",
  cm.category AS "ประเภท",
  CONCAT('฿', cm.price_per_day::TEXT) AS "ราคา/วัน",
  cm.seats AS "ที่นั่ง",
  cm.fuel_type AS "เชื้อเพลิง",
  cm.transmission AS "เกียร์",
  COUNT(v.id) AS "จำนวนคัน",
  cm.rating AS "คะแนน"
FROM public.car_models cm
LEFT JOIN public.vehicles v ON v.model_id = cm.id
GROUP BY cm.id, cm.brand, cm.name, cm.category, cm.price_per_day, cm.seats, cm.fuel_type, cm.transmission, cm.rating
ORDER BY cm.category, cm.name;

-- สรุปตามประเภท
SELECT 
  cm.category AS "ประเภท",
  COUNT(DISTINCT cm.id) AS "จำนวนรุ่น",
  COUNT(v.id) AS "จำนวนคัน",
  CONCAT('฿', MIN(cm.price_per_day)::TEXT, ' - ฿', MAX(cm.price_per_day)::TEXT) AS "ช่วงราคา"
FROM public.car_models cm
LEFT JOIN public.vehicles v ON v.model_id = cm.id
GROUP BY cm.category
ORDER BY cm.category;

-- สรุปรวมทั้งหมด
SELECT 
  COUNT(DISTINCT cm.id) AS "จำนวนรุ่นทั้งหมด",
  COUNT(v.id) AS "จำนวนคันทั้งหมด",
  COUNT(DISTINCT cm.category) AS "จำนวนประเภท"
FROM public.car_models cm
LEFT JOIN public.vehicles v ON v.model_id = cm.id;

-- แสดงตัวอย่างรถ 5 รุ่นแรก พร้อมคันที่ available
SELECT 
  cm.name AS "รุ่น",
  v.vehicle_number AS "คัน",
  v.status AS "สถานะ",
  CONCAT('฿', cm.price_per_day::TEXT, '/วัน') AS "ราคา"
FROM public.vehicles v
JOIN public.car_models cm ON cm.id = v.model_id
WHERE cm.name IN (
  SELECT name FROM public.car_models ORDER BY name LIMIT 5
)
ORDER BY cm.name, v.vehicle_number;
