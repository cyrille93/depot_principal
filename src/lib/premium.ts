// Tarifs de mise en avant par jour (FCFA). Module partagé client + serveur
// (ne pas mettre dans un fichier "use server", qui n'exporte que des fonctions).
export const TARIFS_MISE_EN_AVANT: Record<string, number> = {
  URGENT: 1000,
  TOP: 1500,
  VIP: 2000,
  PREMIUM: 3000,
};
