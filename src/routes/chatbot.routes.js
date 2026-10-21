import { Router } from 'express';
import { config } from '../config/env.js';

const router = Router();

const SYSTEM_INSTRUCTION = `You are the official AI Assistant for Indira Industries ("The Name of Trust").
Help visitors learn about our three core divisions:
1. IINDLUBE - High-performance automotive engine oils (15W-40 CI-4, 5W-30 SP), gear oils (85W-140 GL-5), industrial hydraulic fluids (AW 68, AW 46), and lithium complex EP greases.
2. IINDPURE - Chemical & water treatment formulations, RO membrane anti-scalants, boiler chemicals, and heavy-duty degreasers.
3. IINDSTYL - Flame-retardant industrial workwear (EN ISO 11612, NFPA 2112), high-visibility safety jackets, and protective uniforms.

Key Guidelines:
- Guide visitors to the Catalogue (/shop/) to request commercial quotations.
- For orders and RFQs, explain that all requests receive an instant reference number (IND-2026-XXXX) and can be tracked at /track-order/.
- Encourage contacting our team at +91 78270 32808 or admin@indiraindustries.co.in for custom formulations.
- Be professional, concise, authoritative yet welcoming. Treat client privacy with high importance.`;

function cleanText(val, max) {
  return typeof val === 'string' ? val.trim().slice(0, max) : '';
}

// Fallback intelligent domain assistant
function getDomainResponse(prompt) {
  const q = prompt.toLowerCase();
  
  if (q.includes('lube') || q.includes('oil') || q.includes('lubricant') || q.includes('engine') || q.includes('hydraulic') || q.includes('grease')) {
    return `Indira Industries' **IINDLUBE** division manufactures premium industrial lubricants and automotive engine oils. 
Key grades include:
• **SynPro Heavy Duty 15W-40 CI-4**: High-TBN formulation for commercial fleets & construction machinery.
• **UltraSynt Full Synthetic 5W-30 SP**: Advanced cold-start engine protection for modern petrol/diesel vehicles.
• **HydroMax AW 68**: High-pressure industrial hydraulic oil with anti-wear additives.
• **LithoComplex EP-2**: High-temperature lithium complex grease (dropping point >265°C).

You can browse full specifications and add items to your RFQ cart in our [Catalogue](/shop/).`;
  }

  if (q.includes('pure') || q.includes('water') || q.includes('chemical') || q.includes('ro') || q.includes('cleaner') || q.includes('degreaser')) {
    return `Our **IINDPURE** division specializes in specialty industrial chemicals and water treatment solutions. 
Highlights:
• **ScaleInhibit RO-500**: Broad-spectrum reverse osmosis anti-scalant for industrial water purification plants.
• **Industrial Degreaser HD-Bio**: Biodegradable, alkaline heavy-duty plant and machinery cleaner.

Visit our [Catalogue](/shop/) or submit an inquiry for tailored water analysis and dosage consultations.`;
  }

  if (q.includes('styl') || q.includes('uniform') || q.includes('garment') || q.includes('cloth') || q.includes('jacket') || q.includes('coverall') || q.includes('safety') || q.includes('fr')) {
    return `Our **IINDSTYL** division produces certified industrial workwear and safety apparel:
• **ArcShield FR Coverall**: 240 GSM inherently flame-retardant Nomex/Kevlar blend meeting EN ISO 11612 and NFPA 2112 standards.
• **LuminaPro High-Vis Parka**: Weatherproof Class 3 high-visibility safety jackets with 3M Scotchlite reflective tape.

Custom corporate branding and bulk size runs are available upon request through the [Catalogue](/shop/).`;
  }

  if (q.includes('track') || q.includes('status') || q.includes('where is my order') || q.includes('order number')) {
    return `You can track the live status of any quotation or order request by visiting our [Order Tracking Portal](/track-order/). 
Simply enter your reference code (e.g., **IND-2026-XXXX**) and the email address used during submission.`;
  }

  if (q.includes('quote') || q.includes('rfq') || q.includes('price') || q.includes('buy') || q.includes('purchase')) {
    return `To request a commercial quotation:
1. Browse products in our [Catalogue](/shop/).
2. Select your required quantities and click **Add to Request**.
3. Submit your company details and delivery address in the Request Drawer.
4. You will instantly receive an **IND-2026-XXXX** reference code, and our commercial sales desk will confirm discounted batch pricing and dispatch timelines!`;
  }

  if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('address') || q.includes('location')) {
    return `You can reach Indira Industries directly:
• **Phone / WhatsApp**: ${config.companyPhone}
• **Email**: ${config.adminEmail}
• **Headquarters**: 905 Station Road, Ahmedabad, Gujarat 382440, India.
Or submit an online inquiry anytime at [Contact Us](/#contact).`;
  }

  return `Welcome to **Indira Industries**! We are a multi-division industrial conglomerate comprising:
• **IINDLUBE** — Automotive & industrial lubricants
• **IINDPURE** — Industrial chemicals & water purification
• **IINDSTYL** — Flame-retardant safety workwear & protective apparel

How can I assist you today? You can ask about product specifications, request a bulk quote, or track an active order.`;
}

router.post('/', async (req, res) => {
  const body = req.body || {};
  const message = cleanText(body.message, 2000);

  if (!message) {
    return res.status(400).json({ error: 'Please enter a message.' });
  }

  // If Gemini API Key is configured, attempt real Gemini call
  if (config.geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: [
              ...(Array.isArray(body.history) ? body.history : []).map(h => ({
                role: h.role === 'model' || h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: cleanText(h.text || h.content, 1000) }]
              })),
              { role: 'user', parts: [{ text: message }] }
            ],
            generationConfig: { temperature: 0.4, maxOutputTokens: 600 }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) return res.json({ reply });
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local expert system:', err.message);
    }
  }

  // Fallback intelligent domain engine
  const reply = getDomainResponse(message);
  res.json({ reply });
});

export default router;
