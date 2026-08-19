/** @type {import('next').NextConfig} */
const nextConfig = {
  // The "/" route handler reads public/index.html at runtime; make sure the
  // file is bundled into that serverless function.
  outputFileTracingIncludes: {
    '/': ['./public/index.html']
  },
  // "/index.html" is where the password gate and the admin preview link send
  // people. Left alone it serves the raw file from public/, which has neither
  // the published copy nor the social tags filled in — so it would still need
  // a client-side /api/content call per visitor. beforeFiles runs ahead of the
  // public directory, so both addresses render through the "/" handler.
  async rewrites() {
    return {
      beforeFiles: [{ source: '/index.html', destination: '/' }]
    };
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
      // The editor and the password page are part of the plumbing, not the
      // site. Now that the front door is open, keep both out of search results.
      { source: '/admin', headers: [...securityHeaders, { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] },
      { source: '/access', headers: [...securityHeaders, { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] }
    ];
  }
};

module.exports = nextConfig;
