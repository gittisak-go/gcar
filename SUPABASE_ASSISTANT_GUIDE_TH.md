# คู่มือใช้งาน Supabase AI Assistant สำหรับโปรเจกต์ Car Rental

## 📌 ภาพรวม
เอกสารนี้จะช่วยให้คุณใช้ Supabase AI Assistant สร้าง Backend แบบอัตโนมัติสำหรับระบบเช่ารถ โดยมีฟีเจอร์ครบถ้วนตามมาตรฐานสากล

---

## 🎯 สิ่งที่จะได้รับ

เมื่อใช้พรอมต์ที่เตรียมไว้ คุณจะได้ Backend ที่มี:

### ✅ ฐานข้อมูล (Database)
- ✨ ตารางครบถ้วน 7 ตาราง: profiles, vehicles, reservations, payments, id_verifications, security_actions, vehicle_device_links
- 🔐 Row Level Security (RLS) แบบมืออาชีพ
- ⚡ Indexes สำหรับ performance
- 🤖 Triggers สำหรับ automation (คำนวณราคาอัตโนมัติ, ตรวจสอบ overlap)
- 🕐 Timestamps (created_at, updated_at) ทุกตาราง

### 🔐 ระบบ Authentication & Authorization
- 👤 Supabase Auth สำหรับล็อกอิน/สมัครสมาชิก
- 👥 ระบบ Role-based: customer, staff, super_admin, auditor
- 🛡️ RLS ป้องกันการเข้าถึงข้อมูลที่ไม่ได้รับอนุญาต
- 📱 Auto-create profile เมื่อสมัครสมาชิก

### 📁 File Storage
- 🖼️ Avatar upload ระบบ folder-based (`user-avatars/{user_id}/*`)
- 🔒 RLS บน Storage Bucket
- 📝 เก็บ URL ในตาราง profiles

### ⚡ Realtime Updates
- 📡 Broadcast channels สำหรับอัปเดตแบบ real-time
- 🔔 User-specific channels: `user-reservations-{user_id}`
- 🌐 Admin channels: `reservation::events`, `vehicle::events`
- 🎣 Hooks พร้อมใช้ในโค้ด frontend

### 🚀 Edge Functions (Optional)
- 📧 ส่งอีเมลยืนยันการจอง
- 💰 ประมวลผล payments
- 📊 Reports และ analytics

### 📈 Business Logic
- 💵 คำนวณราคาอัตโนมัติ (วัน × ราคาต่อวัน)
- 🚫 ป้องกันการจองที่ทับซ้อน (overlap detection)
- 🚗 อัปเดตสถานะรถอัตโนมัติ (available ↔ rented)
- ✅ Validation ทางฐานข้อมูล

---

## 🚀 วิธีใช้งาน

### ขั้นตอนที่ 1: เปิดไฟล์พรอมต์
เปิดไฟล์ `SUPABASE_ASSISTANT_PROMPT.md` ในโปรเจกต์นี้

### ขั้นตอนที่ 2: คัดลอกทั้งหมด
กด `Ctrl+A` (Windows/Linux) หรือ `Cmd+A` (Mac) เพื่อเลือกทั้งหมด จากนั้นกด `Ctrl+C` หรือ `Cmd+C` เพื่อคัดลอก

### ขั้นตอนที่ 3: เข้า Supabase Dashboard
1. ไปที่ https://supabase.com/dashboard
2. เลือกโปรเจกต์ของคุณ หรือสร้างโปรเจกต์ใหม่
3. คลิก **SQL Editor** ในเมนูด้านซ้าย

### ขั้นตอนที่ 4: วางพรอมต์
1. เปิด AI Assistant ใน Supabase (ถ้ามี) หรือใช้ AI tool อื่นๆ ที่รองรับ
2. วางพรอมต์ที่คัดลอกมา (`Ctrl+V` หรือ `Cmd+V`)
3. ส่งข้อความ

### ขั้นตอนที่ 5: รอการสร้าง
AI จะสร้างไฟล์และโค้ดต่างๆ ให้คุณ รวมถึง:
- 📄 Migration files (SQL)
- 📋 RLS policies
- 📊 Indexes
- 🔧 Triggers และ Functions
- 📡 Realtime setup
- 🗂️ Storage policies

### ขั้นตอนที่ 6: ตรวจสอบและ Deploy
1. ตรวจสอบไฟล์ที่ AI สร้างให้
2. รัน migrations ใน SQL Editor หรือผ่าน CLI:
   ```bash
   supabase db push
   ```
3. ทดสอบการทำงาน

---

## 🎓 สิ่งที่ควรรู้

### 🔑 Environment Variables ที่ต้องใช้

**สำหรับ Client (Frontend):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**สำหรับ Server (Backend/Edge Functions - ถ้ามี):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **คำเตือน:** ห้ามเปิดเผย `SERVICE_ROLE_KEY` ในโค้ด frontend หรือ commit ลง Git เด็ดขาด!

### 📍 ตำแหน่งไฟล์

```
car-rental-main/
├── supabase/
│   ├── migrations/           # ไฟล์ SQL สำหรับสร้างตาราง
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_calculate_reservation_total.sql
│   │   └── 00X_new_feature.sql (ที่จะสร้างใหม่)
│   ├── functions/            # Edge Functions (optional)
│   │   ├── send-email/
│   │   └── _shared/
│   └── config.toml           # การตั้งค่า Supabase
├── client/
│   └── src/
│       └── lib/
│           └── supabase.js   # Supabase client config
└── SUPABASE_ASSISTANT_PROMPT.md  # พรอมต์สำหรับ AI
```

### 🔍 การตรวจสอบว่า Backend ทำงาน

#### 1. ตรวจสอบตาราง
```sql
-- ใน SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

ควรเห็น: `profiles`, `vehicles`, `reservations`, `payments`, `id_verifications`, `security_actions`, `vehicle_device_links`

#### 2. ตรวจสอบ RLS
```sql
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

ควรเห็นหลาย policies สำหรับแต่ละตาราง

#### 3. ตรวจสอบ Indexes
```sql
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public';
```

ควรเห็น indexes บน `user_id`, `vehicle_id`, `status`, etc.

#### 4. ทดสอบการทำงาน
```sql
-- ทดสอบ trigger คำนวณราคา
INSERT INTO reservations (user_id, vehicle_id, pickup_date, dropoff_date)
VALUES (
  auth.uid(),
  (SELECT id FROM vehicles LIMIT 1),
  NOW(),
  NOW() + INTERVAL '3 days'
);

-- ตรวจสอบว่า total_price ถูกคำนวณอัตโนมัติ
SELECT id, total_price FROM reservations ORDER BY created_at DESC LIMIT 1;
```

---

## 🛠️ การปรับแต่งเพิ่มเติม

### เพิ่มฟีเจอร์ใหม่
1. สร้างไฟล์ migration ใหม่: `00X_feature_name.sql`
2. ปฏิบัติตามรูปแบบใน MIGRATION TEMPLATE (ดูในพรอมต์)
3. รัน migration: `supabase db push`

### เพิ่ม Edge Function
1. สร้างโฟลเดอร์: `supabase/functions/function-name/`
2. สร้างไฟล์ `index.ts` ตามตัวอย่างในพรอมต์
3. Deploy: `supabase functions deploy function-name`

### ปรับแต่ง RLS Policy
```sql
-- ตัวอย่าง: เพิ่ม policy ให้ staff เห็นข้อมูลทั้งหมด
CREATE POLICY "payments_select_staff" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'super_admin')
    )
  );
```

---

## 📚 เอกสารอ้างอิง

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)

---

## 🐛 Troubleshooting

### ปัญหา: Migration ไม่ทำงาน
**วิธีแก้:**
```bash
# Reset database (ระวัง: จะลบข้อมูลทั้งหมด!)
supabase db reset

# Re-apply migrations
supabase db push
```

### ปัญหา: RLS บล็อกการเข้าถึง
**วิธีแก้:**
```sql
-- ตรวจสอบว่า user มี profile
SELECT * FROM profiles WHERE id = auth.uid();

-- ถ้าไม่มี ให้สร้าง
INSERT INTO profiles (id) VALUES (auth.uid());
```

### ปัญหา: Realtime ไม่ทำงาน
**วิธีแก้:**
1. ตรวจสอบว่า Realtime เปิดใช้งานในโปรเจกต์
2. ตรวจสอบว่า channel name ถูกต้อง
3. ตรวจสอบว่า trigger สำหรับ broadcast ถูกสร้างแล้ว

---

## 💡 เคล็ดลับ

1. **Version Control:** Commit migration files ลง Git เสมอ
2. **Local Development:** ใช้ `supabase start` สำหรับทดสอบก่อน deploy
3. **Type Safety:** Generate TypeScript types: `supabase gen types typescript`
4. **Performance:** ตรวจสอบ query performance ด้วย `EXPLAIN ANALYZE`
5. **Security:** ตรวจสอบ RLS policies ก่อน production เสมอ

---

## 🎉 สรุป

พรอมต์ที่เตรียมไว้ให้จะสร้าง Backend ที่:
- ✅ ปลอดภัย (RLS, role-based access)
- ⚡ เร็ว (indexes, optimized queries)
- 🔄 Real-time ready
- 📈 Scalable
- 🧪 Production-ready

เพียงคัดลอก → วาง → Deploy! 🚀

---

**ทีมพัฒนา Rungroj Car Rental**  
Version: 1.0.0  
Last Updated: February 10, 2026
