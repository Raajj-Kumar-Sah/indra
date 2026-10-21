# Indira Industries

Full-stack B2B catalogue and quotation platform. The frontend is a React single-page application built with Vite. Express serves the API and the compiled React app. Supabase provides authentication, PostgreSQL data, and storage; the optional in-memory fallback supports local development.

## Stack

- React 19 and Vite 8
- Express 4 API
- Supabase Auth, PostgreSQL, and Storage
- Node.js 20.19+ or 22.12+

## Project layout

```text
frontend/
  assets/       # Imported images and other frontend assets
  pages/        # React route screens and UI components
  styles/       # Brand, page, and responsive stylesheets
  main.jsx      # React app entry point
src/
  config/       # Environment and Supabase setup
  middlewares/  # Authentication and authorization
  routes/       # Express API routes
  server.js     # API and production frontend server
supabase/       # Database schema and seed data
dist/           # Generated React production build
index.html      # Minimal Vite document and React mount point
vite.config.js  # Build and local API proxy settings
```

The old page files in `public/` are no longer served or imported by the app. React renders the homepage, catalogue, login, account requests, tracking, careers, legal pages, and admin command center. Styles and the logo are under `frontend/` and are bundled into `dist/`.

## Local development

```bash
npm ci
npm run dev
```

Vite runs at `http://localhost:5173` and proxies `/api` and `/health` to Express, which defaults to port `5000`. Set `PORT` in `.env` to use another port.

## Production

Set the deployment environment variables, then build and start the server:

```bash
npm ci
npm run build
npm start
```

Express serves the generated files from `dist/` and forwards clean browser routes to the React app. Deployments must run the build step before starting the production server.

## Environment

Copy `.env.example` to `.env` and configure Supabase for persistent data and real authentication:

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=optional-chatbot-key
```

Without Supabase credentials, local development uses the existing in-memory sample data and demo login endpoints. Demo authentication is intended for development only.

## Main routes

- `/` — company homepage and enquiry form
- `/shop/` — product catalogue and quotation request cart
- `/login` — customer and admin sign-in
- `/account/orders/` — customer request history
- `/track-order/` — public order tracking
- `/careers/` — active job listings
- `/admin/` — admin management screens
- `/legal/privacy/` and `/legal/terms/` — legal information
- `/health` — service health response
