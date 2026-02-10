-- ============================================
-- Rungroj CarRental - Supabase Database Schema
-- Project: lpaqjhrjuokvhsdegynn
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Helper: set_updated_at() trigger function
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Table: profiles
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'super_admin', 'auditor')),
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_select_staff" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin', 'auditor'))
  );

-- ============================================
-- Table: vehicles
-- ============================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
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

CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_category ON public.vehicles(category);

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicles_select_all" ON public.vehicles
  FOR SELECT USING (true);

CREATE POLICY "vehicles_insert_staff" ON public.vehicles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

CREATE POLICY "vehicles_update_staff" ON public.vehicles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

CREATE POLICY "vehicles_delete_admin" ON public.vehicles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ============================================
-- Table: vehicle_device_links
-- ============================================
CREATE TABLE IF NOT EXISTS public.vehicle_device_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_type TEXT,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicle_device_links_vehicle_id ON public.vehicle_device_links(vehicle_id);

CREATE TRIGGER trg_vehicle_device_links_updated_at
  BEFORE UPDATE ON public.vehicle_device_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.vehicle_device_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_device_links_select_staff" ON public.vehicle_device_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

CREATE POLICY "vehicle_device_links_manage_staff" ON public.vehicle_device_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

-- ============================================
-- Table: reservations
-- ============================================
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  pickup_date TIMESTAMPTZ NOT NULL,
  dropoff_date TIMESTAMPTZ NOT NULL,
  pickup_location TEXT,
  total_price NUMERIC(10,2),
  service_type TEXT DEFAULT 'self_drive' CHECK (service_type IN ('self_drive', 'with_driver')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX idx_reservations_vehicle_id ON public.reservations(vehicle_id);
CREATE INDEX idx_reservations_status ON public.reservations(status);

CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations_select_own" ON public.reservations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reservations_insert_own" ON public.reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reservations_update_own" ON public.reservations
  FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending', 'confirmed'));

CREATE POLICY "reservations_select_staff" ON public.reservations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin', 'auditor'))
  );

CREATE POLICY "reservations_update_staff" ON public.reservations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

-- ============================================
-- Table: payments
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_reservation_id ON public.payments(reservation_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_select_staff" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin', 'auditor'))
  );

CREATE POLICY "payments_update_staff" ON public.payments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

-- ============================================
-- Table: id_verifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.id_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES public.reservations(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  id_hash TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_id_verifications_user_id ON public.id_verifications(user_id);

CREATE TRIGGER trg_id_verifications_updated_at
  BEFORE UPDATE ON public.id_verifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.id_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "id_verifications_select_own" ON public.id_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "id_verifications_insert_own" ON public.id_verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "id_verifications_manage_staff" ON public.id_verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'super_admin'))
  );

-- ============================================
-- Table: security_actions
-- ============================================
CREATE TABLE IF NOT EXISTS public.security_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_actions_requested_by ON public.security_actions(requested_by);

CREATE TRIGGER trg_security_actions_updated_at
  BEFORE UPDATE ON public.security_actions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.security_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_actions_select_own" ON public.security_actions
  FOR SELECT USING (auth.uid() = requested_by);

CREATE POLICY "security_actions_insert_own" ON public.security_actions
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "security_actions_manage_admin" ON public.security_actions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'auditor'))
  );

-- ============================================
-- Storage: user-avatars bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatar_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatar_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatar_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatar_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- Seed: Initial vehicles for Rungroj CarRental
-- ============================================
INSERT INTO public.vehicles (name, category, price_per_day, status, seats, fuel_type, rating, features) VALUES
  ('Toyota Yaris Ativ', 'เก๋ง', 899.00, 'available', 5, 'เบนซิน', 4.9, '{"luggage": 3}'),
  ('Honda City', 'เก๋ง', 999.00, 'available', 5, 'เบนซิน', 4.8, '{"luggage": 4}'),
  ('Toyota Fortuner', 'SUV', 2500.00, 'available', 7, 'ดีเซล', 4.9, '{"luggage": 5}'),
  ('Toyota Hilux Revo', 'กระบะ', 1500.00, 'available', 5, 'ดีเซล', 4.7, '{"luggage": 6}'),
  ('Honda HR-V', 'อีโค', 1800.00, 'available', 5, 'ไฮบริด', 4.8, '{"luggage": 4}'),
  ('Nissan Almera', 'เก๋ง', 800.00, 'available', 5, 'เบนซิน', 4.6, '{"luggage": 3}'),
  ('MG ZS EV', 'อีโค', 2200.00, 'available', 5, 'ไฟฟ้า', 4.7, '{"luggage": 4}'),
  ('Isuzu D-Max', 'กระบะ', 1400.00, 'available', 5, 'ดีเซล', 4.8, '{"luggage": 6}');

-- ============================================
-- Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (NEW.id, 'customer', COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
