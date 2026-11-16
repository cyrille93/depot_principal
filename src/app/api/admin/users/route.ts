// API admin — liste + création d'utilisateurs.
// Privée : réservée à l'app Power Apps d'administration via Entra ID (OAuth2).
// Ne modifie aucune fonctionnalité existante du site.

import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { verifierAdminEntra } from "@/lib/admin-auth";
import { reponseOk, reponseErreur } from "@/lib/api-reponse";
import { champsUserPublics } from "@/lib/user-dto";
import { listeQuerySchema, creerUserSchema } from "@/lib/admin-users-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/users — liste paginée avec recherche et filtres
export async function GET(request: Request) {
  const auth = await verifierAdminEntra(request);
  if (!auth.ok) return reponseErreur(auth.code, auth.message, auth.status);

  const url = new URL(request.url);
  const parsed = listeQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return reponseErreur("validation", "Paramètres invalides.", 400, parsed.error.flatten());
  }
  const { page, limit, q, role, statut } = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (role) where.role = role;
  if (statut) where.statut = statut;
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { telephone: { contains: q } },
      { codeParrainage: { contains: q, mode: "insensitive" } },
      { profil: { is: { pseudo: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [total, data] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      select: champsUserPublics,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return reponseOk({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

// Génère un code de parrainage unique (champ obligatoire et unique sur User).
async function genererCodeParrainage(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const code = randomBytes(4).toString("hex").toUpperCase(); // 8 caractères
    const existe = await db.user.findUnique({ where: { codeParrainage: code }, select: { id: true } });
    if (!existe) return code;
  }
  return randomBytes(6).toString("hex").toUpperCase();
}

// POST /api/admin/users — création d'un utilisateur
export async function POST(request: Request) {
  const auth = await verifierAdminEntra(request);
  if (!auth.ok) return reponseErreur(auth.code, auth.message, auth.status);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reponseErreur("json_invalide", "Corps de requête JSON invalide.", 400);
  }

  const parsed = creerUserSchema.safeParse(body);
  if (!parsed.success) {
    return reponseErreur("validation", "Données invalides.", 400, parsed.error.flatten());
  }
  const d = parsed.data;

  // Le pays doit exister (clé étrangère obligatoire).
  const pays = await db.pays.findUnique({ where: { id: d.paysId }, select: { id: true } });
  if (!pays) return reponseErreur("pays_introuvable", "paysId inconnu.", 400);

  try {
    const user = await db.user.create({
      data: {
        email: d.email ?? null,
        telephone: d.telephone ?? null,
        motDePasseHash: d.password ? await hashPassword(d.password) : null,
        role: d.role,
        statut: d.statut,
        locale: d.locale,
        paysId: d.paysId,
        codeParrainage: await genererCodeParrainage(),
      },
      select: champsUserPublics,
    });
    return reponseOk(user, 201);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e?.code === "P2002") {
      return reponseErreur("conflit", "E-mail ou téléphone déjà utilisé.", 409, e?.meta?.target);
    }
    return reponseErreur("erreur_serveur", "Création impossible.", 500);
  }
}
