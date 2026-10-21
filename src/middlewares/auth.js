import { supabase } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];

  // In autonomous dev mode when Supabase is not configured:
  if (!supabase.isConfigured()) {
    if (token === 'demo-admin-token' || token.startsWith('demo-')) {
      req.user = {
        id: 'admin-001',
        email: 'admin@indiraindustries.co.in',
        role: token === 'demo-admin-token' ? 'admin' : 'customer'
      };
      return next();
    }
    // Also allow any client with token to proceed in dev
    req.user = {
      id: 'demo-user-123',
      email: 'buyer@example.com',
      role: 'customer'
    };
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.client.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    }

    // Fetch user profile for role
    const { data: profile } = await supabase.admin
      .from('profiles')
      .select('role, full_name, company_name')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'customer',
      fullName: profile?.full_name || '',
      companyName: profile?.company_name || ''
    };

    next();
  } catch (err) {
    console.error('Auth verification error:', err);
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

export async function requireAdmin(req, res, next) {
  // If requireAuth hasn't run, run it or check
  if (!req.user) {
    return requireAuth(req, res, () => {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
      }
      next();
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
  }

  next();
}

// Optional Auth (for guest order checkouts with optional linking)
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  if (!supabase.isConfigured()) {
    req.user = { id: 'demo-user-123', email: 'demo@example.com', role: 'customer' };
    return next();
  }

  try {
    const { data: { user } } = await supabase.client.auth.getUser(token);
    if (user) {
      req.user = { id: user.id, email: user.email };
    }
  } catch (_) {
    req.user = null;
  }
  next();
}
