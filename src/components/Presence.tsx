"use client";

import { useEffect } from "react";
import { ping } from "@/app/actions/presence";

// Envoie un battement de présence à intervalle régulier (compte les utilisateurs en ligne).
export function Presence() {
  useEffect(() => {
    ping();
    const t = setInterval(() => ping(), 60000);
    const onFocus = () => ping();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  return null;
}
