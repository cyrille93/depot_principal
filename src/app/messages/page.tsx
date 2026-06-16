import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MessageSquare, ImageIcon } from "lucide-react";
import { auth } from "@/auth";
import { listerConversations } from "@/lib/messages";

export const dynamic = "force-dynamic";

function quand(iso: string) {
  const d = new Date(iso);
  const auj = new Date();
  const memeJour = d.toDateString() === auj.toDateString();
  return memeJour
    ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const convs = await listerConversations(session.user.id);

  return (
    <main className="mx-auto max-w-2xl px-4 py-5">
      <div className="mb-4 flex items-center gap-1">
        <Link href="/compte" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Mon compte
        </Link>
      </div>
      <h1 className="flex items-center gap-2 text-xl font-medium text-principal">
        <MessageSquare className="h-5 w-5 text-action-verte" /> Messages
      </h1>

      {convs.length === 0 ? (
        <div className="mt-6 rounded-carte border border-bordure bg-carte p-10 text-center">
          <p className="text-sm text-secondaire">Aucune conversation pour le moment.</p>
          <Link href="/explorer" className="mt-2 inline-block text-sm font-medium text-action-verte">
            Explorer les profils →
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-bordure overflow-hidden rounded-carte border border-bordure bg-carte">
          {convs.map((c) => (
            <li key={c.id}>
              <Link href={`/messages/${c.id}`} className="flex items-center gap-3 px-4 py-3">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-foret text-sm font-medium text-tint-succes">
                  {c.autrePseudo.charAt(0)}
                  {c.nonLus > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-pill bg-feuille px-1 text-[11px] font-medium text-sur-vert">
                      {c.nonLus}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-principal">{c.autrePseudo}</span>
                    <span className="shrink-0 text-[11px] text-tertiaire">{quand(c.at)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-secondaire">
                    {c.dernier ? (
                      <span className="truncate">{c.dernier}</span>
                    ) : c.dernierImage ? (
                      <span className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Photo</span>
                    ) : (
                      <span className="truncate text-tertiaire">{c.annonceTitre ?? "Nouvelle conversation"}</span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
