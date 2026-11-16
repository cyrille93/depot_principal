// API admin — détail, modification et suppression (soft-delete) d'un utilisateur.
// Privée : réservée à l'app Power Apps d'administration via Entra ID (OAuth2).

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { verifierAdminEntra } from "@/lib/admin-auth";
import { reponseOk, reponseErreur } from "@/lib/api-reponse";
import { champsUserPublics, champsUserDetail } from "@/lib/user-dto";
import { modifierUserSchema } from "@/lib/admin-users-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/users/:id — détail d'un utilisateur (+ profil)
export async function GET(request: Request, ctx: Ctx) {
  const auth = await verifierAdminEntra(request);
  if (!auth.ok) return reponseErreur(auth.code, auth.message, auth.status);

  const { id } = await ctx.params;
  const user = await db.user.findUnique({ where: { id }, select: champsUserDetail });
  if (!user) return reponseErreur("introuvable", "Utilisateur introuvable.", 404);

  return reponseOk(user);
}

// PATCH /api/admin/users/:id — modification partielle
export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await verifierAdminEntra(request);
  if (!auth.ok) return reponseErreur(auth.code, auth.message, auth.status);

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reponseErreur("json_invalide", "Corps de requête JSON invalide.", 400);
  }

  const parsed = modifierUserSchema.safeParse(body);
  if (!parsed.success) {
    return reponseErreur("validation", "Données invalides.", 400, parsed.error.flatten());
  }
  const d = parsed.data;

  // Construit uniquement les champs fournis (liste blanche).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (d.email !== undefined) data.email = d.email;
  if (d.telephone !== undefined) data.telephone = d.telephone;
  if (d.role !== undefined) data.role = d.role;
  if (d.statut !== undefined) data.statut = d.statut;
  if (d.locale !== undefined) data.locale = d.locale;
  if (d.telephoneVerifie !== undefined) data.telephoneVerifie = d.telephoneVerifie;
  if (d.emailVerifie !== undefined) data.emailVerifie = d.emailVerifie;
  if (d.identiteVerifiee !== undefined) data.identiteVerifiee = d.identiteVerifiee;
  if (d.selfieVerifie !== undefined) data.selfieVerifie = d.selfieVerifie;
  if (d.doitChangerMotDePasse !== undefined) data.doitChangerMotDePasse = d.doitChangerMotDePasse;
  if (d.password) data.motDePasseHash = await hashPassword(d.password);

  try {
    const user = await db.user.update({ where: { id }, data, select: champsUserPublics });
    return reponseOk(user);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e?.code === "P2025") return reponseErreur("introuvable", "Utilisateur introuvable.", 404);
    if (e?.code === "P2002") {
      return reponseErreur("conflit", "E-mail ou téléphone déjà utilisé.", 409, e?.meta?.target);
    }
    return reponseErreur("erreur_serveur", "Modification impossible.", 500);
  }
}

// DELETE /api/admin/users/:id — soft-delete (statut = SUPPRIME), réversible.
export async function DELETE(request: Request, ctx: Ctx) {
  const auth = await verifierAdminEntra(request);
  if (!auth.ok) return reponseErreur(auth.code, auth.message, auth.status);

  const { id } = await ctx.params;

  try {
    const user = await db.user.update({
      where: { id },
      data: { statut: "SUPPRIME" },
      select: champsUserPublics,
    });
    return reponseOk({ ok: true, user });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e?.code === "P2025") return reponseErreur("introuvable", "Utilisateur introuvable.", 404);
    return reponseErreur("erreur_serveur", "Suppression impossible.", 500);
  }
}
