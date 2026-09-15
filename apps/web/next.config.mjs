/** @type {import('next').NextConfig} */
const isVercel = Boolean(process.env.VERCEL);

const nextConfig = {
  // Use static export for local CLI server, and standard Next.js on Vercel
  ...(isVercel ? {} : { output: 'export', trailingSlash: true }),
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
