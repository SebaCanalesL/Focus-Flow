// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    const origins = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    if (!origins.length) return [];
    return [{
      source: '/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: origins.join(',') },
        { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,POST,PUT,PATCH,DELETE' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
      ],
    }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
    ],
  },
};
export default nextConfig;
