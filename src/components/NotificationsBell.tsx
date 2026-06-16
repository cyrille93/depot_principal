"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, MessageSquare, Star, CheckCircle2, XCircle, ShieldCheck, Gift, Info } from "lucide-react";
import { chargerNotifications, marquerNotifsLues } from "@/app/actions/notifications";
import type { NotifUI, TypeNotif } from "@/lib/notifications";

const ICONE: Record<TypeNotif, { Icon: typeof Bell; cls: string }> = {
  MESSAGE: { Icon: MessageSquare, cls: "text-action-verte" },
  AVIS: { Icon: Star, cls: "text-etoile" },
  ANNONCE_VALIDEE: { Icon: CheckCircle2, cls: "text-feuille" },
  ANNONCE_REFUSEE: { Icon: XCircle, cls: "text-vip" },
  VERIFICATION: { Icon: ShieldCheck, cls: "text-feuille" },
  COMMISSION: { Icon: Gift, cls: "text-action-verte" },
  SYSTEME: { Icon: Info, cls: "text-secondaire" },
};

function quand(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export function NotificationsBell() {
  const [connecte, setConnecte] = useState(false);
  const [items, setItems] = useState<NotifUI[]>([]);
  const [nonLus, setNonLus] = useState(0);
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const rafraichir = useCallback(async () => {
    const r = await chargerNotifications();
    setConnecte(r.connecte);
    setItems(r.items);
    setNonLus(r.nonLus);
  }, []);

  useEffect(() => {
    rafraichir();
    const t = setInterval(rafraichir, 25000);
    return () => clearInterval(t);
  }, [rafraichir]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const basculer = async () => {
    const n = !ouvert;
    setOuvert(n);
    if (n && nonLus > 0) {
      setNonLus(0);
      setItems((list) => list.map((i) => ({ ...i, lu: true })));
      await marquerNotifsLues();
    }
  };

  if (!connecte) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={basculer}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-pill border border-bordure text-principal"
      >
        <Bell className="h-[18px] w-[18px]" />
        {nonLus > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-pill bg-feuille px-1 text-[10px] font-medium text-sur-vert">
            {nonLus}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-carte border border-bordure bg-carte shadow-lg">
          <div className="border-b border-bordure px-4 py-2.5 text-sm font-medium text-principal">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-secondaire">Aucune notification.</p>
            ) : (
              items.map((n) => {
                const { Icon, cls } = ICONE[n.type] ?? ICONE.SYSTEME;
                const contenu = (
                  <div className={"flex gap-3 px-4 py-3 " + (n.lu ? "" : "bg-tint-succes")}>
                    <Icon className={"mt-0.5 h-5 w-5 shrink-0 " + cls} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-principal">{n.titre}</div>
                      <div className="text-xs text-secondaire">{n.message}</div>
                      <div className="mt-0.5 text-[10px] text-tertiaire">{quand(n.at)}</div>
                    </div>
                  </div>
                );
                return n.lien ? (
                  <a key={n.id} href={n.lien} className="block border-b border-bordure last:border-0 hover:bg-page">
                    {contenu}
                  </a>
                ) : (
                  <div key={n.id} className="border-b border-bordure last:border-0">
                    {contenu}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
