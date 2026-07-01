import type { MetadataRoute } from "next";

// Manifeste PWA — permet l'installation sur l'écran d'accueil (Android & iOS).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rose Annonce",
    short_name: "Rose Annonce",
    description: "Trouvez et proposez des services près de chez vous au Cameroun.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "fr",
    background_color: "#DCE7DA",
    theme_color: "#173A28",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
