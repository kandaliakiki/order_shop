/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "storage.googleapis.com" },
      { hostname: "drive.google.com" }, // Added Google Drive hostname
      { hostname: "img.clerk.com" },
    ],
  },
};

export default nextConfig;
