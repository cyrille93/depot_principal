import { z } from "zod";

export const loginSchema = z.object({
  identifiant: z.string().min(1, "Renseignez votre email ou téléphone."),
  password: z.string().min(8, "8 caractères minimum."),
});

export const signupSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(8, "Mot de passe : 8 caractères minimum."),
  role: z.enum(["CLIENT", "PRO"]).default("CLIENT"),
  telephone: z.string().trim().min(8, "Numéro de téléphone invalide."),
  villeId: z.string().min(1, "Choisissez une ville."),
  codeParrain: z.string().trim().optional(),
});
