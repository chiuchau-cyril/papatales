/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to Backend
      },
      {
        source: '/story/:path*',
        destination: 'http://127.0.0.1:8000/story/:path*', // Proxy to Story API
      },
    ];
  },
};

export default nextConfig;
