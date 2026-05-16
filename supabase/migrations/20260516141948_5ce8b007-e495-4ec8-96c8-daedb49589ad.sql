
-- =========================
-- Roles
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- updated_at helper
-- =========================
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =========================
-- Categories
-- =========================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '⭐',
  color TEXT NOT NULL DEFAULT 'pink',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "admins manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER set_updated_at_categories BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- Products
-- =========================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  old_price NUMERIC(10,2) CHECK (old_price IS NULL OR old_price >= 0),
  stock INT NOT NULL DEFAULT 0,
  gender TEXT NOT NULL DEFAULT 'unisex' CHECK (gender IN ('boy','girl','unisex')),
  badge TEXT CHECK (badge IN ('new','bestseller','sale')),
  images TEXT[] NOT NULL DEFAULT '{}',
  sizes TEXT[] NOT NULL DEFAULT '{}',
  colors TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(active);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can view active products" ON public.products FOR SELECT USING (active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage products" ON public.products FOR ALL USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- Shipping rates per governorate
-- =========================
CREATE TABLE public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  governorate TEXT NOT NULL UNIQUE,
  cost NUMERIC(10,2) NOT NULL CHECK (cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can view shipping" ON public.shipping_rates FOR SELECT USING (true);
CREATE POLICY "admins manage shipping" ON public.shipping_rates FOR ALL USING (public.has_role(auth.uid(),'admin'));

-- =========================
-- Coupons
-- =========================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  percent INT NOT NULL CHECK (percent BETWEEN 1 AND 100),
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can view active coupons" ON public.coupons FOR SELECT USING (active = true);
CREATE POLICY "admins manage coupons" ON public.coupons FOR ALL USING (public.has_role(auth.uid(),'admin'));

-- =========================
-- Orders + items
-- =========================
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1001;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT ('NSH-' || nextval('public.order_number_seq')::text),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  governorate TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "admins view orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete orders" ON public.orders FOR DELETE USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER set_updated_at_orders BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  size TEXT,
  color TEXT,
  qty INT NOT NULL CHECK (qty > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "admins view order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(),'admin'));

-- =========================
-- Public RPC: fetch order by order_number (for confirmation page)
-- =========================
CREATE OR REPLACE FUNCTION public.get_order_public(_order_number TEXT)
RETURNS TABLE (
  order_number TEXT, customer_name TEXT, phone TEXT, governorate TEXT, address TEXT,
  subtotal NUMERIC, shipping_cost NUMERIC, discount NUMERIC, total NUMERIC,
  status TEXT, created_at TIMESTAMPTZ
)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT order_number, customer_name, phone, governorate, address,
         subtotal, shipping_cost, discount, total, status, created_at
  FROM public.orders WHERE order_number = _order_number;
$$;

-- =========================
-- Seed: categories
-- =========================
INSERT INTO public.categories (slug, name, emoji, color, sort_order) VALUES
  ('boys', 'ملابس أولاد', '👦', 'sky', 1),
  ('girls', 'ملابس بنات', '👧', 'pink', 2),
  ('baby', 'حديثي الولادة', '👶', 'mint', 3),
  ('sleep', 'ملابس نوم', '🌙', 'sunny', 4),
  ('shoes', 'أحذية', '👟', 'pink', 5),
  ('accessories', 'إكسسوارات', '🎀', 'mint', 6),
  ('occasions', 'مناسبات وأعياد', '🎉', 'sunny', 7);

-- Seed: shipping rates for Egyptian governorates
INSERT INTO public.shipping_rates (governorate, cost) VALUES
  ('القاهرة', 50), ('الجيزة', 50), ('القليوبية', 55), ('الإسكندرية', 60),
  ('الدقهلية', 65), ('الشرقية', 65), ('الغربية', 65), ('المنوفية', 65),
  ('كفر الشيخ', 70), ('البحيرة', 70), ('دمياط', 70), ('بورسعيد', 70),
  ('الإسماعيلية', 70), ('السويس', 70), ('الفيوم', 75), ('بني سويف', 75),
  ('المنيا', 80), ('أسيوط', 85), ('سوهاج', 90), ('قنا', 95), ('الأقصر', 100),
  ('أسوان', 110), ('البحر الأحمر', 110), ('مطروح', 110), ('شمال سيناء', 120),
  ('جنوب سيناء', 120), ('الوادي الجديد', 120);

-- Seed: a sample coupon
INSERT INTO public.coupons (code, percent, active) VALUES ('WELCOME10', 10, true);
