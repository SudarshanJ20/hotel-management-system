// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Existing Unsplash
      { protocol: "https", hostname: "images.unsplash.com", port: "", pathname: "/**" },
      // Google profile images
      { protocol: "https", hostname: "lh3.googleusercontent.com", port: "", pathname: "/**" },
      // Optional fallback avatar service
      { protocol: "https", hostname: "ui-avatars.com", port: "", pathname: "/**" },
    ],
  },
};

export default nextConfig;
