# 🔧 คู่มือตั้งค่า Environment Variables

## 📋 สารบัญ
1. [Client (Frontend)](#client-frontend)
2. [Server (Backend - Email Service)](#server-backend)
3. [Netlify Deployment](#netlify-deployment)
4. [วิธีหา Supabase Keys](#วิธีหา-supabase-keys)

---

## 🎨 Client (Frontend)

### ขั้นตอนการตั้งค่า

1. **คัดลอกไฟล์ตัวอย่าง**
   ```bash
   cd client
   cp .env.example .env.local
   ```

2. **แก้ไขไฟล์ `.env.local`** และใส่ค่าจริง:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **เริ่มต้น Development Server**
   ```bash
   npm run dev
   ```

### ⚠️ ข้อควรระวัง
- ใช้ไฟล์ `.env.local` สำหรับ development (จะถูก gitignore)
- **อย่า** commit ค่าจริงขึ้น Git
- ใช้ **anon/public key** เท่านั้น (ไม่ใช่ service_role key)

---

## 📧 Server (Backend)

Server ใช้สำหรับส่งอีเมล์ยืนยันการจอง (ไม่บังคับ ถ้าไม่ต้องการส่งอีเมล์)

### ขั้นตอนการตั้งค่า

1. **คัดลอกไฟล์ตัวอย่าง**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **แก้ไขไฟล์ `.env`** และใส่ค่าจริง

### 📮 การตั้งค่า Gmail สำหรับส่งอีเมล์

#### วิธีสร้าง Gmail App Password

1. **เปิด 2-Step Verification**
   - ไปที่ https://myaccount.google.com/security
   - เลือก **"2-Step Verification"**
   - ทำตามขั้นตอนเพื่อเปิดใช้งาน

2. **สร้าง App Password**
   - ไปที่ https://myaccount.google.com/apppasswords
   - เลือก **"Mail"** และ **"Other (Custom name)"**
   - ตั้งชื่อ: `Car Rental System`
   - คัดลอก **16-digit password** ที่ได้

3. **ใส่ค่าใน .env**
   ```env
   MAIL_USER=your-email@gmail.com
   MAIL_PASS=abcd efgh ijkl mnop  # 16 ตัวที่ได้จากขั้นตอนที่ 2
   ```

4. **เริ่มต้น Server**
   ```bash
   npm start
   ```

### 📝 ตัวอย่างไฟล์ .env สำหรับ Server

```env
# Server
NODE_ENV=development
PORT=5000

# Email (Gmail)
MAIL_USER=rungroj.rental@gmail.com
MAIL_PASS=abcd efgh ijkl mnop

# ไม่ต้องใส่ (optional)
MONGO_URI=
JWT_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 🚀 Netlify Deployment

### ตั้งค่า Environment Variables บน Netlify

1. ไปที่ **Netlify Dashboard** → เลือก site
2. ไปที่ **Site settings** → **Environment variables**
3. เพิ่มตัวแปรเหล่านี้:

| Key | Value | ตัวอย่าง |
|-----|-------|----------|
| `VITE_SUPABASE_URL` | Supabase Project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key | `eyJhbGciOiJIUzI1NiIs...` |

4. กด **"Deploy"** อีกครั้ง

---

## 🔑 วิธีหา Supabase Keys

### ขั้นตอนการหา Supabase URL และ Keys

1. **เข้าสู่ Supabase Dashboard**
   - ไปที่ https://supabase.com/dashboard
   - เลือก Project ของคุณ

2. **ไปที่หน้า API Settings**
   - เมนูด้านซ้าย → **Settings** → **API**

3. **คัดลอกค่าต่อไปนี้:**

   **Project URL**
   ```
   https://abcdefghijk.supabase.co
   ```
   
   **anon public key** (ใช้สำหรับ Client)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

### ⚠️ ข้อควรระวัง

| Key Type | ใช้ที่ไหน | ความปลอดภัย |
|----------|----------|-------------|
| **anon/public** | ✅ Client (Frontend) | ปลอดภัย - สามารถเปิดเผยได้ |
| **service_role** | ⚠️ Server เท่านั้น! | **อันตราย - ห้ามใส่ใน Client** |

---

## 🛠️ Troubleshooting

### Client ไม่เชื่อมต่อ Supabase

**อาการ:** Console แสดง `⚠️ Supabase URL or Anon Key not found`

**แก้ไข:**
1. ตรวจสอบว่าไฟล์ `.env.local` อยู่ใน folder `client/`
2. ตรวจสอบว่า key ขึ้นต้นด้วย `VITE_` (เช่น `VITE_SUPABASE_URL`)
3. Restart dev server: `npm run dev`

### Server ส่งอีเมล์ไม่ได้

**อาการ:** Error `Invalid login: 535-5.7.8 Username and Password not accepted`

**แก้ไข:**
1. ตรวจสอบว่าเปิด **2-Step Verification** แล้ว
2. ใช้ **App Password** ไม่ใช่รหัสผ่าน Gmail ปกติ
3. ตรวจสอบว่าไม่มีช่องว่างใน `MAIL_PASS`

### Netlify Build ล้มเหลว

**อาการ:** Build failed with "VITE_SUPABASE_URL is not defined"

**แก้ไข:**
1. เช็คว่าใส่ Environment Variables ใน Netlify แล้ว
2. Redeploy: **Deploys** → **Trigger deploy** → **Clear cache and deploy**

---

## 📚 เอกสารเพิ่มเติม

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)

---

## 💡 Tips

1. **อย่า commit .env ขึ้น Git**
   - ใช้ `.env.local` สำหรับ local development
   - ไฟล์ `.env.local` ถูก gitignore อัตโนมัติ

2. **ใช้ Environment Variables ที่ถูกต้อง**
   - Vite: ต้องขึ้นต้นด้วย `VITE_`
   - Node.js: ไม่ต้องมี prefix

3. **แยก Keys ตาม Environment**
   - Development: `.env.local`
   - Production: Netlify Dashboard

---

**หากมีปัญหา:** ติดต่อ Developer หรือดูที่ [GitHub Issues](https://github.com/gittisak-go/gcar/issues)
