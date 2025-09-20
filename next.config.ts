import type { NextConfig } from 'next';

// Permite sumar orígenes por ENV sin tocar código:
// NEXT_ALLOWED_DEV_ORIGINS=https://5002-firebase-focusflowv2-dev-1758213820870.cluster-thle3dudhffpwss7zs5hxaeu2o.cloudworkstations.dev
const coerceOrigin = (s: string) =>
  s && (s.startsWith('http://') || s.startsWith('https://')) ? s : `https://${s}`;

const envOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(coerceOrigin);

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co',        port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos',       port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'i.pravatar.cc',       port: '', pathname: '/**' },
    ],
  },
  allowedDevOrigins: [
    // 🔴 Origen exacto del warning que te salió:
    'https://5002-firebase-focusflowv2-dev-1758213820870.cluster-thle3dudhffpwss7zs5hxaeu2o.cloudworkstations.dev',
    // (opcional) otro dominio que usaste antes:
    'https://5016-firebase-focusflowv2-dev-1758213820870.cluster-thle3dudhffpwss7zs5hxaeu2o.cloudworkstations.dev',
    // App Hosting Emulator local (si lo usas):
    'http://localhost:5002',
    'http://127.0.0.1:5002',
    ...envOrigins,
  ],
};

export default nextConfig;
