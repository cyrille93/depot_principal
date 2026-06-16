import { db } from "@/lib/db";

export type TypeNotif =
  | "MESSAGE"
  | "AVIS"
  | "ANNONCE_VALIDEE"
  | "ANNONCE_REFUSEE"
  | "VERIFICATION"
  | "COMMISSION"
  | "SYSTEME";

export type NotifUI = {
  id: string;
  type: TypeNotif;
  titre: string;
  message: string;
  lien: string | null;
  lu: boolean;
  at: string; // ISO
};

// Crée une notification (échoue silencieusement pour ne jamais casser l'action appelante)
export async function creerNotification(
  userId: string,
  type: TypeNotif,
  titre: string,
  message: string,
  lien?: string
) {
  try {
    await db.notification.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { userId, type: type as any, titre, message, lien: lien ?? null },
    });
  } catch {
    // on n'interrompt jamais le flux principal
  }
}

export async function listerNotifications(userId: string): Promise<{ items: NotifUI[]; nonLus: number }> {
  const [rows, nonLus] = await Promise.all([
    db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.notification.count({ where: { userId, lu: false } }),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: NotifUI[] = (rows as any[]).map((n) => ({
    id: n.id,
    type: n.type,
    titre: n.titre,
    message: n.message,
    lien: n.lien,
    lu: n.lu,
    at: (n.createdAt as Date).toISOString(),
  }));
  return { items, nonLus };
}
