import type { Config } from "tailwindcss";

/**
 * Tailwind est branché sur les variables CSS de la charte (globals.css).
 * On n'écrit JAMAIS un hex en dur : on passe par ces tokens.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        foret: "var(--vert-foret)",
        "foret-fonce": "var(--vert-foret-fonce)",
        feuille: "var(--vert-feuille)",
        "feuille-clair": "var(--vert-feuille-clair)",
        "sur-vert": "var(--sur-vert)",
        page: "var(--fond-page)",
        media: "var(--fond-media)",
        carte: "var(--surface-carte)",
        neutre: "var(--surface-neutre)",
        "tint-succes": "var(--tint-succes)",
        "tint-succes-2": "var(--tint-succes-2)",
        "texte-succes": "var(--texte-succes)",
        "action-verte": "var(--action-verte)",
        etoile: "var(--etoile)",
        vip: "var(--vip)",
        principal: "var(--texte-principal)",
        secondaire: "var(--texte-secondaire)",
        tertiaire: "var(--texte-tertiaire)",
        "sur-foret": "var(--texte-sur-foret)",
        "sur-foret-mute": "var(--texte-sur-foret-mute)",
        bordure: "var(--bordure)",
        "bordure-forte": "var(--bordure-forte)",
        "pill-fond": "var(--pill-neutre-fond)",
        "pill-texte": "var(--pill-neutre-texte)",
      },
      fontFamily: {
        sans: ["var(--police)"],
      },
      borderRadius: {
        pill: "var(--rayon-pill)",
        carte: "var(--rayon-carte)",
        champ: "var(--rayon-champ)",
        petit: "var(--rayon-petit)",
      },
    },
  },
  plugins: [],
};

export default config;
