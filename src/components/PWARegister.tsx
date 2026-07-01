"use client";

import { useEffect } from "react";

// Enregistre le service worker (nécessaire pour l'installation PWA + le hors-ligne).
export function PWARegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* silencieux : l'app fonctionne même sans service worker */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
