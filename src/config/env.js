import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  storageBucketProducts: process.env.SUPABASE_STORAGE_BUCKET_PRODUCTS || 'product-images',
  storageBucketDocs: process.env.SUPABASE_STORAGE_BUCKET_DOCS || 'documents',
  
  // AI Chatbot
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  
  // Business Defaults
  adminEmail: process.env.ADMIN_EMAIL || 'admin@indiraindustries.co.in',
  salesEmail: process.env.SALES_EMAIL || 'sales@indiraindustries.co.in',
  companyPhone: process.env.COMPANY_PHONE || '+91 78270 32808',
  companyName: 'Indira Industries'
};
