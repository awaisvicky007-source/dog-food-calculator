import { defineConfig, type Plugin } from 'vite';
import { renderPage } from './src/server/render';

/** Local dev: serve the same server-rendered shell the production function returns. */
const devPage = (): Plugin => ({
  name: 'pv-dev-page',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = req.url ?? '/';
      if (url === '/' || url.startsWith('/?') || url.startsWith('/calculator')) {
        const html = await server.transformIndexHtml(
          url,
          renderPage({ jsUrl: '/src/client/main.ts', origin: 'http://localhost:5173', path: '/', dev: true }),
        );
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
        return;
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [devPage()],
  build: {
    outDir: 'dist',
    manifest: true, // dist/.vite/manifest.json -> read by scripts/upload-assets.ts
    cssCodeSplit: false, // exactly one CSS + one JS file => two Shopify assets
    target: 'es2020',
    rollupOptions: {
      input: 'src/client/main.ts',
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'app-[hash:8].js',
        assetFileNames: 'app-[hash:8][extname]',
      },
    },
  },
  test: { include: ['tests/**/*.test.ts'] },
});
