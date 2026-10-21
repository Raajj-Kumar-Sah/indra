-- ==============================================================================
-- INDIRA INDUSTRIES B2B SAAS PLATFORM
-- Supabase Database Seed Data
-- ==============================================================================

-- 1. Insert Divisions
INSERT INTO public.divisions (id, name, tagline, description, badge)
VALUES
  ('IINDLUBE', 'IINDLUBE Industrial Lubricants', 'Liquid Engineering & Tribological Excellence', 'High-performance automotive engine oils, heavy-duty transmission fluids, hydraulic systems, and industrial greases engineered for harsh operating environments.', 'AUTOMOTIVE & INDUSTRIAL'),
  ('IINDPURE', 'IINDPURE Chemical & Water Solutions', 'Precision Hygiene & Industrial Purity', 'Formulated industrial water purification additives, boiler water treatment chemicals, membrane cleaners, and institutional sanitization solutions.', 'CHEMICALS & FMCG'),
  ('IINDSTYL', 'IINDSTYL Industrial Workwear', 'Protection, Ergonomics & Corporate Distinction', 'Specialized flame-retardant industrial coveralls, anti-static work apparel, high-visibility protective uniforms, and corporate executive attire.', 'APPAREL & SAFETY')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description;

-- 2. Insert Categories
INSERT INTO public.categories (division_id, name, slug, description)
VALUES
  ('IINDLUBE', 'Engine Oils', 'engine-oils', 'High performance petrol & heavy-duty diesel engine oils'),
  ('IINDLUBE', 'Gear & Transmission', 'gear-transmission', 'Extreme pressure gear oils and transmission fluids'),
  ('IINDLUBE', 'Hydraulic Fluids', 'hydraulic-fluids', 'Anti-wear hydraulic oils for high-load mobile and plant machinery'),
  ('IINDLUBE', 'Industrial Greases', 'industrial-greases', 'High temperature lithium complex and moly greases'),
  ('IINDPURE', 'Water Treatment', 'water-treatment', 'RO membrane cleaners, scale inhibitors, and biocide formulations'),
  ('IINDPURE', 'Industrial Cleaners', 'industrial-cleaners', 'Heavy-duty degreasers, CIP solutions, and surface hygiene chemicals'),
  ('IINDSTYL', 'Flame Retardant Apparel', 'flame-retardant', 'NFPA 2112 and EN ISO 11612 compliant protective industrial coveralls'),
  ('IINDSTYL', 'Hi-Vis Safety Workwear', 'hi-vis-safety', 'Reflective industrial shirts, jackets, and safety pants')
ON CONFLICT (division_id, slug) DO NOTHING;

-- 3. Insert Products
INSERT INTO public.products (
  division, category, name, slug, description, specifications,
  price_paise, currency, inventory_count, image_url, image_alt, featured, active
)
VALUES
  -- IINDLUBE Products
  (
    'IINDLUBE',
    'Engine Oils',
    'IINDLUBE SynPro Heavy Duty 15W-40 CI-4',
    'iindlube-synpro-15w40-ci4',
    'Premium heavy-duty diesel engine oil designed for high-stress commercial fleets, construction machinery, and long-haul transport. Formulated with shear-stable polymers and high-TBN detergent technology to resist acid buildup and piston deposits.',
    '{"viscosity_grade": "SAE 15W-40", "api_standard": "CI-4 / SL", "flash_point": "230°C", "pour_point": "-30°C", "tbn": "10.5 mg KOH/g", "packaging": "20L Pail, 210L Drum", "drain_interval": "Up to 45,000 km in fleet operations"}'::jsonb,
    425000, -- ₹4,250.00 per 20L
    'INR',
    180,
    'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=800&q=80',
    'IINDLUBE Heavy Duty 15W-40 Engine Oil Drum',
    TRUE,
    TRUE
  ),
  (
    'IINDLUBE',
    'Engine Oils',
    'IINDLUBE UltraSynt Fully Synthetic 5W-30 SP/GF-6',
    'iindlube-ultrasynt-5w30-sp',
    'Advanced full-synthetic low-viscosity engine oil for turbocharged petrol and direct-injection passenger vehicles. Provides outstanding cold-start protection and maximizes fuel economy while shielding against low-speed pre-ignition (LSPI).',
    '{"viscosity_grade": "SAE 5W-30", "api_standard": "SP / ILSAC GF-6A", "flash_point": "224°C", "pour_point": "-42°C", "viscosity_index": "168", "packaging": "1L, 3.5L, 5L, 20L", "drain_interval": "15,000 km or 1 year"}'::jsonb,
    285000, -- ₹2,850.00 per 3.5L
    'INR',
    340,
    'https://images.unsplash.com/photo-1589134777092-581ecd7b8c80?auto=format&fit=crop&w=800&q=80',
    'IINDLUBE 5W-30 Engine Oil Bottle',
    TRUE,
    TRUE
  ),
  (
    'IINDLUBE',
    'Gear & Transmission',
    'IINDLUBE Hypoid Gear EP 85W-140 GL-5',
    'iindlube-hypoid-gear-85w140-gl5',
    'Heavy-duty extreme-pressure hypoid gear lubricant formulated with sulfur-phosphorus EP additives for hypoid differentials, transfer cases, and final drive axles operating under shock loads and severe high-torque conditions.',
    '{"viscosity_grade": "SAE 85W-140", "api_standard": "GL-5 / MT-1", "timken_ok_load": "60 lbs", "copper_corrosion": "1b", "packaging": "20L Pail, 210L Drum", "application": "Automotive differentials, off-highway axle drives"}'::jsonb,
    395000, -- ₹3,950.00
    'INR',
    95,
    'https://images.unsplash.com/photo-1635784063737-fb4a36294715?auto=format&fit=crop&w=800&q=80',
    'IINDLUBE Gear Oil Container',
    FALSE,
    TRUE
  ),
  (
    'IINDLUBE',
    'Hydraulic Fluids',
    'IINDLUBE HydroMax AW 68 Industrial Hydraulic',
    'iindlube-hydromax-aw68',
    'Premium anti-wear hydraulic oil with superior thermal stability, zinc-based anti-wear inhibitors, and rapid demulsibility for high-pressure vane, piston, and gear pump hydraulic systems in industrial plants.',
    '{"iso_vg": "68", "viscosity_40c": "68.2 cSt", "viscosity_index": "102", "four_ball_wear": "0.38 mm", "dielectric_strength": "32 kV", "packaging": "26L Pail, 210L Steel Drum", "standards": "DIN 51524 Part 2 (HLP), Denison HF-0"}'::jsonb,
    360000, -- ₹3,600.00
    'INR',
    210,
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'IINDLUBE Industrial Hydraulic Fluid Drum',
    TRUE,
    TRUE
  ),
  (
    'IINDLUBE',
    'Industrial Greases',
    'IINDLUBE LithoComplex EP-2 High Temp Grease',
    'iindlube-lithocomplex-ep2',
    'Multi-purpose lithium complex extreme pressure grease with a high dropping point (>260°C). Designed for wheel bearings, rolling elements, vibratory screens, and industrial electric motors subject to moisture and elevated temperatures.',
    '{"nlgi_grade": "2", "thickener_type": "Lithium Complex", "base_oil_viscosity_40c": "220 cSt", "dropping_point": "265°C", "timken_load": "55 lbs", "packaging": "1kg Tub, 18kg Pail, 180kg Drum"}'::jsonb,
    580000, -- ₹5,800.00 per 18kg pail
    'INR',
    140,
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    'IINDLUBE Lithium Complex Grease Pail',
    FALSE,
    TRUE
  ),

  -- IINDPURE Products
  (
    'IINDPURE',
    'Water Treatment',
    'IINDPURE ScaleInhibit RO-500 Membrane Anti-Scalant',
    'iindpure-scaleinhibit-ro500',
    'Broad-spectrum liquid anti-scalant formulated for reverse osmosis (RO) and nanofiltration (NF) membrane systems. Effectively controls calcium carbonate, calcium sulfate, and silica scaling at high recovery rates.',
    '{"appearance": "Clear amber liquid", "specific_gravity": "1.18 ± 0.03", "ph_neat": "4.5 - 5.5", "dosaging": "2 - 6 ppm typical", "membrane_compatibility": "Polyamide & Cellulose Acetate", "packaging": "25kg Carboy, 220kg Drum"}'::jsonb,
    490000, -- ₹4,900.00
    'INR',
    85,
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    'IINDPURE Water Treatment Chemical Carboy',
    TRUE,
    TRUE
  ),
  (
    'IINDPURE',
    'Industrial Cleaners',
    'IINDPURE Industrial Degreaser HD-Bio',
    'iindpure-degreaser-hd-bio',
    'Heavy-duty alkaline aqueous degreaser designed to penetrate and disperse heavy greases, machining coolants, carbon deposits, and industrial oils from shop floors, engine parts, and plant infrastructure.',
    '{"ph_diluted_5pct": "11.2", "biodegradability": ">90% in 28 days", "flammability": "Non-flammable", "dilution_ratio": "1:5 to 1:30 with water", "packaging": "20L Can, 200L Drum"}'::jsonb,
    295000, -- ₹2,950.00
    'INR',
    160,
    'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80',
    'IINDPURE Industrial Degreaser',
    FALSE,
    TRUE
  ),

  -- IINDSTYL Products
  (
    'IINDSTYL',
    'Flame Retardant Apparel',
    'IINDSTYL ArcShield FR Industrial Coverall 240 GSM',
    'iindstyl-arcshield-fr-coverall-240',
    'Inherently flame-retardant industrial safety boiler suit engineered with 93% Nomex / 5% Kevlar / 2% Antistatic blend. Features heavy-duty two-way brass zips, ergonomic pleating, and triple-needle structural stitching.',
    '{"fabric_weight": "240 GSM", "certifications": "EN ISO 11612 (A1+A2, B1, C1, F1), NFPA 2112", "arc_rating": "ATPV 8.4 cal/cm² (CAT 2)", "sizes": "S, M, L, XL, XXL, 3XL", "features": "Flame retardant reflective tapes, 6 functional pockets, mic loops"}'::jsonb,
    345000, -- ₹3,450.00 per unit
    'INR',
    420,
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    'IINDSTYL Flame Retardant Workwear Coverall',
    TRUE,
    TRUE
  ),
  (
    'IINDSTYL',
    'Hi-Vis Safety Workwear',
    'IINDSTYL LuminaPro Class 3 High-Visibility Parka',
    'iindstyl-luminapro-hi-vis-parka',
    'Weatherproof high-visibility industrial winter jacket with 3M Scotchlite reflective stripes, waterproof breathable membrane, and detachable thermal fleece lining for construction and logistics personnel.',
    '{"standards": "EN ISO 20471 Class 3, EN 343 Class 4:1", "waterproof_rating": "10,000 mm H2O", "retroreflective_material": "3M Scotchlite 50mm", "sizes": "M, L, XL, XXL", "outer_shell": "300D Oxford Polyester with PU Coating"}'::jsonb,
    420000, -- ₹4,200.00
    'INR',
    190,
    'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80',
    'IINDSTYL High Visibility Industrial Jacket',
    FALSE,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  specifications = EXCLUDED.specifications,
  price_paise = EXCLUDED.price_paise,
  inventory_count = EXCLUDED.inventory_count,
  image_url = EXCLUDED.image_url;

-- 4. Insert Careers
INSERT INTO public.careers (
  title, department, location, employment_type, description, requirements, apply_email, active
)
VALUES
  (
    'Senior Lubricant Formulation Chemist',
    'Research & Quality Assurance',
    'Ahmedabad, Gujarat / On-site',
    'Full-time',
    'Lead our tribology laboratory formulating next-generation synthetic lubricants, high-TBN diesel engine oils, and biodegradable hydraulic fluids. You will oversee ASTM testing, OEM homologation documentation, and field trial performance analysis.',
    'M.Sc. or Ph.D. in Organic Chemistry, Petroleum Technology, or Chemical Engineering. Minimum 5+ years experience in lubricant or additive package formulation. Thorough knowledge of ASTM, ISO, and API licensing frameworks.',
    'careers@indiraindustries.co.in',
    TRUE
  ),
  (
    'B2B Regional Industrial Sales Manager (West Zone)',
    'Commercial & Enterprise Sales',
    'Mumbai / Ahmedabad / Pune',
    'Full-time',
    'Drive institutional key-account acquisition for IINDLUBE and IINDPURE across manufacturing plants, steel mills, automotive tier-1 suppliers, and power generation facilities. Lead contract negotiations and manage technical support teams.',
    'B.Tech / B.E. in Mechanical or Chemical Engineering with MBA in Marketing. 6+ years proven B2B sales track record in industrial consumables, lubricants, or specialty chemicals. Existing network in industrial clusters is a strong plus.',
    'careers@indiraindustries.co.in',
    TRUE
  ),
  (
    'Industrial Operations & Supply Chain Coordinator',
    'Supply Chain & Plant Logistics',
    'Ahmedabad Plant, Gujarat',
    'Full-time',
    'Oversee batch scheduling, raw material inventory reconciliation (base oils, polymer thickeners, additive packages), commercial dispatch logistics, and statutory tanker transit compliance.',
    'Degree in Supply Chain Management, Logistics, or Industrial Engineering. 3+ years experience in automated plant dispatch and ERP inventory control.',
    'careers@indiraindustries.co.in',
    TRUE
  )
ON CONFLICT DO NOTHING;

-- 5. Insert Sample Demo Orders & Enquiries
INSERT INTO public.enquiries (name, email, phone, division, company, message, status)
VALUES
  ('Rajesh Mehta', 'rmehta@gujaratmetals.com', '+91 98250 11223', 'IINDLUBE', 'Gujarat Metal Forming Ltd', 'Requesting bulk quotation for 12 drums of HydroMax AW 68 hydraulic oil and delivery lead time to Vadodara plant.', 'new'),
  ('Sunil Deshmukh', 's.deshmukh@maharashtratex.in', '+91 98200 44556', 'IINDSTYL', 'Maharashtra Textiles Corporation', 'We require 350 units of ArcShield FR Coveralls with customized company embroidered badges. Please share catalog and size specs.', 'contacted')
ON CONFLICT DO NOTHING;

INSERT INTO public.orders (
  order_number, customer_email, customer_name, phone, company_name, address, notes,
  items, subtotal_paise, payment_method, payment_status, status, tracking_carrier, tracking_number
)
VALUES
  (
    'IND-2026-DEMO01',
    'buyer@acmeind.com',
    'Vikram Sharma',
    '+91 98765 43210',
    'Acme Heavy Engineering Corp',
    'Plot 42, GIDC Industrial Estate, Sanand, Gujarat 382170',
    'Urgent requirement for plant maintenance overhaul. Please provide delivery challan.',
    '[{"product_id": "seed-1", "name": "IINDLUBE SynPro Heavy Duty 15W-40 CI-4", "division": "IINDLUBE", "quantity": 4, "unit_price_paise": 425000, "currency": "INR"}, {"product_id": "seed-4", "name": "IINDLUBE HydroMax AW 68 Industrial Hydraulic", "division": "IINDLUBE", "quantity": 2, "unit_price_paise": 360000, "currency": "INR"}]'::jsonb,
    2420000, -- ₹24,200.00
    'po_invoice',
    'invoiced',
    'in_production',
    'BlueDart Surface Cargo',
    'BD78291039IN'
  )
ON CONFLICT (order_number) DO NOTHING;
