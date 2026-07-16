/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
    ];
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/admin', headers: [...securityHeaders, { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] }
    ];
  },
  async rewrites() {
    // Serve the single design at the bare domain so the address stays clean
    // (no "/index.html" in the URL). A rewrite keeps the path as "/" instead
    // of redirecting to the file.
    return [
      { source: '/', destination: '/index.html' }
    ];
  }
};

module.exports = nextConfig;
