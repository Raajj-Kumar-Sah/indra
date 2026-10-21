import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function legacyHtmlRoutesToReact() {
  return {
    name: 'legacy-html-routes-to-react',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && /\.html?(?:[?#]|$)/i.test(req.url)) req.url = '/';
        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiOrigin = `http://localhost:${env.PORT || 5000}`;
  return {
    plugins: [react(), legacyHtmlRoutesToReact()],
    publicDir: false,
    build: { outDir: 'dist', emptyOutDir: true, copyPublicDir: false },
    server: {
      port: 5173,
      proxy: { '/api': apiOrigin, '/health': apiOrigin }
    }
  };
});
