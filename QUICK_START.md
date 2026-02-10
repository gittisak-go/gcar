# 🚀 Quick Start: Supabase AI Backend Setup

## เริ่มต้นใช้งานใน 3 ขั้นตอน

### 1️⃣ คัดลอกพรอมต์
เปิดไฟล์ **`SUPABASE_ASSISTANT_PROMPT.md`** → กด `Ctrl+A` → `Ctrl+C`

### 2️⃣ วางใน Supabase AI
ไปที่ Supabase Dashboard → SQL Editor → วางพรอมต์ → ส่ง

### 3️⃣ Deploy Backend
รัน migrations ที่ AI สร้างให้ → เสร็จสิ้น! ✅

---

## 📄 ไฟล์ในโปรเจกต์

| ไฟล์ | วัตถุประสงค์ |
|------|-------------|
| **SUPABASE_ASSISTANT_PROMPT.md** | พรอมต์สำหรับ AI (copy & paste) |
| **SUPABASE_ASSISTANT_GUIDE_TH.md** | คู่มือฉบับเต็ม (ภาษาไทย) |
| **README.md** | คู่มือโปรเจกต์หลัก |
| **SUPABASE.md** | แนวทางการใช้ Supabase |

---

## ✨ สิ่งที่จะได้

- ✅ Database Schema ครบถ้วน 7 ตาราง
- ✅ Row Level Security (RLS)
- ✅ Realtime subscriptions
- ✅ Storage buckets (avatars)
- ✅ Business logic (auto-calculate, overlap check)
- ✅ Triggers & Functions
- ✅ Indexes สำหรับ performance

---

## 🔗 ลิงก์ที่เป็นประโยชน์

- 📖 [คู่มือการใช้งานฉบับเต็ม](./SUPABASE_ASSISTANT_GUIDE_TH.md)
- 📋 [พรอมต์สำหรับ AI](./SUPABASE_ASSISTANT_PROMPT.md)
- 🌐 [Supabase Dashboard](https://supabase.com/dashboard)
- 📚 [Supabase Docs](https://supabase.com/docs)

---

## ⚡ คำสั่งที่ใช้บ่อย

```bash
# เริ่มต้น Supabase local
supabase start

# สร้าง migration ใหม่
supabase migration new feature_name

# Deploy migrations
supabase db push

# Reset database (ระวัง!)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts
```

---

## 🆘 ต้องการความช่วยเหลือ?

อ่านคู่มือฉบับเต็ม: **[SUPABASE_ASSISTANT_GUIDE_TH.md](./SUPABASE_ASSISTANT_GUIDE_TH.md)**

พร้อมแล้ว เริ่มสร้าง Backend กันเลย! 🎉
