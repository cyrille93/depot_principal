import { z } from "zod";

export const loginSchema = z.object({
  identifiant: z.string().min(1, "Renseignez votre email ou téléphone."),
  password: z.string().min(8, "8 caractères minimum."),
});

export const signupSchema = z
  .object({
    email: z.string().trim().optional(),
    password: z.string().min(8, "Mot de passe : 8 caractères minimum."),
    role: z.enum(["CLIENT", "PRO"]).default("CLIENT"),
    telephone: z.string().trim().optional(),
    villeId: z.string().min(1, "Choisissez une ville."),
  })
  .superRefine((d, ctx) => {
    const hasEmail = !!d.email && d.email.length > 0;
    const hasTel = !!d.telephone && d.telephone.length > 0;
    if (!hasEmail && !hasTel) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Renseignez au moins un e-mail ou un téléphone.", path: ["email"] });
      return;
    }
    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email!)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "E-mail invalide.", path: ["email"] });
    }
    if (hasTel && d.telephone!.replace(/\s+/g, "").length < 8) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Numéro de téléphone invalide.", path: ["telephone"] });
    }
  });
