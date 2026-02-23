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
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  price       INTEGER NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '🧋',
  category    TEXT NOT NULL DEFAULT 'recommend',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Menu Options (size variations)
CREATE TABLE IF NOT EXISTS public.menu_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  price_addon INTEGER NOT NULL DEFAULT 0
);

-- 4. Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  detail      TEXT NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  address_id  UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  total       INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'preparing', 'delivering', 'done', 'cancelled')),
  note        TEXT,
  use_points  BOOLEAN DEFAULT false,
  points_used INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id  UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  menu_item_name TEXT NOT NULL,
  menu_item_emoji TEXT NOT NULL DEFAULT '🧋',
  option_label  TEXT,
  option_price_addon INTEGER DEFAULT 0,
  quantity      INTEGER NOT NULL DEFAULT 1,
  unit_price    INTEGER NOT NULL
);

-- 7. Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
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
-- Row Level Security (RLS)
-- ================================================
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_options ENABLE ROW LEVEL SECURITY;

-- Profiles: users can see/edit own profile
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Addresses: own only
CREATE POLICY "addresses_own" ON public.addresses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Orders: own only
CREATE POLICY "orders_own" ON public.orders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "order_items_own" ON public.order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Favorites: own only
CREATE POLICY "favorites_own" ON public.favorites
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Menu items/options: anyone can read
CREATE POLICY "menu_items_read" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "menu_options_read" ON public.menu_options FOR SELECT USING (true);

-- ================================================
-- Seed menu items
-- ================================================
INSERT INTO public.menu_items (name, description, price, emoji, category) VALUES
  ('ชาไทยซีส', 'ชาไทยรสเข้มข้นยอดฮิต เพิ่มความนัวด้วยชีสนุ่มๆ อร่อยแบบไทยๆ', 50, '🧋', 'recommend'),
  ('สตอเบอร์รีลาเต้', 'นมสตอเบอร์รีเปรี้ยวหวานสดชื่น แยกชั้นสวยงาม', 35, '🍓', 'recommend'),
  ('ชาชีสลิ้นจี่', 'ชาลิ้นจี่รสละมุน หอมกลิ่นผลไม้เมืองร้อน', 85, '🍵', 'recommend'),
  ('พายบานอฟฟี่', 'พายตกแต่งด้วยกล้วยหอม คาราเมลซอสและวิปครีม', 150, '🍰', 'recommend'),
  ('มัทฉะลาเต้', 'มัทฉะญี่ปุ่นแท้ ผสมนมสดเนื้อเนียน', 75, '🍃', 'tea'),
  ('โฮจิฉะลาเต้', 'ชาโฮจิฉะคั่วหอม ผสมนมอุ่นๆ กลมกล่อม', 70, '🌾', 'tea')
ON CONFLICT DO NOTHING;
