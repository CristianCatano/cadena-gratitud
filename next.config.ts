import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Permite abrir el dev server desde otros dispositivos en la red
    allowedDevOrigins: [
      "http://192.168.146.64:3000",
      "http://localhost:3000",
    ],
  },
};

export default nextConfig;