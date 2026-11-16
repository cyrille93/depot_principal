// Liste blanche des champs utilisateur renvoyés par l'API admin.
// IMPORTANT : "motDePasseHash" et tout champ sensible NE SONT JAMAIS inclus ici,
// donc jamais renvoyés dans les réponses JSON.
export const champsUserPublics = {
  id: true,
  email: true,
  telephone: true,
  role: true,
  statut: true,
  niveauVerification: true,
  telephoneVerifie: true,
  emailVerifie: true,
  identiteVerifiee: true,
  selfieVerifie: true,
  locale: true,
  codeParrainage: true,
  doitChangerMotDePasse: true,
  paysId: true,
  derniereActivite: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Version avec le profil (pseudo/ville) pour le détail d'un utilisateur.
export const champsUserDetail = {
  ...champsUserPublics,
  profil: {
    select: { pseudo: true, description: true, villeId: true, disponible: true },
  },
} as const;
