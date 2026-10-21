import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { requireAdmin } from '../middlewares/auth.js';
import { config } from '../config/env.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB
});

// Protect all admin routes
router.use(requireAdmin);

// ----------------------------------------------------------------------------
// 1. SAAS KPI METRICS & ANALYTICS
// ----------------------------------------------------------------------------
router.get('/metrics', async (req, res) => {
  try {
    const products = await supabase.getProducts({ activeOnly: false });
    const orders = await supabase.getOrders();
    const enquiries = await supabase.getEnquiries();

    const totalPipelinePaise = orders.reduce((sum, o) => sum + (o.subtotal_paise || 0), 0);
    const activeProducts = products.filter(p => p.active).length;
    const pendingOrders = orders.filter(o => o.status === 'received' || o.status === 'under_review').length;
    const newEnquiries = enquiries.filter(e => e.status === 'new').length;
    
    // Division breakdown
    const divisionStats = {
      IINDLUBE: { products: 0, orders: 0 },
      IINDPURE: { products: 0, orders: 0 },
      IINDSTYL: { products: 0, orders: 0 }
    };

    products.forEach(p => {
      if (divisionStats[p.division]) divisionStats[p.division].products++;
    });

    orders.forEach(o => {
      (o.items || []).forEach(item => {
        if (divisionStats[item.division]) divisionStats[item.division].orders++;
      });
    });

    res.json({
      metrics: {
        totalOrders: orders.length,
        totalPipelinePaise,
        totalPipelineFormatted: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalPipelinePaise / 100),
        activeProducts,
        totalProducts: products.length,
        pendingOrders,
        newEnquiries,
        totalEnquiries: enquiries.length,
        conversionRate: orders.length > 0 ? Math.round((orders.filter(o => o.status === 'delivered' || o.status === 'shipped').length / orders.length) * 100) : 0,
        divisionStats
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate SaaS metrics.' });
  }
});

// ----------------------------------------------------------------------------
// 2. PRODUCT MANAGEMENT & SUPABASE STORAGE UPLOADS
// ----------------------------------------------------------------------------
router.get('/products', async (req, res) => {
  try {
    const products = await supabase.getProducts({ activeOnly: false });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch catalogue.' });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `products/${fileName}`;

    const publicUrl = await supabase.uploadFile(
      config.storageBucketProducts,
      filePath,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({
      success: true,
      url: publicUrl,
      fileName
    });
  } catch (err) {
    console.error('Storage upload error:', err);
    res.status(500).json({ error: err.message || 'Image upload failed.' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.name || !body.division || !body.category) {
      return res.status(400).json({ error: 'Product name, division, and category are required.' });
    }

    const slug = (body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const product = await supabase.createProduct({
      division: body.division,
      category: body.category,
      name: body.name.trim(),
      slug,
      description: body.description || '',
      specifications: body.specifications || {},
      price_paise: body.price_paise !== undefined ? Number(body.price_paise) : null,
      currency: 'INR',
      inventory_count: Number(body.inventory_count) || 0,
      image_url: body.image_url || null,
      image_alt: body.image_alt || body.name,
      featured: Boolean(body.featured),
      active: body.active !== false
    });

    res.status(201).json({ product, message: 'Product created successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not create product.' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const updated = await supabase.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found.' });
    res.json({ product: updated, message: 'Product updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not update product.' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const success = await supabase.deleteProduct(req.params.id);
    if (!success) return res.status(404).json({ error: 'Product not found.' });
    res.json({ success: true, message: 'Product deleted from catalogue.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not delete product.' });
  }
});

// ----------------------------------------------------------------------------
// 3. ORDERS & COMMERCIAL RFQS MANAGEMENT
// ----------------------------------------------------------------------------
router.get('/orders', async (req, res) => {
  try {
    const orders = await supabase.getOrders();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const { status, payment_status, subtotal_paise, tracking_carrier, tracking_number, admin_notes } = req.body || {};
    const updates = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;
    if (subtotal_paise !== undefined) updates.subtotal_paise = Number(subtotal_paise);
    if (tracking_carrier !== undefined) updates.tracking_carrier = tracking_carrier;
    if (tracking_number !== undefined) updates.tracking_number = tracking_number;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const updated = await supabase.updateOrder(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Order not found.' });
    res.json({ order: updated, message: 'Order status updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not update order.' });
  }
});

// ----------------------------------------------------------------------------
// 4. ENQUIRIES & LEADS CRM
// ----------------------------------------------------------------------------
router.get('/enquiries', async (req, res) => {
  try {
    const enquiries = await supabase.getEnquiries();
    res.json({ enquiries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load enquiries.' });
  }
});

router.put('/enquiries/:id', async (req, res) => {
  try {
    const { status, admin_notes } = req.body || {};
    const updated = await supabase.updateEnquiry(req.params.id, { status, admin_notes });
    if (!updated) return res.status(404).json({ error: 'Enquiry not found.' });
    res.json({ enquiry: updated, message: 'Lead updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not update lead.' });
  }
});

// ----------------------------------------------------------------------------
// 5. CAREERS & APPLICANTS MANAGEMENT
// ----------------------------------------------------------------------------
router.get('/careers', async (req, res) => {
  try {
    const careers = await supabase.getCareers(false);
    res.json({ careers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch careers.' });
  }
});

router.post('/careers', async (req, res) => {
  try {
    const created = await supabase.createCareer(req.body);
    res.status(201).json({ career: created, message: 'Career role posted.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not post career role.' });
  }
});

router.put('/careers/:id', async (req, res) => {
  try {
    const updated = await supabase.updateCareer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Career role not found.' });
    res.json({ career: updated, message: 'Career role updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not update career role.' });
  }
});

router.delete('/careers/:id', async (req, res) => {
  try {
    const success = await supabase.deleteCareer(req.params.id);
    if (!success) return res.status(404).json({ error: 'Role not found.' });
    res.json({ success: true, message: 'Career role removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not remove career role.' });
  }
});

export default router;
