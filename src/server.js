import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/env.js';
import { supabase } from './config/supabase.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/products.routes.js';
import orderRoutes from './routes/orders.routes.js';
import enquiryRoutes from './routes/enquiries.routes.js';
import careerRoutes from './routes/careers.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import adminRoutes from './routes/admin.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildDir = path.join(__dirname, '../dist');

const app = express();

// Security & Logging Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allow CDN resources (Three.js, GSAP, Supabase)
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: config.corsOrigin }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Indira Industries B2B Platform',
    timestamp: new Date().toISOString()
  });
});

// Public configuration used by the React sign-in page.
app.get('/api/config', (_req, res) => {
  res.json({
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    isConfigured: supabase.isConfigured()
  });
});

// API Routes
app.use('/api/config', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/track-order', (req, res, next) => {
  // Support legacy POST /api/track-order by delegating to orderRoutes.track
  if (req.method === 'POST') {
    req.url = '/track';
    return orderRoutes(req, res, next);
  }
  next();
});
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Older page URLs now enter the React router as well.
app.get(/\.html$/, (_req, res, next) => {
  res.sendFile(path.join(frontendBuildDir, 'index.html'), err => {
    if (err) next(err);
  });
});

// Serve the compiled React app and its bundled assets.
app.use(express.static(frontendBuildDir, { index: false }));

// React handles all browser routes, including clean URLs and nested pages.
app.get('*', (_req, res, next) => {
  res.sendFile(path.join(frontendBuildDir, 'index.html'), err => {
    if (err) next(err);
  });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error.'
  });
});

// Start Server
app.listen(config.port, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    INDIRA INDUSTRIES B2B SAAS                    ║
║         Enterprise Lubricants, Chemicals & Workwear Platform     ║
╠══════════════════════════════════════════════════════════════════╣
║  🌐 Server running on: http://localhost:${config.port}                    ║
║  📦 Catalogue:         http://localhost:${config.port}/shop/               ║
║  🚚 Track Order:       http://localhost:${config.port}/track-order/        ║
║  👤 Customer Portal:   http://localhost:${config.port}/account/            ║
║  ⚙️  Admin Command:     http://localhost:${config.port}/admin/              ║
║  🤖 AI Chatbot:        Available on all pages                     ║
╚══════════════════════════════════════════════════════════════════╝
  `);
});
