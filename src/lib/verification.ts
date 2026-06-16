import { db } from "@/lib/db";

// niveauVerification = nombre d'éléments vérifiés (téléphone, identité, selfie)
export async function recomputeNiveau(userId: string) {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { telephoneVerifie: true, identiteVerifiee: true, selfieVerifie: true },
  });
  if (!u) return;
  const niveau = (u.telephoneVerifie ? 1 : 0) + (u.identiteVerifiee ? 1 : 0) + (u.selfieVerifie ? 1 : 0);
  await db.user.update({ where: { id: userId }, data: { niveauVerification: niveau } });
}

export type StatutVerif = {
  telephone: boolean;
  identite: boolean;
  selfie: boolean;
  attenteIdentite: boolean;
  attenteSelfie: boolean;
};

export async function getStatutVerification(userId: string): Promise<StatutVerif> {
  const [u, pending] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { telephoneVerifie: true, identiteVerifiee: true, selfieVerifie: true },
    }),
    db.verification.findMany({ where: { userId, statut: "EN_ATTENTE" }, select: { type: true } }),
  ]);
  const attente = new Set((pending as { type: string }[]).map((p) => p.type));
  return {
    telephone: !!u?.telephoneVerifie,
    identite: !!u?.identiteVerifiee,
    selfie: !!u?.selfieVerifie,
    attenteIdentite: attente.has("IDENTITE"),
    attenteSelfie: attente.has("SELFIE"),
  };
}
