/** @type {import('next').NextConfig} */
const nextConfig = {
  // The "/" route handler reads public/index.html at runtime; make sure the
  // file is bundled into that serverless function.
  outputFileTracingIncludes: {
    '/': ['./public/index.html']
  },
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
  }
};

module.exports = nextConfig;
