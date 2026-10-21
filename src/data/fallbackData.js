export const initialDivisions = [
  {
    id: 'IINDLUBE',
    name: 'IINDLUBE Industrial Lubricants',
    tagline: 'Liquid Engineering & Tribological Excellence',
    description: 'High-performance automotive engine oils, heavy-duty transmission fluids, hydraulic systems, and industrial greases engineered for harsh operating environments.',
    badge: 'AUTOMOTIVE & INDUSTRIAL',
    active: true
  },
  {
    id: 'IINDPURE',
    name: 'IINDPURE Chemical & Water Solutions',
    tagline: 'Precision Hygiene & Industrial Purity',
    description: 'Formulated industrial water purification additives, boiler water treatment chemicals, membrane cleaners, and institutional sanitization solutions.',
    badge: 'CHEMICALS & FMCG',
    active: true
  },
  {
    id: 'IINDSTYL',
    name: 'IINDSTYL Industrial Workwear',
    tagline: 'Protection, Ergonomics & Corporate Distinction',
    description: 'Specialized flame-retardant industrial coveralls, anti-static work apparel, high-visibility protective uniforms, and corporate executive attire.',
    badge: 'APPAREL & SAFETY',
    active: true
  }
];

export const initialCategories = [
  { id: 'cat-1', division_id: 'IINDLUBE', name: 'Engine Oils', slug: 'engine-oils', active: true },
  { id: 'cat-2', division_id: 'IINDLUBE', name: 'Gear & Transmission', slug: 'gear-transmission', active: true },
  { id: 'cat-3', division_id: 'IINDLUBE', name: 'Hydraulic Fluids', slug: 'hydraulic-fluids', active: true },
  { id: 'cat-4', division_id: 'IINDLUBE', name: 'Industrial Greases', slug: 'industrial-greases', active: true },
  { id: 'cat-5', division_id: 'IINDPURE', name: 'Water Treatment', slug: 'water-treatment', active: true },
  { id: 'cat-6', division_id: 'IINDPURE', name: 'Industrial Cleaners', slug: 'industrial-cleaners', active: true },
  { id: 'cat-7', division_id: 'IINDSTYL', name: 'Flame Retardant Apparel', slug: 'flame-retardant', active: true },
  { id: 'cat-8', division_id: 'IINDSTYL', name: 'Hi-Vis Safety Workwear', slug: 'hi-vis-safety', active: true }
];

export const initialProducts = [
  {
    id: 'prod-001',
    division: 'IINDLUBE',
    category: 'Engine Oils',
    name: 'IINDLUBE SynPro Heavy Duty 15W-40 CI-4',
    slug: 'iindlube-synpro-15w40-ci4',
    description: 'Premium heavy-duty diesel engine oil designed for high-stress commercial fleets, construction machinery, and long-haul transport. Resists acid buildup and piston deposits.',
    specifications: {
      viscosity_grade: 'SAE 15W-40',
      api_standard: 'CI-4 / SL',
      flash_point: '230°C',
      pour_point: '-30°C',
      tbn: '10.5 mg KOH/g',
      packaging: '20L Pail, 210L Drum'
    },
    price_paise: 425000,
    currency: 'INR',
    inventory_count: 180,
    image_url: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=800&q=80',
    image_alt: 'IINDLUBE Heavy Duty 15W-40 Engine Oil Drum',
    featured: true,
    active: true,
    created_at: new Date('2026-01-10T10:00:00Z').toISOString(),
    updated_at: new Date('2026-01-10T10:00:00Z').toISOString()
  },
  {
    id: 'prod-002',
    division: 'IINDLUBE',
    category: 'Engine Oils',
    name: 'IINDLUBE UltraSynt Fully Synthetic 5W-30 SP/GF-6',
    slug: 'iindlube-ultrasynt-5w30-sp',
    description: 'Advanced full-synthetic low-viscosity engine oil for turbocharged petrol and direct-injection passenger vehicles. Provides cold-start protection and maximizes fuel economy.',
    specifications: {
      viscosity_grade: 'SAE 5W-30',
      api_standard: 'SP / ILSAC GF-6A',
      flash_point: '224°C',
      pour_point: '-42°C',
      viscosity_index: '168',
      packaging: '1L, 3.5L, 5L, 20L'
    },
    price_paise: 285000,
    currency: 'INR',
    inventory_count: 340,
    image_url: 'https://images.unsplash.com/photo-1589134777092-581ecd7b8c80?auto=format&fit=crop&w=800&q=80',
    image_alt: 'IINDLUBE 5W-30 Engine Oil Bottle',
    featured: true,
    active: true,
    created_at: new Date('2026-01-12T10:00:00Z').toISOString(),
    updated_at: new Date('2026-01-12T10:00:00Z').toISOString()
  },
  {
    id: 'prod-003',
    division: 'IINDLUBE',
    category: 'Gear & Transmission',
    name: 'IINDLUBE Hypoid Gear EP 85W-140 GL-5',
    slug: 'iindlube-hypoid-gear-85w140-gl5',
    description: 'Heavy-duty extreme-pressure hypoid gear lubricant formulated with sulfur-phosphorus EP additives for hypoid differentials and high-torque axle drives.',
    specifications: {
      viscosity_grade: 'SAE 85W-140',
      api_standard: 'GL-5 / MT-1',
      timken_ok_load: '60 lbs',
      packaging: '20L Pail, 210L Drum'
    },
    price_paise: 395000,
    currency: 'INR',
    inventory_count: 95,
    image_url: 'https://images.unsplash.com/photo-1635784063737-fb4a36294715?auto=format&fit=crop&w=800&q=80',
    image_alt: 'IINDLUBE Gear Oil Container',
    featured: false,
    active: true,
    created_at: new Date('2026-01-14T10:00:00Z').toISOString(),
    updated_at: new Date('2026-01-14T10:00:00Z').toISOString()
  },
  {
    id: 'prod-004',
    division: 'IINDLUBE',
    category: 'Hydraulic Fluids',
    name: 'IINDLUBE HydroMax AW 68 Industrial Hydraulic',
    slug: 'iindlube-hydromax-aw68',
    description: 'Premium anti-wear hydraulic oil with superior thermal stability, zinc-based anti-wear inhibitors, and rapid demulsibility for high-pressure plant machinery.',
    specifications: {
      iso_vg: '68',
      viscosity_40c: '68.2 cSt',
      viscosity_index: '102',
      standards: 'DIN 51524 Part 2 (HLP), Denison HF-0',
      packaging: '26L Pail, 210L Drum'
    },
    price_paise: 360000,
    currency: 'INR',
    inventory_count: 210,
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    image_alt: 'IINDLUBE Industrial Hydraulic Fluid Drum',
    featured: true,
    active: true,
    created_at: new Date('2026-01-15T10:00:00Z').toISOString(),
    updated_at: new Date('2026-01-15T10:00:00Z').toISOString()
  },
  {
    id: 'prod-005',
    division: 'IINDLUBE',
    category: 'Industrial Greases',
    name: 'IINDLUBE LithoComplex EP-2 High Temp Grease',
    slug: 'iindlube-lithocomplex-ep2',
    description: 'Multi-purpose lithium complex extreme pressure grease with dropping point >260°C. Designed for wheel bearings and rolling elements under elevated temperatures.',
    specifications: {
      nlgi_grade: '2',
      thickener_type: 'Lithium Complex',
      dropping_point: '265°C',
      timken_load: '55 lbs',
      packaging: '1kg Tub, 18kg Pail, 180kg Drum'
    },
    price_paise: 580000,
    currency: 'INR',
    inventory_count: 140,
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    image_alt: 'IINDLUBE Lithium Complex Grease Pail',
    featured: false,
    active: true,
    created_at: new Date('2026-01-16T10:00:00Z').toISOString(),
    updated_at: new Date('2026-01-16T10:00:00Z').toISOString()
  },
  {
    id: 'prod-006',
    division: 'IINDPURE',
    category: 'Water Treatment',
    name: 'IINDPURE ScaleInhibit RO-500 Membrane Anti-Scalant',
    slug: 'iindpure-scaleinhibit-ro500',
    description: 'Broad-spectrum liquid anti-scalant formulated for reverse osmosis (RO) systems. Effectively controls calcium carbonate, sulfate, and silica scaling.',
    specifications: {
      appearance: 'Clear amber liquid',
      specific_gravity: '1.18 ± 0.03',
      ph_neat: '4.5 - 5.5',
      membrane_compatibility: 'Polyamide & Cellulose Acetate',
      packaging: '25kg Carboy, 220kg Drum'
    },
    price_paise: 490000,
    currency: 'INR',
    inventory_count: 85,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    image_alt: 'IINDPURE Water Treatment Chemical Carboy',
    featured: true,
    active: true,
    created_at: new Date('2026-01-18T10:00:00Z').toISOString(),
    updated_at: new Date('2026-01-18T10:00:00Z').toISOString()
  },
  {
    id: 'prod-007',
    division: 'IINDSTYL',
    category: 'Flame Retardant Apparel',
    name: 'IINDSTYL ArcShield FR Industrial Coverall 240 GSM',
    slug: 'iindstyl-arcshield-fr-coverall-240',
    description: 'Inherently flame-retardant industrial safety boiler suit with 93% Nomex / 5% Kevlar / 2% Antistatic blend. Features two-way brass zips and ergonomic pleating.',
    specifications: {
      fabric_weight: '240 GSM',
      certifications: 'EN ISO 11612, NFPA 2112',
      arc_rating: 'ATPV 8.4 cal/cm² (CAT 2)',
      sizes: 'S, M, L, XL, XXL, 3XL'
    },
    price_paise: 345000,
    currency: 'INR',
    inventory_count: 420,
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    image_alt: 'IINDSTYL Flame Retardant Workwear Coverall',
    featured: true,
    active: true,
    created_at: new Date('2026-01-20T10:00:00Z').toISOString(),
    updated_at: new Date('2026-01-20T10:00:00Z').toISOString()
  }
];

export const initialCareers = [
  {
    id: 'job-001',
    title: 'Senior Lubricant Formulation Chemist',
    department: 'Research & Quality Assurance',
    location: 'Ahmedabad, Gujarat / On-site',
    employment_type: 'Full-time',
    description: 'Lead our tribology laboratory formulating next-generation synthetic lubricants, high-TBN diesel engine oils, and biodegradable hydraulic fluids.',
    requirements: 'M.Sc. or Ph.D. in Chemistry / Petroleum Technology. Minimum 5+ years experience in lubricant formulation.',
    apply_email: 'careers@indiraindustries.co.in',
    active: true,
    created_at: new Date('2026-01-05T10:00:00Z').toISOString(),
    updated_at: new Date('2026-01-05T10:00:00Z').toISOString()
  },
  {
    id: 'job-002',
    title: 'B2B Regional Industrial Sales Manager (West Zone)',
    department: 'Commercial & Enterprise Sales',
    location: 'Mumbai / Ahmedabad / Pune',
    employment_type: 'Full-time',
    description: 'Drive institutional key-account acquisition for IINDLUBE and IINDPURE across manufacturing plants, steel mills, and automotive tier-1 suppliers.',
    requirements: 'B.Tech / B.E. + MBA in Marketing. 6+ years proven B2B sales track record in industrial consumables.',
    apply_email: 'careers@indiraindustries.co.in',
    active: true,
    created_at: new Date('2026-01-08T10:00:00Z').toISOString(),
    updated_at: new Date('2026-01-08T10:00:00Z').toISOString()
  }
];

export const initialOrders = [
  {
    id: 'order-001',
    order_number: 'IND-2026-DEMO01',
    customer_email: 'buyer@acmeind.com',
    customer_name: 'Vikram Sharma',
    phone: '+91 98765 43210',
    company_name: 'Acme Heavy Engineering Corp',
    address: 'Plot 42, GIDC Industrial Estate, Sanand, Gujarat 382170',
    notes: 'Urgent requirement for plant maintenance overhaul. Please provide delivery challan.',
    items: [
      { product_id: 'prod-001', name: 'IINDLUBE SynPro Heavy Duty 15W-40 CI-4', division: 'IINDLUBE', quantity: 4, unit_price_paise: 425000, currency: 'INR' },
      { product_id: 'prod-004', name: 'IINDLUBE HydroMax AW 68 Industrial Hydraulic', division: 'IINDLUBE', quantity: 2, unit_price_paise: 360000, currency: 'INR' }
    ],
    subtotal_paise: 2420000,
    currency: 'INR',
    payment_method: 'po_invoice',
    payment_status: 'invoiced',
    status: 'in_production',
    tracking_carrier: 'BlueDart Surface Cargo',
    tracking_number: 'BD78291039IN',
    created_at: new Date('2026-01-22T08:30:00Z').toISOString(),
    updated_at: new Date('2026-01-22T14:15:00Z').toISOString()
  }
];

export const initialEnquiries = [
  {
    id: 'enq-001',
    name: 'Rajesh Mehta',
    email: 'rmehta@gujaratmetals.com',
    phone: '+91 98250 11223',
    division: 'IINDLUBE',
    company: 'Gujarat Metal Forming Ltd',
    message: 'Requesting bulk quotation for 12 drums of HydroMax AW 68 hydraulic oil and delivery lead time to Vadodara plant.',
    status: 'new',
    created_at: new Date('2026-01-24T09:12:00Z').toISOString()
  },
  {
    id: 'enq-002',
    name: 'Sunil Deshmukh',
    email: 's.deshmukh@maharashtratex.in',
    phone: '+91 98200 44556',
    division: 'IINDSTYL',
    company: 'Maharashtra Textiles Corporation',
    message: 'We require 350 units of ArcShield FR Coveralls with customized company embroidered badges. Please share catalog and size specs.',
    status: 'contacted',
    created_at: new Date('2026-01-25T11:45:00Z').toISOString()
  }
];
