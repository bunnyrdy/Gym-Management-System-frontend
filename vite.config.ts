import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/**
 * Forward the API and the uploaded files to the backend instead of letting the
 * browser call it directly.
 *
 * This is what makes a tunnelled demo work. Vite talks to the API over
 * loopback, so from the browser's point of view there is exactly one origin:
 * no CORS entry to add, no backend port to publish, and no hostname baked into
 * the bundle. Paired with `VITE_API_BASE_URL=/api` (see .env.demo) the same
 * build runs unchanged on localhost, on a LAN address or behind a random
 * tunnel hostname.
 *
 * It is inert during ordinary development: `.env` leaves the API base as an
 * absolute `http://localhost:5023/api`, so nothing is routed through here
 * unless the demo mode is selected.
 */
const apiProxy = {
  '/api': { target: 'http://localhost:5023', changeOrigin: true },
  '/uploads': { target: 'http://localhost:5023', changeOrigin: true },
}

/**
 * Hostnames Vite will answer to.
 *
 * Vite 6 and later reject an unrecognised `Host` header outright — a defence
 * against DNS rebinding. A Cloudflare quick tunnel arrives as a different
 * random `*.trycloudflare.com` name on every run, so without this entry the
 * demo serves "Blocked request. This host is not allowed." and nothing else.
 * The leading dot matches any subdomain.
 */
const allowedHosts = ['.trycloudflare.com']

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // The API's CORS allowlist names this exact origin. Without strictPort, Vite
  // silently moves to 5174 when 5173 is busy and every API call then fails the
  // preflight — a port collision surfacing as a login bug. Fail loudly instead.
  server: {
    port: 5173,
    strictPort: true,
    proxy: apiProxy,
    allowedHosts,
  },
  // `vite preview` serves the built bundle on 4173. It is what the demo runs:
  // no HMR websocket to keep alive through a tunnel, and a production build is
  // considerably faster on a phone than the dev server.
  preview: {
    port: 4173,
    strictPort: true,
    proxy: apiProxy,
    allowedHosts,
  },
})
