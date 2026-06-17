"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Plus, MessageSquare, User } from "lucide-react";

// Onglets de navigation principaux (mobile). Masquée sur les pages de détail.
const TABS_VISIBLES = ["/", "/favoris", "/messages", "/compte"];

export function BottomNav() {
  const pathname = usePathname();
  if (!TABS_VISIBLES.includes(pathname)) return null;

  const actif = (href: string) => pathname === href;
  const cls = (href: string) =>
    "flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] " +
    (actif(href) ? "text-feuille" : "text-tertiaire");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-around border-t border-bordure bg-carte px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-1.5 md:hidden">
      <Link href="/" className={cls("/")}>
        <Home className="h-[22px] w-[22px]" strokeWidth={actif("/") ? 2.2 : 1.7} />
        <span className={actif("/") ? "font-medium" : ""}>Accueil</span>
      </Link>
      <Link href="/favoris" className={cls("/favoris")}>
        <Heart className="h-[22px] w-[22px]" strokeWidth={actif("/favoris") ? 2.2 : 1.7} />
        <span className={actif("/favoris") ? "font-medium" : ""}>Favoris</span>
      </Link>
      <Link href="/publier" className="flex flex-col items-center gap-0.5 -mt-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-feuille text-sur-vert shadow-lg shadow-feuille/30">
          <Plus className="h-6 w-6" strokeWidth={2.4} />
        </span>
        <span className="text-[10px] text-tertiaire">Publier</span>
      </Link>
      <Link href="/messages" className={cls("/messages")}>
        <MessageSquare className="h-[22px] w-[22px]" strokeWidth={actif("/messages") ? 2.2 : 1.7} />
        <span className={actif("/messages") ? "font-medium" : ""}>Messages</span>
      </Link>
      <Link href="/compte" className={cls("/compte")}>
        <User className="h-[22px] w-[22px]" strokeWidth={actif("/compte") ? 2.2 : 1.7} />
        <span className={actif("/compte") ? "font-medium" : ""}>Compte</span>
      </Link>
    </nav>
  );
}
