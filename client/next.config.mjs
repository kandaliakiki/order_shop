/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/testing/:path*",
        destination: "http://localhost:8080/api/testing/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      { hostname: "storage.googleapis.com" },
      { hostname: "drive.google.com" }, // Added Google Drive hostname
      { hostname: "img.clerk.com" },
    ],
  },
};

export default nextConfig;
