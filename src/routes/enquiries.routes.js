import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

function clean(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

// POST /api/enquiries - Submit a general or B2B enquiry
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const name = clean(body.name, 100);
    const email = clean(body.email, 254).toLowerCase();
    const phone = clean(body.phone, 30);
    const division = clean(body.division, 80) || 'General enquiry';
    const company = clean(body.company, 120);
    const message = clean(body.message, 3000);

    if (name.length < 2 || !email.includes('@') || message.length < 5) {
      return res.status(400).json({ error: 'Please enter your name, valid email, and your inquiry details.' });
    }

    const created = await supabase.createEnquiry({
      name,
      email,
      phone,
      division,
      company,
      message,
      status: 'new'
    });

    res.status(201).json({
      success: true,
      enquiry: created,
      message: 'Thank you. Your inquiry has been routed to our division team. We will contact you shortly.'
    });
  } catch (err) {
    console.error('Enquiry submission error:', err);
    res.status(500).json({ error: 'Could not record inquiry. Please try again later.' });
  }
});

export default router;
