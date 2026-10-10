import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, Clock, CalendarDays } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type SP = { periode?: string };

function depuis(jours: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - jours);
  return d;
}

function formatDuree(secondes: number): string {
  if (!Number.isFinite(secondes) || secondes <= 0) return "0 s";
  const m = Math.floor(secondes / 60);
  const s = Math.round(secondes % 60);
  if (m <= 0) return `${s} s`;
  if (m < 60) return `${m} min ${s} s`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min`;
}

export default async function Page({ searchParams }: { searchParams: Promise<SP> }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (session.user.role !== "ADMIN") redirect("/");

  const sp = await searchParams;
  const jours = sp.periode === "30" ? 30 : sp.periode === "90" ? 90 : 7;
  const debutPeriode = depuis(jours);

  const visites = await db.visiteSession.findMany({
    where: { debut: { gte: debutPeriode } },
    select: { debut: true, derniereActivite: true },
  });

  const nbVisites = visites.length;
  const dureesSec = visites.map(
    (v: { debut: Date; derniereActivite: Date }) =>
      (new Date(v.derniereActivite).getTime() - new Date(v.debut).getTime()) / 1000
  );
  const tempsMoyen = nbVisites > 0 ? dureesSec.reduce((a: number, b: number) => a + b, 0) / nbVisites : 0;

  // Visites aujourd'hui (depuis minuit)
  const minuit = new Date();
  minuit.setHours(0, 0, 0, 0);
  const nbAujourdhui = visites.filter((v: { debut: Date }) => new Date(v.debut) >= minuit).length;

  const chip = (actif: boolean) =>
    `rounded-pill px-3 py-1 text-xs font-medium ${actif ? "bg-feuille text-sur-vert" : "border border-bordure text-secondaire"}`;

  const tuiles = [
    { label: `Visites (${jours} derniers jours)`, valeur: String(nbVisites), Icon: Users },
    { label: "Temps moyen par visite", valeur: formatDuree(tempsMoyen), Icon: Clock },
    { label: "Visites aujourd'hui", valeur: String(nbAujourdhui), Icon: CalendarDays },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-5">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-action-verte">
        <ChevronLeft className="h-4 w-4" /> Admin
      </Link>
      <h1 className="text-xl font-medium text-principal">Statistiques de fréquentation</h1>
      <p className="mt-1 text-sm text-secondaire">Données globales et anonymes — aucun suivi nominatif.</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Link href="/admin/statistiques?periode=7" className={chip(jours === 7)}>7 jours</Link>
        <Link href="/admin/statistiques?periode=30" className={chip(jours === 30)}>30 jours</Link>
        <Link href="/admin/statistiques?periode=90" className={chip(jours === 90)}>90 jours</Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tuiles.map((t) => (
          <div key={t.label} className="rounded-carte border border-bordure bg-carte p-4">
            <t.Icon className="h-5 w-5 text-action-verte" />
            <div className="mt-2 text-2xl font-medium text-principal">{t.valeur}</div>
            <div className="mt-0.5 text-xs text-secondaire">{t.label}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-tertiaire">
        Le temps moyen est estimé à partir de l'activité sur la page (rafraîchie toutes les 30 s).
        Une visite très courte compte pour une durée proche de zéro.
      </p>
    </main>
  );
}
