-- ==============================================================================
-- INDIRA INDUSTRIES B2B SAAS PLATFORM
-- Supabase PostgreSQL Database Schema
-- Version: 1.0.0
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Extended User Information linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  company_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'sales')),
  address_line TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  gstin TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to create profile upon new Supabase user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. DIVISIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.divisions (
  id TEXT PRIMARY KEY, -- 'IINDLUBE', 'IINDPURE', 'IINDSTYL'
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id TEXT NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(division_id, slug)
);

-- ------------------------------------------------------------------------------
-- 4. PRODUCTS (Industrial Catalogue)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division TEXT NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  price_paise INTEGER, -- Stored as integer paise (e.g. 150000 = ₹1,500.00). Null means custom quote required.
  currency TEXT NOT NULL DEFAULT 'INR',
  inventory_count INTEGER NOT NULL DEFAULT 0 CHECK (inventory_count >= 0),
  image_url TEXT,
  image_alt TEXT NOT NULL DEFAULT '',
  datasheet_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_division_active_idx ON public.products(division, active);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products(slug);

-- ------------------------------------------------------------------------------
-- 5. ORDERS & RFQs (Quotations and Commercial Requests)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE, -- e.g. IND-2026-A1B2C3D4
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT DEFAULT '',
  address TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_paise INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL DEFAULT 'quote_only' CHECK (payment_method IN ('quote_only', 'po_invoice', 'bank_transfer', 'online')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'quoted', 'invoiced', 'paid', 'cancelled')),
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'under_review', 'quoted', 'in_production', 'shipped', 'delivered', 'cancelled')),
  admin_notes TEXT DEFAULT '',
  tracking_carrier TEXT DEFAULT '',
  tracking_number TEXT DEFAULT '',
  quote_valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);

-- ------------------------------------------------------------------------------
-- 6. ENQUIRIES (B2B Leads & Distribution Inquiries)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  division TEXT NOT NULL,
  company TEXT DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS enquiries_status_idx ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS enquiries_email_idx ON public.enquiries(email);

-- ------------------------------------------------------------------------------
-- 7. CAREERS & JOB APPLICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.careers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'General',
  location TEXT NOT NULL DEFAULT 'India',
  employment_type TEXT NOT NULL DEFAULT 'Full-time',
  description TEXT NOT NULL,
  requirements TEXT NOT NULL DEFAULT '',
  apply_email TEXT NOT NULL DEFAULT 'admin@indiraindustries.co.in',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id UUID REFERENCES public.careers(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'shortlisted', 'interviewed', 'rejected', 'hired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view & edit their own profile; admins can view all
CREATE POLICY "Profiles are viewable by owner or admin"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles can be updated by owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Divisions & Categories: Public read
CREATE POLICY "Divisions are publicly readable"
  ON public.divisions FOR SELECT USING (true);

CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT USING (true);

-- Products: Public can read active products; Admins can do everything
CREATE POLICY "Active products are publicly readable"
  ON public.products FOR SELECT
  USING (active = true OR public.is_admin());

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- Orders:
-- 1. Anyone can create an order (guest RFQ or logged-in buyer)
CREATE POLICY "Anyone can create order requests"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- 2. Authenticated users can read their own orders; Admins can read all
CREATE POLICY "Users can view own orders or admins can view all"
  ON public.orders FOR SELECT
  USING (customer_id = auth.uid() OR public.is_admin());

-- 3. Admins can update orders
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- Enquiries:
CREATE POLICY "Public can submit enquiries"
  ON public.enquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read enquiries"
  ON public.enquiries FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update enquiries"
  ON public.enquiries FOR UPDATE
  USING (public.is_admin());

-- Careers:
CREATE POLICY "Active careers are publicly viewable"
  ON public.careers FOR SELECT
  USING (active = true OR public.is_admin());

CREATE POLICY "Admins manage careers"
  ON public.careers FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public can apply to careers"
  ON public.career_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins view career applications"
  ON public.career_applications FOR SELECT
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. SUPABASE STORAGE BUCKETS (Execute if storage schema is present)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Public access to product images
CREATE POLICY "Public read for product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload for product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));
