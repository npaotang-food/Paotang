# เป๋าตังค์ (Paotang) 🧋

แอปสั่งอาหารและเครื่องดื่มสไตล์ไทย — Next.js + Supabase + Vercel

## 🚀 เริ่มต้นใช้งาน

### 1. ติดตั้ง dependencies
```bash
cd packages/web
npm install --legacy-peer-deps
```

### 2. ตั้งค่า .env.local
```bash
# สร้างไฟล์ packages/web/.env.local
# ใส่ค่าจาก Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. ตั้งค่า Supabase Database
รัน SQL ใน Supabase Dashboard > SQL Editor:
```
supabase/schema.sql
```

### 4. รัน Development Server
```bash
cd packages/web
npm run dev
```
เปิด [http://localhost:3000](http://localhost:3000)

## 📦 โครงสร้างโปรเจกต์

```
Paotang/
├── packages/
│   ├── web/           # Next.js 14 Web App
│   │   ├── app/       # Pages (Home, Profile, Checkout, etc.)
│   │   ├── components/# UI Components
│   │   ├── context/   # Auth + Cart Context
│   │   └── lib/       # Supabase clients
│   ├── mobile/        # Expo React Native (coming soon)
│   └── shared/        # Shared TypeScript types
└── supabase/
    └── schema.sql     # Database schema + RLS policies
```

## 🛠 Tech Stack
- **Web**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deploy**: Vercel

## 🌐 Deploy กับ Vercel

1. Push ขึ้น GitHub
2. Import repo ใน [vercel.com](https://vercel.com)
3. ตั้งค่า Root Directory: `packages/web`
4. เพิ่ม Environment Variables จาก `.env.local`
5. Deploy!
