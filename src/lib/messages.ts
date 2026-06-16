import { db } from "@/lib/db";

// Paire normalisée : on stocke toujours userAId < userBId
export function paire(x: string, y: string): [string, string] {
  return x < y ? [x, y] : [y, x];
}

export type MessageUI = {
  id: string;
  mien: boolean;
  contenu: string | null;
  image: string | null;
  at: string; // ISO
};

export type ConversationResume = {
  id: string;
  autrePseudo: string;
  autrePhoto: string | null;
  annonceTitre: string | null;
  dernier: string | null;
  dernierImage: boolean;
  at: string; // ISO
  nonLus: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pseudoDe(u: any): string {
  return u?.profil?.pseudo ?? "Utilisateur";
}

export async function listerConversations(userId: string): Promise<ConversationResume[]> {
  const convs = await db.conversation.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { dernierAt: "desc" },
    include: {
      userA: { include: { profil: true } },
      userB: { include: { profil: true } },
      annonce: { select: { titre: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const ids = convs.map((c: { id: string }) => c.id);
  const nonLusParConv = new Map<string, number>();
  if (ids.length) {
    const groupes = await db.message.groupBy({
      by: ["conversationId"],
      where: { conversationId: { in: ids }, lu: false, NOT: { expediteurId: userId } },
      _count: { _all: true },
    });
    for (const g of groupes as { conversationId: string; _count: { _all: number } }[]) {
      nonLusParConv.set(g.conversationId, g._count._all);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return convs.map((c: any) => {
    const autre = c.userAId === userId ? c.userB : c.userA;
    const dernier = c.messages[0];
    return {
      id: c.id,
      autrePseudo: pseudoDe(autre),
      autrePhoto: autre?.profil?.photoUrl ?? null,
      annonceTitre: c.annonce?.titre ?? null,
      dernier: dernier?.contenu ?? null,
      dernierImage: !!dernier?.imageUrl,
      at: (c.dernierAt as Date).toISOString(),
      nonLus: nonLusParConv.get(c.id) ?? 0,
    };
  });
}

export async function getConversation(conversationId: string, userId: string) {
  const conv = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      userA: { include: { profil: true } },
      userB: { include: { profil: true } },
      annonce: { select: { id: true, titre: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conv) return null;
  if (conv.userAId !== userId && conv.userBId !== userId) return null;

  const autre = conv.userAId === userId ? conv.userB : conv.userA;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: MessageUI[] = (conv.messages as any[]).map((m) => ({
    id: m.id,
    mien: m.expediteurId === userId,
    contenu: m.contenu,
    image: m.imageUrl,
    at: (m.createdAt as Date).toISOString(),
  }));

  const [jeB, ilB] = await Promise.all([
    db.blocage.findUnique({ where: { bloqueurId_bloqueId: { bloqueurId: userId, bloqueId: autre.id } } }),
    db.blocage.findUnique({ where: { bloqueurId_bloqueId: { bloqueurId: autre.id, bloqueId: userId } } }),
  ]);

  return {
    id: conv.id,
    autreId: autre.id as string,
    autrePseudo: pseudoDe(autre),
    autreEstAdmin: autre.role === "ADMIN",
    annonceTitre: conv.annonce?.titre ?? null,
    annonceId: conv.annonce?.id ?? null,
    jeBloque: !!jeB,
    ilMeBloque: !!ilB,
    messages,
  };
}

// Nombre total de messages non lus reçus par l'utilisateur (pour la pastille de navigation)
export async function compterMessagesNonLus(userId: string): Promise<number> {
  const convs = await db.conversation.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    select: { id: true },
  });
  const ids = convs.map((c: { id: string }) => c.id);
  if (!ids.length) return 0;
  return db.message.count({
    where: { conversationId: { in: ids }, lu: false, NOT: { expediteurId: userId } },
  });
}
