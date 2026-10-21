import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';
import {
  initialDivisions,
  initialCategories,
  initialProducts,
  initialCareers,
  initialOrders,
  initialEnquiries
} from '../data/fallbackData.js';

let supabaseClient = null;
let supabaseAdminClient = null;

const isConfigured = Boolean(
  config.supabaseUrl &&
  config.supabaseAnonKey &&
  config.supabaseUrl.startsWith('http')
);

if (isConfigured) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
    if (config.supabaseServiceRoleKey) {
      supabaseAdminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
    } else {
      supabaseAdminClient = supabaseClient;
    }
    console.log('✅ Connected to Supabase at:', config.supabaseUrl);
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set in .env. Running in Autonomous In-Memory Mode.');
}

// In-Memory store for autonomous development / fallback mode
const memStore = {
  divisions: [...initialDivisions],
  categories: [...initialCategories],
  products: [...initialProducts],
  careers: [...initialCareers],
  orders: [...initialOrders],
  enquiries: [...initialEnquiries],
  profiles: [
    {
      id: 'admin-001',
      email: 'admin@indiraindustries.co.in',
      full_name: 'System Administrator',
      role: 'admin',
      company_name: 'Indira Industries'
    }
  ]
};

export const supabase = {
  client: supabaseClient,
  admin: supabaseAdminClient,
  isConfigured() {
    return isConfigured && Boolean(supabaseClient);
  },

  // --------------------------------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------------------------------
  async getProducts({ division, category, search, activeOnly = true } = {}) {
    if (this.isConfigured()) {
      let query = supabaseClient.from('products').select('*');
      if (activeOnly) query = query.eq('active', true);
      if (division) query = query.eq('division', division);
      if (category) query = query.eq('category', category);
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      query = query.order('division', { ascending: true }).order('name', { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    // In-Memory Fallback
    return memStore.products.filter(p => {
      if (activeOnly && !p.active) return false;
      if (division && p.division !== division) return false;
      if (category && p.category !== category) return false;
      if (search) {
        const s = search.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(s);
        const matchDesc = (p.description || '').toLowerCase().includes(s);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  },

  async getProductByIdOrSlug(idOrSlug) {
    if (this.isConfigured()) {
      const isUUID = /^[0-9a-fA-F-]{36}$/.test(idOrSlug);
      const query = isUUID
        ? supabaseClient.from('products').select('*').eq('id', idOrSlug).single()
        : supabaseClient.from('products').select('*').eq('slug', idOrSlug).single();
      const { data, error } = await query;
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }

    return memStore.products.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
  },

  async createProduct(productData) {
    if (this.isConfigured()) {
      const { data, error } = await supabaseAdminClient
        .from('products')
        .insert([productData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const newProd = {
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: true,
      inventory_count: 0,
      specifications: {},
      ...productData
    };
    memStore.products.unshift(newProd);
    return newProd;
  },

  async updateProduct(id, updates) {
    if (this.isConfigured()) {
      const { data, error } = await supabaseAdminClient
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const index = memStore.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    memStore.products[index] = {
      ...memStore.products[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return memStore.products[index];
  },

  async deleteProduct(id) {
    if (this.isConfigured()) {
      const { error } = await supabaseAdminClient.from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    const index = memStore.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    memStore.products.splice(index, 1);
    return true;
  },

  // --------------------------------------------------------------------------
  // ORDERS & RFQs
  // --------------------------------------------------------------------------
  async getOrders({ customerId, customerEmail } = {}) {
    if (this.isConfigured()) {
      let query = supabaseAdminClient.from('orders').select('*').order('created_at', { ascending: false });
      if (customerId) query = query.eq('customer_id', customerId);
      else if (customerEmail) query = query.eq('customer_email', customerEmail.toLowerCase());
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    return memStore.orders.filter(o => {
      if (customerId && o.customer_id === customerId) return true;
      if (customerEmail && (o.customer_email || '').toLowerCase() === customerEmail.toLowerCase()) return true;
      if (!customerId && !customerEmail) return true;
      return false;
    });
  },

  async getOrderByNumber(orderNumber, email = null) {
    if (this.isConfigured()) {
      let query = supabaseClient.from('orders').select('*').eq('order_number', orderNumber);
      if (email) query = query.eq('customer_email', email.toLowerCase());
      const { data, error } = await query.single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }

    return memStore.orders.find(o => {
      const matchNum = o.order_number.toUpperCase() === orderNumber.toUpperCase();
      if (!matchNum) return false;
      if (email && o.customer_email.toLowerCase() !== email.toLowerCase()) return false;
      return true;
    }) || null;
  },

  async createOrder(orderData) {
    if (this.isConfigured()) {
      const { data, error } = await supabaseAdminClient
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const newOrder = {
      id: 'order-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'received',
      payment_status: 'pending',
      ...orderData
    };
    memStore.orders.unshift(newOrder);
    return newOrder;
  },

  async updateOrder(id, updates) {
    if (this.isConfigured()) {
      const { data, error } = await supabaseAdminClient
        .from('orders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const index = memStore.orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    memStore.orders[index] = {
      ...memStore.orders[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return memStore.orders[index];
  },

  // --------------------------------------------------------------------------
  // ENQUIRIES
  // --------------------------------------------------------------------------
  async getEnquiries() {
    if (this.isConfigured()) {
      const { data, error } = await supabaseAdminClient
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }

    return [...memStore.enquiries];
  },

  async createEnquiry(enquiryData) {
    if (this.isConfigured()) {
      const { data, error } = await supabaseClient
        .from('enquiries')
        .insert([enquiryData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const newEnq = {
      id: 'enq-' + Date.now(),
      created_at: new Date().toISOString(),
      status: 'new',
      ...enquiryData
    };
    memStore.enquiries.unshift(newEnq);
    return newEnq;
  },

  async updateEnquiry(id, updates) {
    if (this.isConfigured()) {
      const { data, error } = await supabaseAdminClient
        .from('enquiries')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const index = memStore.enquiries.findIndex(e => e.id === id);
    if (index === -1) return null;
    memStore.enquiries[index] = { ...memStore.enquiries[index], ...updates };
    return memStore.enquiries[index];
  },

  // --------------------------------------------------------------------------
  // CAREERS
  // --------------------------------------------------------------------------
  async getCareers(activeOnly = true) {
    if (this.isConfigured()) {
      let query = supabaseClient.from('careers').select('*').order('created_at', { ascending: false });
      if (activeOnly) query = query.eq('active', true);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }

    return memStore.careers.filter(c => (activeOnly ? c.active : true));
  },

  async createCareer(careerData) {
    if (this.isConfigured()) {
      const { data, error } = await supabaseAdminClient
        .from('careers')
        .insert([careerData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const newCareer = {
      id: 'job-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: true,
      ...careerData
    };
    memStore.careers.unshift(newCareer);
    return newCareer;
  },

  async updateCareer(id, updates) {
    if (this.isConfigured()) {
      const { data, error } = await supabaseAdminClient
        .from('careers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const index = memStore.careers.findIndex(c => c.id === id);
    if (index === -1) return null;
    memStore.careers[index] = { ...memStore.careers[index], ...updates };
    return memStore.careers[index];
  },

  async deleteCareer(id) {
    if (this.isConfigured()) {
      const { error } = await supabaseAdminClient.from('careers').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    const index = memStore.careers.findIndex(c => c.id === id);
    if (index === -1) return false;
    memStore.careers.splice(index, 1);
    return true;
  },

  // --------------------------------------------------------------------------
  // STORAGE
  // --------------------------------------------------------------------------
  async uploadFile(bucket, filePath, fileBuffer, mimeType) {
    if (this.isConfigured() && supabaseAdminClient) {
      const { data, error } = await supabaseAdminClient.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });
      if (error) throw error;
      const { data: publicData } = supabaseAdminClient.storage.from(bucket).getPublicUrl(filePath);
      return publicData?.publicUrl || '';
    }

    // In dev fallback, encode as data URL or mock path
    return `data:${mimeType};base64,${fileBuffer.toString('base64').slice(0, 200)}...`;
  }
};
