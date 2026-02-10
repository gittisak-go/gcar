# Database Schema Specification

**Project:** Rungroj Car Rental System  
**Database:** Supabase (PostgreSQL)  
**Schema Version:** 1.0.0  
**Last Updated:** February 10, 2026

---

## 📊 Current Schema Version

### v1.0.0 (February 10, 2026)
**Migration Files:**
- `001_initial_schema.sql` - Core tables, RLS, indexes, triggers, storage
- `002_calculate_reservation_total.sql` - Auto-calculate reservation pricing

**Tables:** 7
- `profiles` - User application data
- `vehicles` - Car inventory
- `reservations` - Booking records
- `payments` - Payment tracking
- `id_verifications` - Identity verification
- `security_actions` - Audit log for admin actions
- `vehicle_device_links` - IoT device connections

**Storage Buckets:** 1
- `user-avatars` - User avatar images

**Edge Functions:** 0 (planned)

---

## 📋 Schema Overview

### Core Tables

#### profiles
```sql
id               UUID PK (FK → auth.users.id)
role             TEXT NOT NULL DEFAULT 'customer'
full_name        TEXT
phone            TEXT
avatar_url       TEXT
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```
**Indexes:** `profiles_pkey`  
**RLS Policies:** 5 (select_own, update_own, insert_own, select_staff, ...)  
**Purpose:** User application data and role management

---

#### vehicles
```sql
id               UUID PK
name             TEXT NOT NULL
category         TEXT NOT NULL
price_per_day    NUMERIC(10,2) NOT NULL
image_url        TEXT
status           TEXT NOT NULL DEFAULT 'available'
features         JSONB
rating           NUMERIC(2,1)
seats            INTEGER
fuel_type        TEXT
last_known_geo   POINT
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```
**Indexes:** `idx_vehicles_status`, `idx_vehicles_category`  
**RLS Policies:** 4 (select_all, insert_staff, update_staff, delete_admin)  
**Purpose:** Car inventory management

---

#### reservations
```sql
id               UUID PK
user_id          UUID NOT NULL (FK → profiles.id)
vehicle_id       UUID NOT NULL (FK → vehicles.id)
status           TEXT NOT NULL DEFAULT 'pending'
pickup_date      TIMESTAMPTZ NOT NULL
dropoff_date     TIMESTAMPTZ NOT NULL
pickup_location  TEXT
total_price      NUMERIC(10,2)
service_type     TEXT DEFAULT 'self_drive'
notes            TEXT
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```
**Indexes:** `idx_reservations_user_id`, `idx_reservations_vehicle_id`, `idx_reservations_status`  
**RLS Policies:** 5 (select_own, insert_own, update_own, select_staff, update_staff)  
**Triggers:** `trg_calculate_reservation_total`, `trg_check_reservation_overlap (planned)`  
**Purpose:** Booking records with auto-calculated pricing

---

#### payments
```sql
id               UUID PK
reservation_id   UUID NOT NULL (FK → reservations.id)
user_id          UUID NOT NULL (FK → profiles.id)
amount           NUMERIC(10,2) NOT NULL
status           TEXT NOT NULL DEFAULT 'pending'
payment_method   TEXT
paid_at          TIMESTAMPTZ
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```
**Indexes:** `idx_payments_reservation_id`, `idx_payments_user_id`, `idx_payments_status`  
**RLS Policies:** 4 (select_own, insert_own, select_staff, update_staff)  
**Purpose:** Payment transaction tracking

---

#### id_verifications
```sql
id               UUID PK
user_id          UUID NOT NULL (FK → profiles.id)
reservation_id   UUID (FK → reservations.id)
status           TEXT NOT NULL DEFAULT 'pending'
id_hash          TEXT
verified_at      TIMESTAMPTZ
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```
**Indexes:** `idx_id_verifications_user_id`  
**RLS Policies:** 3 (select_own, insert_own, manage_staff)  
**Purpose:** Identity verification for high-value rentals

---

#### security_actions
```sql
id               UUID PK
requested_by     UUID NOT NULL (FK → profiles.id)
action           TEXT NOT NULL
status           TEXT NOT NULL DEFAULT 'pending'
metadata         JSONB
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```
**Indexes:** `idx_security_actions_requested_by`  
**RLS Policies:** 3 (select_own, insert_own, manage_admin)  
**Purpose:** Audit log for sensitive admin actions

---

#### vehicle_device_links
```sql
id               UUID PK
vehicle_id       UUID NOT NULL (FK → vehicles.id)
device_id        TEXT NOT NULL
device_type      TEXT
linked_at        TIMESTAMPTZ
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```
**Indexes:** `idx_vehicle_device_links_vehicle_id`  
**RLS Policies:** 2 (select_staff, manage_staff)  
**Purpose:** Link vehicles to IoT devices (GPS, security systems)

---

## 🔐 Security (RLS)

### Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE | Total |
|-------|--------|--------|--------|--------|-------|
| profiles | Own + Staff | Own | Own | - | 5 |
| vehicles | Public | Staff | Staff | Admin | 4 |
| reservations | Own + Staff | Own | Own + Staff | - | 5 |
| payments | Own + Staff | Own | Staff | - | 4 |
| id_verifications | Own | Own | Staff | Staff | 3 |
| security_actions | Own | Own | Admin | Admin | 3 |
| vehicle_device_links | Staff | Staff | Staff | Staff | 2 |

**Total Policies:** 26

---

## ⚡ Performance

### Indexed Columns

| Table | Indexed Columns | Purpose |
|-------|----------------|---------|
| profiles | `id` (PK) | User lookup |
| vehicles | `status`, `category` | Filtering available cars |
| reservations | `user_id`, `vehicle_id`, `status` | User/vehicle/status queries |
| payments | `reservation_id`, `user_id`, `status` | Payment tracking |
| id_verifications | `user_id` | User verification lookup |
| security_actions | `requested_by` | Admin action audit |
| vehicle_device_links | `vehicle_id` | Device queries |

**Total Indexes:** 13 (including PKs)

---

## 🔄 Business Logic

### Triggers

| Trigger Name | Table | Type | Function | Purpose |
|-------------|-------|------|----------|---------|
| `trg_profiles_updated_at` | profiles | BEFORE UPDATE | `set_updated_at()` | Auto-update timestamp |
| `trg_vehicles_updated_at` | vehicles | BEFORE UPDATE | `set_updated_at()` | Auto-update timestamp |
| `trg_reservations_updated_at` | reservations | BEFORE UPDATE | `set_updated_at()` | Auto-update timestamp |
| `trg_calculate_reservation_total` | reservations | BEFORE INSERT | `calculate_reservation_total()` | Auto-calculate price |
| `trg_payments_updated_at` | payments | BEFORE UPDATE | `set_updated_at()` | Auto-update timestamp |
| `trg_id_verifications_updated_at` | id_verifications | BEFORE UPDATE | `set_updated_at()` | Auto-update timestamp |
| `trg_security_actions_updated_at` | security_actions | BEFORE UPDATE | `set_updated_at()` | Auto-update timestamp |
| `trg_vehicle_device_links_updated_at` | vehicle_device_links | BEFORE UPDATE | `set_updated_at()` | Auto-update timestamp |
| `on_auth_user_created` | auth.users | AFTER INSERT | `handle_new_user()` | Auto-create profile |

### Functions

| Function Name | Return Type | Purpose |
|--------------|-------------|---------|
| `set_updated_at()` | TRIGGER | Update `updated_at` column |
| `calculate_reservation_total()` | TRIGGER | Calculate total_price based on dates |
| `handle_new_user()` | TRIGGER | Create profile on signup |

---

## 📁 Storage

### Buckets

| Bucket ID | Public | RLS Enabled | Policies | Purpose |
|-----------|--------|-------------|----------|---------|
| `user-avatars` | ❌ No | ✅ Yes | 4 | User profile pictures |

**Storage Pattern:** `user-avatars/{user_id}/*`  
**Max File Size:** Not set (recommended: 5MB)  
**Allowed MIME Types:** Not set (recommended: image/*)

---

## 🔮 Planned Features (v1.1.0)

### High Priority
- [ ] **Overlap Check Trigger:** Block overlapping reservations automatically
- [ ] **Vehicle Status Update Trigger:** Update vehicle status when reservation becomes active/completed
- [ ] **Realtime Channels:** Broadcast reservation/vehicle changes
- [ ] **Edge Function:** Send confirmation email
- [ ] **Edge Function:** Process payments

### Medium Priority
- [ ] **Reviews Table:** Customer reviews for vehicles
- [ ] **Promotions Table:** Discount codes and promotions
- [ ] **Notifications Table:** User notifications

### Low Priority
- [ ] **Analytics Views:** Materialized views for reporting
- [ ] **Full-text Search:** Search vehicles by name/features

---

## 🗓️ Migration History

### Version 1.0.0 (February 10, 2026)
- ✅ Initial schema with 7 core tables
- ✅ RLS policies on all tables
- ✅ Indexes for performance
- ✅ Timestamp triggers
- ✅ Auto-calculate reservation total
- ✅ Auto-create profile on signup
- ✅ Storage bucket for avatars
- ✅ Seed data for 8 vehicles

---

## 📝 Change Log Guidelines

When creating a new migration:
1. Increment version number (e.g., v1.0.0 → v1.1.0)
2. Create migration file: `00X_feature_name.sql`
3. Update this document with:
   - New version number and date
   - Changes made
   - New tables/columns/indexes/policies
4. Update **Migration History** section
5. Commit changes to version control

---

## 🔗 Related Documentation

- [SUPABASE_ASSISTANT_PROMPT.md](./SUPABASE_ASSISTANT_PROMPT.md) - AI prompt for backend generation
- [SUPABASE_ASSISTANT_GUIDE_TH.md](./SUPABASE_ASSISTANT_GUIDE_TH.md) - Usage guide (Thai)
- [SUPABASE.md](./SUPABASE.md) - Best practices
- [README.md](./README.md) - Project documentation

---

**Maintained by:** Rungroj Car Rental Development Team  
**Contact:** [Your Contact Info]  
**Last Schema Review:** February 10, 2026
