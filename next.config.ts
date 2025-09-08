import type { NextConfig } from "next";

// Nota: Next.js 15 muestra un warning si detecta múltiples lockfiles y puede inferir mal la raíz.
// Fijamos explícitamente la raíz de Turbopack a la carpeta del proyecto para evitar errores de chunks.
const nextConfig: NextConfig = {
  turbopack: {
    // __dirname apunta a la carpeta donde está este archivo (la raíz del proyecto)
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
