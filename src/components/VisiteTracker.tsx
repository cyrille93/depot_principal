"use client";

import { useEffect } from "react";

// Suivi de visite anonyme : un identifiant éphémère par session de navigateur,
// un ping à l'ouverture puis toutes les 30 s tant que la page est active.
// Sert uniquement aux statistiques globales de l'admin.
export function VisiteTracker() {
  useEffect(() => {
    let sid = "";
    try {
      sid = sessionStorage.getItem("ra_visite_sid") ?? "";
      if (!sid) {
        sid = (crypto.randomUUID?.() ?? String(Date.now()) + Math.random().toString(36).slice(2));
        sessionStorage.setItem("ra_visite_sid", sid);
      }
    } catch {
      sid = String(Date.now()) + Math.random().toString(36).slice(2);
    }

    const ping = () => {
      fetch("/api/visite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid }),
        keepalive: true,
      }).catch(() => {});
    };

    ping();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") ping();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return null;
}
