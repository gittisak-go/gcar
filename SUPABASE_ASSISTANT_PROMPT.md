# Supabase Backend Implementation Prompt
**Copy and paste this entire prompt to Supabase AI Assistant**

---

## 🎯 PROJECT OVERVIEW
You are building the complete backend for **Rungroj Car Rental System** - a Thai car rental platform with user management, vehicle inventory, reservations, payments, and security features.

---

## 📋 PROJECT SPEC HEADER (STRICT COMPLIANCE REQUIRED)

### Platform
- **Supabase Stack**: PostgreSQL, Auth, Storage, Realtime, Edge Functions
- **Environment Variables**: 
  - `SUPABASE_URL` (client-facing)
  - `SUPABASE_ANON_KEY` (client-facing)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only, NEVER expose to client)
- **Docker**: Only for local development (`supabase start`), NOT required in production

### Database Architecture
- **Schemas**:
  - `public` - Application tables (profiles, vehicles, reservations, etc.)
  - `auth` - Supabase Auth system (managed by Supabase)
  - `storage` - File storage system (managed by Supabase)
  - `realtime` - Realtime subscriptions (managed by Supabase)

- **Timestamp Standards**:
  - Every table MUST have: `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - Every table MUST have: `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  - Use trigger function `set_updated_at()` for automatic updates

- **User Foreign Key**:
  - `profiles.id = auth.users.id` (single source of truth)
  - All user references MUST link to `profiles.id`, NOT `auth.users.id`

### Auth & Roles
- **User Storage**: Users exist in `auth.users` (Supabase managed)
- **Profile Storage**: Application data in `public.profiles` with role-based access
- **Roles**: `customer`, `staff`, `super_admin`, `auditor`
- **Role Assignment**: Default `customer`, elevated by admin action only
- **RLS**: MUST be enabled on ALL application tables

### RLS Policy Rules (CRITICAL)
1. **Separate Policies**: Create distinct policies for SELECT/INSERT/UPDATE/DELETE
2. **Index All Policy Columns**: Create indexes on columns used in WHERE clauses:
   - `user_id`, `vehicle_id`, `status`, `reservation_id`, etc.
3. **Service Role**: `service_role` bypasses RLS - NEVER use client-side
4. **Policy Naming**: Use pattern `{table}_{action}_{scope}` (e.g., `reservations_select_own`)

### Storage
- **Bucket Structure**: `user-avatars/<user_id>/*` (folder-based isolation)
- **RLS on Storage**: Use `storage.foldername()` to enforce user-specific access
- **Metadata Only**: Tables store URLs/paths, NOT file contents
- **Public Setting**: Set `public = false` for private buckets

### Realtime
- **Preferred Method**: Use `broadcast` with private channels over `postgres_changes`
- **Channel Topics**: 
  - `reservation::events` - Reservation updates
  - `vehicle::events` - Vehicle status changes
  - `user-reservations-{user_id}` - Per-user private channel
- **Triggers**: Create `realtime.broadcast_changes` triggers for auto-broadcasting
- **RLS on Realtime**: Apply RLS to `realtime.messages` for read/write control

### Edge Functions
- **Runtime**: Deno with `Deno.serve`
- **Dependencies**: Import via `npm:` or `jsr:` with pinned versions (no `latest`)
- **Environment**: Use `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` server-side
- **Shared Code**: Place utilities in `functions/_shared/` directory
- **CORS**: Configure CORS headers for client requests

### Contracts (MUST FOLLOW EXACTLY)

#### Core Tables (DO NOT CHANGE STRUCTURE)
```sql
-- profiles: User application data
profiles(
  id UUID PK = auth.users.id,
  role TEXT NOT NULL DEFAULT 'customer',
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT NULLABLE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- vehicles: Car inventory
vehicles(
  id UUID PK,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_per_day NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  features JSONB,
  rating NUMERIC(2,1),
  seats INTEGER,
  fuel_type TEXT,
  last_known_geo POINT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- reservations: Booking records
reservations(
  id UUID PK,
  user_id UUID FK→profiles,
  vehicle_id UUID FK→vehicles,
  status TEXT NOT NULL DEFAULT 'pending',
  pickup_date TIMESTAMPTZ NOT NULL,
  dropoff_date TIMESTAMPTZ NOT NULL,
  pickup_location TEXT,
  total_price NUMERIC(10,2),
  service_type TEXT DEFAULT 'self_drive',
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- payments: Payment tracking
payments(
  id UUID PK,
  reservation_id UUID FK→reservations,
  user_id UUID FK→profiles,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- id_verifications: Identity verification
id_verifications(
  id UUID PK,
  user_id UUID FK→profiles,
  reservation_id UUID FK→reservations,
  status TEXT NOT NULL DEFAULT 'pending',
  id_hash TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- security_actions: Audit log for admin actions
security_actions(
  id UUID PK,
  requested_by UUID FK→profiles,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- vehicle_device_links: IoT device connections (optional/future)
vehicle_device_links(
  id UUID PK,
  vehicle_id UUID FK→vehicles,
  device_id TEXT NOT NULL,
  device_type TEXT,
  linked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Governance
- **Experimental Features**: Prefix with `experimental_*`
- **Legacy Features**: Suffix with `*_legacy`
- **Schema Changes**: ALL changes via migrations in `supabase/migrations/`
- **Version Control**: Update `README_SPEC` version note on each migration
- **Front-end Contract**: Fixed (do NOT break existing API)
- **Admin Panel**: Can evolve (not fixed)

---

## 🚀 IMPLEMENTATION TASKS

### 1. Database Setup
✅ **Already Implemented** - Files exist in `supabase/migrations/`:
- `001_initial_schema.sql` - Core tables, RLS, indexes, triggers
- `002_calculate_reservation_total.sql` - Auto-calculate pricing trigger

### 2. RLS Policies Enhancement
Verify and enhance existing RLS policies:

```sql
-- profiles: Users can view/update own, staff can view all
-- vehicles: Public select, staff insert/update, admin delete
-- reservations: Users manage own (pending/confirmed), staff manage all
-- payments: Users view own, staff view/update all
-- id_verifications: Users view/insert own, staff manage all
-- security_actions: Users view/insert own, admin/auditor manage all
-- vehicle_device_links: Staff only
```

### 3. Realtime Setup
Create broadcast channels and triggers:

```sql
-- Channel: reservation::events (broadcast on reservation changes)
CREATE OR REPLACE FUNCTION notify_reservation_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'reservation::events',
    json_build_object(
      'event', TG_OP,
      'reservation_id', NEW.id,
      'user_id', NEW.user_id,
      'status', NEW.status
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_reservation_change
  AFTER INSERT OR UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION notify_reservation_change();

-- Similar for vehicle::events
```

### 4. Storage Buckets
Create and configure:

```sql
-- user-avatars bucket (already in migration, verify)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', false)
ON CONFLICT (id) DO NOTHING;

-- Add policies for user-specific folder access
-- Pattern: user-avatars/{user_id}/*
```

### 5. Business Logic Functions

#### Check Reservation Overlap
```sql
CREATE OR REPLACE FUNCTION check_reservation_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.reservations
    WHERE vehicle_id = NEW.vehicle_id
      AND status NOT IN ('cancelled', 'completed')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
        (NEW.pickup_date, NEW.dropoff_date) OVERLAPS (pickup_date, dropoff_date)
      )
  ) THEN
    RAISE EXCEPTION 'Overlapping reservation exists for this vehicle';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_reservation_overlap
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION check_reservation_overlap();
```

#### Update Vehicle Status on Reservation
```sql
CREATE OR REPLACE FUNCTION update_vehicle_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE public.vehicles SET status = 'rented' WHERE id = NEW.vehicle_id;
  ELSIF NEW.status IN ('completed', 'cancelled') THEN
    -- Check if no other active reservations
    IF NOT EXISTS (
      SELECT 1 FROM public.reservations
      WHERE vehicle_id = NEW.vehicle_id AND status = 'active'
    ) THEN
      UPDATE public.vehicles SET status = 'available' WHERE id = NEW.vehicle_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_vehicle_status
  AFTER UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION update_vehicle_status();
```

### 6. Edge Functions (Optional)

Create in `supabase/functions/`:

#### send-confirmation-email
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.0'

serve(async (req) => {
  const { reservationId } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Fetch reservation details
  const { data } = await supabase
    .from('reservations')
    .select('*, profiles(*), vehicles(*)')
    .eq('id', reservationId)
    .single()
  
  // Send email logic here
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 7. Indexes (Performance Optimization)

```sql
-- Reservation queries
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle_id ON public.reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations(pickup_date, dropoff_date);

-- Payment queries
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON public.payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Vehicle queries
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON public.vehicles(category);

-- Verification queries
CREATE INDEX IF NOT EXISTS idx_id_verifications_user_id ON public.id_verifications(user_id);

-- Security queries
CREATE INDEX IF NOT EXISTS idx_security_actions_requested_by ON public.security_actions(requested_by);
```

---

## 🔒 SECURITY CHECKLIST

- [x] RLS enabled on ALL application tables
- [x] Separate SELECT/INSERT/UPDATE/DELETE policies
- [x] auth.uid() used for user identification
- [x] Role checks via profiles table JOIN
- [x] service_role key NEVER exposed to client
- [x] Storage bucket policies enforce user isolation
- [x] Indexes on all policy filter columns
- [x] TIMESTAMPTZ for all date/time fields
- [x] CHECK constraints on enum-like columns
- [x] Foreign key constraints with proper ON DELETE
- [x] Triggers for audit/automated actions

---

## 📦 MIGRATION TEMPLATE

When creating new features, use this migration pattern:

```sql
-- 00X_feature_name.sql
-- Description: What this migration does
-- Author: [Your Name]
-- Date: [YYYY-MM-DD]

-- 1. Create/modify tables
CREATE TABLE IF NOT EXISTS public.new_table (...);

-- 2. Add indexes
CREATE INDEX IF NOT EXISTS idx_new_table_user_id ON public.new_table(user_id);

-- 3. Add triggers
CREATE TRIGGER trg_new_table_updated_at
  BEFORE UPDATE ON public.new_table
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Enable RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- 5. Create policies
CREATE POLICY "new_table_select_own" ON public.new_table
  FOR SELECT USING (auth.uid() = user_id);

-- 6. Seed data (if needed)
INSERT INTO public.new_table (...) VALUES (...);
```

---

## 🎨 FRONTEND INTEGRATION NOTES

The frontend already implements:
- Supabase client with `persistSession: true` and `autoRefreshToken: true`
- Zustand store for state management
- Realtime subscriptions via hooks:
  - `useReservationRealtime` - User-specific reservation updates
  - `useAdminReservationsRealtime` - Admin dashboard updates
- Helper functions in `lib/`:
  - `vehicles.js` - Vehicle CRUD operations
  - `reservations.js` - Reservation CRUD, price calculation
  - `supabase.js` - Supabase client instance

**Backend MUST support:**
1. Public SELECT on vehicles (no auth required)
2. Authenticated INSERT on reservations (auto-calculate total_price via trigger)
3. Realtime broadcasts on reservation status changes
4. Profile auto-creation on user signup

---

## 🧪 TESTING CHECKLIST

After implementation, verify:

1. **Auth Flow**:
   - [ ] New user signup creates profile automatically
   - [ ] Users can update own profile and avatar
   - [ ] Role-based access works correctly

2. **Reservations**:
   - [ ] Users can create reservations (total_price auto-calculated)
   - [ ] Overlapping reservations are blocked
   - [ ] Vehicle status updates when reservation becomes active
   - [ ] Users can only see/edit own reservations
   - [ ] Staff can see/manage all reservations

3. **Realtime**:
   - [ ] Reservation changes broadcast to appropriate channels
   - [ ] Users receive updates for their reservations only
   - [ ] Admin receives all reservation updates

4. **Storage**:
   - [ ] Users can upload avatars to their folder only
   - [ ] Other users cannot access/modify others' avatars

5. **Performance**:
   - [ ] All indexed queries run in <100ms
   - [ ] No N+1 query issues
   - [ ] RLS policies use indexes

---

## 📝 DELIVERABLES

Please provide:
1. Complete migration SQL files (numbered sequentially)
2. RLS policy summary table showing all policies per table
3. Index coverage report (which queries are optimized)
4. Realtime channel setup with subscription examples
5. Edge function code (if applicable)
6. Updated README_SPEC documenting schema version

---

## ⚡ QUICK START COMMANDS

```bash
# Initialize Supabase locally
supabase init

# Start local Supabase
supabase start

# Create new migration
supabase migration new feature_name

# Apply migrations
supabase db push

# Reset database (DANGER: local only)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts
```

---

**END OF PROMPT**

Copy everything above ⬆️ and paste into Supabase AI Assistant to generate a complete, production-ready backend following all specifications and best practices.
