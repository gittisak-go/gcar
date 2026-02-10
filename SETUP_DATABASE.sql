-- ============================================
-- 🚗 รถเช่าอุดรธานี รุ่งโรจน์ คาร์เร้นท์
-- คำสั่ง SQL สำหรับสร้างตารางและเพิ่มข้อมูลรถ
-- 12 รุ่น ๆ ละ 4 คัน = 48 คัน
-- ============================================
-- วิธีใช้:
-- 1. ไปที่ https://supabase.com/dashboard/project/lpaqjhrjuokvhsdegynn/editor
-- 2. กด "New query"
-- 3. Copy ทั้งหมดและ Paste ในช่อง SQL Editor
-- 4. กด "Run" (Ctrl+Enter)
-- ============================================

-- สร้างตาราง vehicles (ถ้ายังไม่มี)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  vehicle_number TEXT, -- หมายเลขคัน เช่น #1, #2, #3, #4
  category TEXT NOT NULL,
  price_per_day NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'retired')),
  features JSONB DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0,
  seats INTEGER DEFAULT 5,
  fuel_type TEXT,
  last_known_geo POINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- สร้าง indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON public.vehicles(category);

-- สร้าง trigger สำหรับ updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- เปิด RLS (Row Level Security)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- สร้าง policies
DROP POLICY IF EXISTS "vehicles_select_all" ON public.vehicles;
CREATE POLICY "vehicles_select_all" ON public.vehicles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "vehicles_insert_staff" ON public.vehicles;
CREATE POLICY "vehicles_insert_staff" ON public.vehicles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

DROP POLICY IF EXISTS "vehicles_update_staff" ON public.vehicles;
CREATE POLICY "vehicles_update_staff" ON public.vehicles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

DROP POLICY IF EXISTS "vehicles_delete_admin" ON public.vehicles;
CREATE POLICY "vehicles_delete_admin" ON public.vehicles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ลบข้อมูลเก่าทั้งหมด (ถ้ามี)
TRUNCATE TABLE public.vehicles CASCADE;

-- เพิ่มข้อมูลรถทั้งหมด 12 รุ่น ๆ ละ 4 คัน = 48 คัน (จาก https://rungrojcarrent.vercel.app)
INSERT INTO public.vehicles (name, vehicle_number, category, price_per_day, fuel_type, seats, rating, features, status) VALUES
-- เก๋ง (Sedan/Compact) - 5 รุ่น x 4 คัน = 20 คัน
('City Turbo', '#1', 'เก๋ง', 1000.00, 'Petrol', 5, 4.8, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('City Turbo', '#2', 'เก๋ง', 1000.00, 'Petrol', 5, 4.8, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('City Turbo', '#3', 'เก๋ง', 1000.00, 'Petrol', 5, 4.8, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('City Turbo', '#4', 'เก๋ง', 1000.00, 'Petrol', 5, 4.8, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),

('New Yaris Sport', '#1', 'เก๋ง', 800.00, 'Petrol', 5, 4.9, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('New Yaris Sport', '#2', 'เก๋ง', 800.00, 'Petrol', 5, 4.9, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('New Yaris Sport', '#3', 'เก๋ง', 800.00, 'Petrol', 5, 4.9, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('New Yaris Sport', '#4', 'เก๋ง', 800.00, 'Petrol', 5, 4.9, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),

('New Yaris Ativ', '#1', 'เก๋ง', 1000.00, 'Petrol', 5, 4.7, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('New Yaris Ativ', '#2', 'เก๋ง', 1000.00, 'Petrol', 5, 4.7, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('New Yaris Ativ', '#3', 'เก๋ง', 1000.00, 'Petrol', 5, 4.7, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('New Yaris Ativ', '#4', 'เก๋ง', 1000.00, 'Petrol', 5, 4.7, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),

('Almera Sportech', '#1', 'เก๋ง', 800.00, 'Petrol', 5, 4.6, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('Almera Sportech', '#2', 'เก๋ง', 800.00, 'Petrol', 5, 4.6, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('Almera Sportech', '#3', 'เก๋ง', 800.00, 'Petrol', 5, 4.6, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('Almera Sportech', '#4', 'เก๋ง', 800.00, 'Petrol', 5, 4.6, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),

('Ciaz', '#1', 'เก๋ง', 800.00, 'Petrol', 5, 4.5, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('Ciaz', '#2', 'เก๋ง', 800.00, 'Petrol', 5, 4.5, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('Ciaz', '#3', 'เก๋ง', 800.00, 'Petrol', 5, 4.5, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('Ciaz', '#4', 'เก๋ง', 800.00, 'Petrol', 5, 4.5, '{"transmission":"Automatic","doors":4,"bluetooth":true,"aircon":true}', 'available'),

-- กระบะ (Pickup) - 2 รุ่น x 4 คัน = 8 คัน
('Ranger Raptor', '#1', 'กระบะ', 2500.00, 'Diesel', 5, 5.0, '{"transmission":"Automatic","doors":4,"4wd":true,"bluetooth":true,"aircon":true}', 'available'),
('Ranger Raptor', '#2', 'กระบะ', 2500.00, 'Diesel', 5, 5.0, '{"transmission":"Automatic","doors":4,"4wd":true,"bluetooth":true,"aircon":true}', 'available'),
('Ranger Raptor', '#3', 'กระบะ', 2500.00, 'Diesel', 5, 5.0, '{"transmission":"Automatic","doors":4,"4wd":true,"bluetooth":true,"aircon":true}', 'available'),
('Ranger Raptor', '#4', 'กระบะ', 2500.00, 'Diesel', 5, 5.0, '{"transmission":"Automatic","doors":4,"4wd":true,"bluetooth":true,"aircon":true}', 'available'),

('Vigo Champ', '#1', 'กระบะ', 2000.00, 'Diesel', 5, 4.8, '{"transmission":"Manual","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('Vigo Champ', '#2', 'กระบะ', 2000.00, 'Diesel', 5, 4.8, '{"transmission":"Manual","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('Vigo Champ', '#3', 'กระบะ', 2000.00, 'Diesel', 5, 4.8, '{"transmission":"Manual","doors":4,"bluetooth":true,"aircon":true}', 'available'),
('Vigo Champ', '#4', 'กระบะ', 2000.00, 'Diesel', 5, 4.8, '{"transmission":"Manual","doors":4,"bluetooth":true,"aircon":true}', 'available'),

-- MPV - 3 รุ่น x 4 คัน = 12 คัน
('Veloz', '#1', 'MPV', 1800.00, 'Petrol', 7, 4.7, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),
('Veloz', '#2', 'MPV', 1800.00, 'Petrol', 7, 4.7, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),
('Veloz', '#3', 'MPV', 1800.00, 'Petrol', 7, 4.7, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),
('Veloz', '#4', 'MPV', 1800.00, 'Petrol', 7, 4.7, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),

('Cross', '#1', 'MPV', 1800.00, 'Petrol', 7, 4.6, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),
('Cross', '#2', 'MPV', 1800.00, 'Petrol', 7, 4.6, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),
('Cross', '#3', 'MPV', 1800.00, 'Petrol', 7, 4.6, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),
('Cross', '#4', 'MPV', 1800.00, 'Petrol', 7, 4.6, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),

('Xpander', '#1', 'MPV', 1800.00, 'Petrol', 7, 4.8, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),
('Xpander', '#2', 'MPV', 1800.00, 'Petrol', 7, 4.8, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),
('Xpander', '#3', 'MPV', 1800.00, 'Petrol', 7, 4.8, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),
('Xpander', '#4', 'MPV', 1800.00, 'Petrol', 7, 4.8, '{"transmission":"Automatic","doors":5,"bluetooth":true,"aircon":true}', 'available'),

-- SUV - 2 รุ่น x 4 คัน = 8 คัน
('Pajero Sport Elite Edition', '#1', 'SUV', 2200.00, 'Diesel', 7, 4.9, '{"transmission":"Automatic","doors":5,"4wd":true,"bluetooth":true,"aircon":true}', 'available'),
('Pajero Sport Elite Edition', '#2', 'SUV', 2200.00, 'Diesel', 7, 4.9, '{"transmission":"Automatic","doors":5,"4wd":true,"bluetooth":true,"aircon":true}', 'available'),
('Pajero Sport Elite Edition', '#3', 'SUV', 2200.00, 'Diesel', 7, 4.9, '{"transmission":"Automatic","doors":5,"4wd":true,"bluetooth":true,"aircon":true}', 'available'),
('Pajero Sport Elite Edition', '#4', 'SUV', 2200.00, 'Diesel', 7, 4.9, '{"transmission":"Automatic","doors":5,"4wd":true,"bluetooth":true,"aircon":true}', 'available'),

('MU-X', '#1', 'SUV', 1990.00, 'Diesel', 7, 4.9, '{"transmission":"Automatic","doors":5,"4wd":true,"bluetooth":true,"aircon":true}', 'available'),
('MU-X', '#2', 'SUV', 1990.00, 'Diesel', 7, 4.9, '{"transmission":"Automatic","doors":5,"4wd":true,"bluetooth":true,"aircon":true}', 'available'),
('MU-X', '#3', 'SUV', 1990.00, 'Diesel', 7, 4.9, '{"transmission":"Automatic","doors":5,"4wd":true,"bluetooth":true,"aircon":true}', 'available'),
('MU-X', '#4', 'SUV', 1990.00, 'Diesel', 7, 4.9, '{"transmission":"Automatic","doors":5,"4wd":true,"bluetooth":true,"aircon":true}', 'available');

-- แสดงผลลัพธ์
SELECT 
  name AS "ชื่อรถ",
  vehicle_number AS "คันที่",
  category AS "ประเภท",
  CONCAT('฿', price_per_day::TEXT) AS "ราคา/วัน",
  fuel_type AS "น้ำมัน",
  seats AS "ที่นั่ง",
  features->>'transmission' AS "เกียร์",
  rating AS "คะแนน",
  status AS "สถานะ"
FROM public.vehicles
ORDER BY category, name, vehicle_number;

-- แสดงสรุป
SELECT 
  category AS "ประเภท",
  COUNT(*) AS "จำนวนคัน",
  COUNT(DISTINCT name) AS "จำนวนรุ่น",
  CONCAT('฿', MIN(price_per_day)::TEXT, ' - ฿', MAX(price_per_day)::TEXT) AS "ช่วงราคา"
FROM public.vehicles
GROUP BY category
ORDER BY category;

-- สรุปรวม
SELECT 
  COUNT(*) AS "รถทั้งหมด",
  COUNT(DISTINCT name) AS "จำนวนรุ่น",
  COUNT(DISTINCT category) AS "จำนวนประเภท"
FROM public.vehicles;
