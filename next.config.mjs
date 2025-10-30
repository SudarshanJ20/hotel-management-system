// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Prefer remotePatterns for fine-grained allowlists
    remotePatterns: [
      // Unsplash (room photos)
      { protocol: "https", hostname: "images.unsplash.com", port: "", pathname: "/**" },
      // Google profile images
      { protocol: "https", hostname: "lh3.googleusercontent.com", port: "", pathname: "/**" },
      // Fallback avatar service
      { protocol: "https", hostname: "ui-avatars.com", port: "", pathname: "/**" },
      // Optional: add your future asset CDN here
      // { protocol: "https", hostname: "cdn.yourdomain.com", port: "", pathname: "/**" },
    ],
    // Sensible defaults for layout-shift control
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60, // cache optimized images for 1 minute in dev/proxy envs
  },
  // If you deploy behind a proxy/CDN, add:
  // output: "standalone",
};

export default nextConfig;
