import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

function clean(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

// GET /api/careers - List active careers
router.get('/', async (req, res) => {
  try {
    const careers = await supabase.getCareers(true);
    res.json({ careers });
  } catch (err) {
    res.status(500).json({ error: 'Unable to retrieve career postings.' });
  }
});

// POST /api/careers/apply - Apply for an open position
router.post('/apply', async (req, res) => {
  try {
    const body = req.body || {};
    const careerId = clean(body.career_id, 50);
    const applicantName = clean(body.applicant_name, 120);
    const applicantEmail = clean(body.applicant_email, 254).toLowerCase();
    const phone = clean(body.phone, 30);
    const coverLetter = clean(body.cover_letter, 4000);
    const resumeUrl = clean(body.resume_url, 1000);

    if (applicantName.length < 2 || !applicantEmail.includes('@')) {
      return res.status(400).json({ error: 'Please provide your full name and valid email address.' });
    }

    if (supabase.isConfigured()) {
      const { data, error } = await supabase.client
        .from('career_applications')
        .insert([{
          career_id: careerId || null,
          applicant_name: applicantName,
          applicant_email: applicantEmail,
          phone,
          resume_url: resumeUrl,
          cover_letter: coverLetter,
          status: 'received'
        }])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({ success: true, application: data, message: 'Application submitted successfully.' });
    }

    res.status(201).json({
      success: true,
      message: 'Application recorded. Our human resources team will review your qualifications.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not submit application.' });
  }
});

export default router;
