import { Router } from 'express';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.js';

const router = Router();

function clean(val, max) {
  return typeof val === 'string' ? val.trim().slice(0, max) : '';
}

// POST /api/orders - Create an RFQ / Order Request
router.post('/', optionalAuth, async (req, res) => {
  try {
    const body = req.body || {};
    const customerName = clean(body.customer_name, 100);
    const customerEmail = clean(body.email || body.customer_email || req.user?.email, 254).toLowerCase();
    const phone = clean(body.phone, 30);
    const companyName = clean(body.company_name, 120);
    const address = clean(body.address, 1000);
    const notes = clean(body.notes, 1500);

    if (customerName.length < 2 || !customerEmail.includes('@') || phone.length < 7 || address.length < 6) {
      return res.status(400).json({
        error: 'Please provide full contact name, valid work email, phone number, and delivery/plant address.'
      });
    }

    if (!Array.isArray(body.items) || body.items.length < 1) {
      return res.status(400).json({ error: 'Please add at least one catalogue item to your quotation request.' });
    }

    // Resolve items and calculate pricing
    const catalog = await supabase.getProducts({ activeOnly: true });
    const resolvedItems = [];
    let subtotalPaise = 0;
    let quoteOnly = false;

    for (const item of body.items) {
      const prod = catalog.find(p => p.id === item.id || p.slug === item.id);
      if (!prod) continue;

      const qty = Math.max(1, Math.min(10000, Number(item.quantity) || 1));
      const unitPrice = prod.price_paise;

      if (Number.isSafeInteger(unitPrice) && unitPrice > 0) {
        subtotalPaise += unitPrice * qty;
      } else {
        quoteOnly = true;
      }

      resolvedItems.push({
        product_id: prod.id,
        name: prod.name,
        division: prod.division,
        category: prod.category,
        quantity: qty,
        unit_price_paise: unitPrice,
        currency: prod.currency || 'INR'
      });
    }

    if (resolvedItems.length === 0) {
      return res.status(400).json({ error: 'Selected products are not currently active in the catalogue.' });
    }

    // Generate unique industrial order reference number: e.g. IND-2026-F4B91D2C
    const uniqueSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
    const orderNumber = `IND-${new Date().getFullYear()}-${uniqueSuffix}`;

    const orderRecord = {
      order_number: orderNumber,
      customer_id: req.user?.id || null,
      customer_email: customerEmail,
      customer_name: customerName,
      company_name: companyName,
      phone,
      address,
      notes,
      items: resolvedItems,
      subtotal_paise: subtotalPaise,
      currency: 'INR',
      payment_method: quoteOnly ? 'quote_only' : (body.payment_method || 'po_invoice'),
      payment_status: 'pending',
      status: 'received',
      tracking_carrier: '',
      tracking_number: ''
    };

    const created = await supabase.createOrder(orderRecord);

    res.status(201).json({
      order: created,
      pricing: quoteOnly ? 'custom_quote_required' : 'estimate_provided',
      message: 'Your commercial quotation request has been recorded. Our industrial sales team will verify batch availability and dispatch specifications.'
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message || 'Could not record quotation request.' });
  }
});

// GET /api/orders - Get customer orders (Authenticated)
router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await supabase.getOrders({
      customerId: req.user.id,
      customerEmail: req.user.email
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Unable to retrieve requests.' });
  }
});

// POST /api/orders/track OR POST /api/track-order - Public tracking lookup
router.post('/track', async (req, res) => {
  try {
    const { order_number, email } = req.body || {};
    const ref = clean(order_number, 50).toUpperCase();
    const customerEmail = clean(email, 254).toLowerCase();

    if (!ref || !customerEmail) {
      return res.status(400).json({ error: 'Please enter both the order reference (e.g. IND-2026-XXXX) and your email address.' });
    }

    const order = await supabase.getOrderByNumber(ref, customerEmail);
    if (!order) {
      return res.status(404).json({
        error: 'No commercial request found matching that reference number and email address. Please check and try again.'
      });
    }

    res.json({
      order: {
        order_number: order.order_number,
        customer_name: order.customer_name,
        status: order.status,
        payment_status: order.payment_status,
        items: order.items,
        subtotal_paise: order.subtotal_paise,
        tracking_carrier: order.tracking_carrier,
        tracking_number: order.tracking_number,
        created_at: order.created_at,
        updated_at: order.updated_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not lookup order status.' });
  }
});

export default router;
