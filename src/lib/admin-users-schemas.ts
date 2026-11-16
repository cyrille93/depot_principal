import { z } from "zod";

// Schémas de validation pour l'API admin « utilisateurs ».

const ROLES = ["CLIENT", "PRO", "ADMIN"] as const;
const STATUTS = ["ACTIF", "SUSPENDU", "SUPPRIME"] as const;

// GET /api/admin/users — paramètres de requête
export const listeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().min(1).optional(),
  role: z.enum(ROLES).optional(),
  statut: z.enum(STATUTS).optional(),
});

// POST /api/admin/users — création
export const creerUserSchema = z
  .object({
    email: z.string().trim().email("E-mail invalide.").optional(),
    telephone: z.string().trim().min(8, "Numéro de téléphone invalide.").optional(),
    password: z.string().min(8, "Mot de passe : 8 caractères minimum.").optional(),
    role: z.enum(ROLES).default("CLIENT"),
    statut: z.enum(STATUTS).default("ACTIF"),
    locale: z.string().trim().min(2).max(5).default("fr"),
    paysId: z.string().min(1, "paysId requis."),
  })
  .refine((d) => !!d.email || !!d.telephone, {
    message: "Renseignez au moins un e-mail ou un téléphone.",
    path: ["email"],
  });

// PATCH /api/admin/users/:id — modification partielle (champs autorisés uniquement)
export const modifierUserSchema = z
  .object({
    email: z.string().trim().email("E-mail invalide.").nullable().optional(),
    telephone: z.string().trim().min(8, "Numéro de téléphone invalide.").nullable().optional(),
    password: z.string().min(8, "Mot de passe : 8 caractères minimum.").optional(),
    role: z.enum(ROLES).optional(),
    statut: z.enum(STATUTS).optional(),
    locale: z.string().trim().min(2).max(5).optional(),
    telephoneVerifie: z.boolean().optional(),
    emailVerifie: z.boolean().optional(),
    identiteVerifiee: z.boolean().optional(),
    selfieVerifie: z.boolean().optional(),
    doitChangerMotDePasse: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "Aucun champ à modifier." });

export type CreerUser = z.infer<typeof creerUserSchema>;
export type ModifierUser = z.infer<typeof modifierUserSchema>;
