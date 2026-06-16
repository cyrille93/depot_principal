/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Autorise l'envoi de quelques photos compressées avec l'annonce
      bodySizeLimit: "8mb",
    },
  },
  images: {
    // À remplacer par votre domaine CDN une fois le stockage objet choisi (Phase 0 - Chantier B)
    remotePatterns: [],
  },
};
export default nextConfig;
