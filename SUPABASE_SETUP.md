# Indira Industries ?" Supabase Setup Guide

This guide walks you through connecting this production-ready Indira Industries B2B SaaS platform to your own **Supabase** project in under 3 minutes.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose your project name (e.g. `indira-industries`) and database password.
4. Select your preferred AWS region (e.g., `ap-south-1` Mumbai if located in India).

---

## 2. Run Database Schema & Seeds

1. Open your Supabase Dashboard and go to the **SQL Editor** tab (in the left navigation bar).
2. Click **+ New Query**.
3. Open `supabase/schema.sql` from this project, copy all contents, paste it into the SQL Editor, and click **Run**.
   - This creates all required tables: `profiles`, `divisions`, `categories`, `products`, `orders`, `enquiries`, `careers`, `career_applications`.
   - It sets up Row Level Security (RLS) policies, triggers, and storage buckets.
4. Open `supabase/seed.sql`, copy all contents, paste into a new query, and click **Run**.
   - This seeds initial divisions (IINDLUBE, IINDPURE, IINDSTYL), enterprise products with technical specifications, job openings, and sample quotes.

---

## 3. Storage Buckets Configuration

The `supabase/schema.sql` script creates the following storage buckets automatically:
- `product-images` (Public bucket for product photos and illustrations)
- `documents` (Public bucket for Technical Data Sheets TDS & MSDS)
- `resumes` (Private bucket for career applicant resumes)

If your project doesn't have storage extensions auto-enabled, you can create them in **Storage -> New Bucket**:
1. Bucket name: `product-images`, set **Public bucket** to `ON`.
2. Bucket name: `documents`, set **Public bucket** to `ON`.
3. Bucket name: `resumes`, set **Public bucket** to `OFF`.

---

## 4. Get Your API Credentials

In the Supabase Dashboard:
1. Go to **Project Settings** (gear icon) -> **API**.
2. Copy:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **anon / public key** (safe for browser and server)
   - **service_role key** (secret key with admin bypass, used only by server-side admin endpoints)

---

## 5. Configure Your Local `.env`

Edit the `.env` file in `indira-industries-saas/`:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional Gemini API Key for AI Customer Support Chatbot
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 6. Run the Application

```bash
npm install
npm run dev
```

Visit:
- Main Platform & 3D Experience: `http://localhost:5000`
- Product Catalogue & Quote Cart: `http://localhost:5000/shop/`
- Order & Quote Tracking: `http://localhost:5000/track-order/`
- Customer Portal: `http://localhost:5000/account/`
- SaaS Admin Command Center: `http://localhost:5000/admin/`

> **Note:** If you run the project without setting Supabase keys, the platform runs in **Autonomous Dev Mode** with a built-in mock database so you can test all features, 3D animations, orders, and dashboards immediately!
