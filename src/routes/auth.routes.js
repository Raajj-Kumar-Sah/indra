import { Router } from 'express';
import { config } from '../config/env.js';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Expose public Supabase configuration to frontend client
router.get('/config', (req, res) => {
  res.json({
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    isConfigured: supabase.isConfigured()
  });
});

// Demo login helper for autonomous dev mode
router.post('/demo-login', (req, res) => {
  const { role = 'customer', email = 'buyer@acme.test' } = req.body || {};
  const isAdmin = role === 'admin' || email.includes('admin');
  
  res.json({
    token: isAdmin ? 'demo-admin-token' : 'demo-customer-token',
    user: {
      id: isAdmin ? 'admin-001' : 'demo-user-123',
      email: isAdmin ? 'admin@indiraindustries.co.in' : email,
      role: isAdmin ? 'admin' : 'customer',
      fullName: isAdmin ? 'System Administrator' : 'Demo Customer',
      companyName: isAdmin ? 'Indira Industries' : 'Acme Engineering'
    }
  });
});

// Get current user profile
router.get('/profile', requireAuth, async (req, res) => {
  if (!supabase.isConfigured()) {
    return res.json({ profile: req.user });
  }

  try {
    const { data: profile, error } = await supabase.client
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json({ profile: profile || req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/profile', requireAuth, async (req, res) => {
  const { full_name, company_name, phone, address_line, city, state, postal_code, gstin } = req.body || {};
  
  if (!supabase.isConfigured()) {
    req.user.fullName = full_name || req.user.fullName;
    req.user.companyName = company_name || req.user.companyName;
    return res.json({ profile: req.user, message: 'Profile updated in dev mode.' });
  }

  try {
    const { data, error } = await supabase.client
      .from('profiles')
      .update({
        full_name,
        company_name,
        phone,
        address_line,
        city,
        state,
        postal_code,
        gstin,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ profile: data, message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
