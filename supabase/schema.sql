-- ================================================
-- เป๋าตังค์ (Paotang) - Supabase Database Schema
-- รัน SQL นี้ใน Supabase Dashboard > SQL Editor
-- ================================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  points      INTEGER NOT NULL DEFAULT 0,
  tier        TEXT NOT NULL DEFAULT 'Silver' CHECK (tier IN ('Silver', 'Gold', 'Platinum')),
  initials    TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  is_admin    BOOLEAN NOT NULL DEFAULT false,   -- admin flag
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL DEFAULT 45,
  emoji       TEXT NOT NULL DEFAULT '🍊',
  image_path  TEXT,                             -- path เช่น /menu/som-sainumpeung.jpg
  category    TEXT NOT NULL DEFAULT 'orange',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  detail      TEXT NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  address_id   UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  total        INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'preparing', 'delivering', 'done', 'cancelled')),
  note         TEXT,
  use_points   BOOLEAN DEFAULT false,
  points_used  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id         UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  menu_item_name       TEXT NOT NULL,
  menu_item_emoji      TEXT NOT NULL DEFAULT '🍊',
  quantity             INTEGER NOT NULL DEFAULT 1,
  unit_price           INTEGER NOT NULL
);

-- 6. Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, menu_item_id)
);

-- ================================================
-- Auto-create profile on new user signup
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, initials)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 2))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- Helper: ตรวจสอบว่า user เป็น admin
-- ================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ================================================
-- Row Level Security (RLS)
-- ================================================
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items   ENABLE ROW LEVEL SECURITY;

-- Profiles: users see/edit own | admin sees all
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id OR public.is_admin());

-- Addresses: own only | admin sees all
DROP POLICY IF EXISTS "addresses_own" ON public.addresses;
CREATE POLICY "addresses_own" ON public.addresses
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Orders: own only | admin sees all
DROP POLICY IF EXISTS "orders_own" ON public.orders;
CREATE POLICY "orders_own" ON public.orders
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "order_items_own" ON public.order_items;
CREATE POLICY "order_items_own" ON public.order_items
  FOR ALL USING (
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Favorites: own only
DROP POLICY IF EXISTS "favorites_own" ON public.favorites;
CREATE POLICY "favorites_own" ON public.favorites
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Menu items: anyone can read | only admin can write
DROP POLICY IF EXISTS "menu_items_read" ON public.menu_items;
CREATE POLICY "menu_items_read" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_admin_write" ON public.menu_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ================================================
-- Seed: เมนูผลไม้ปอก (ราคา 45 บาท)
-- ================================================
INSERT INTO public.menu_items (name, description, price, emoji, image_path, category) VALUES
  ('ส้มสายน้ำผึ้ง',    'ส้มสายน้ำผึ้งปอกสดๆ หวานฉ่ำ ไม่มีเม็ด เต็มกล่อง',          45, '🍊', '/menu/som-sainumpeung.jpg',   'orange'),
  ('ส้มโชกุน',          'ส้มโชกุนนำเข้า หวานอมเปรี้ยวนิดๆ ฉ่ำมาก เนื้อแน่น',        45, '🍊', '/menu/som-chokun.jpg',         'orange'),
  ('สับปะรดห้วยมุ่น',   'สับปะรดห้วยมุ่นแท้ หวานมาก ไม่ฝาด เนื้อกรอบ คัดเกรด A',    45, '🍍', '/menu/sapparod-huaymun.jpg',   'pineapple'),
  ('สับปะรดภูเก็ต',     'สับปะรดภูเก็ตพันธุ์แท้ หวานหอม เนื้อเหลืองทอง',            45, '🍍', '/menu/sapparod-phuket.jpg',    'pineapple'),
  ('แตงโม Box',         'แตงโมตัดเป็นชิ้นสี่เหลี่ยม สีแดงสด หวานฉ่ำ เต็มกล่อง',     45, '🍉', '/menu/tangmo-box.jpg',         'watermelon'),
  ('แตงโม Ball',        'แตงโมตักเป็นลูกบอลกลมน่ารัก หวานฉ่ำ พรีเมียม',             45, '🍉', '/menu/tangmo-ball.jpg',        'watermelon'),
  ('แอปเปิ้ลฟูจิ',      'แอปเปิ้ลฟูจินำเข้าญี่ปุ่น หวานกรอบ เนื้อแน่น ตัดพร้อมทาน', 45, '🍎', '/menu/apple-fuji.jpg',         'apple'),
  ('มะละกอสุก',         'มะละกอสุกหวาน เนื้อสีส้มสวย หวานธรรมชาติ ตัดดอกลายสวย',    45, '🍈', '/menu/malako.jpg',             'other'),
  ('ลำไยควั่นเมล็ด',    'ลำไยสดควั่นเมล็ดเรียบร้อย หวานหอม ทานสะดวก ไม่เลอะมือ',    45, '🍈', '/menu/lamyai.jpg',             'other')
ON CONFLICT DO NOTHING;

-- ================================================
-- Admin user setup
-- หลังจากรัน SQL นี้แล้ว ให้:
-- 1. ไปที่ Supabase Dashboard > Authentication > Users
-- 2. สร้าง user ด้วย email: admin@paotang.com, password: paotang26
-- 3. Copy UUID ของ user นั้นมา
-- 4. รัน SQL ด้านล่างต่อ (แทน <ADMIN_UUID>):
-- ================================================
-- UPDATE public.profiles
-- SET is_admin = true, name = 'Admin', initials = 'AD'
-- WHERE id = '<ADMIN_UUID>';
