import { db } from "@/lib/db";

export type CleContenu = "cgu" | "confidentialite" | "mentions-legales";
export const CLES_CONTENU: CleContenu[] = ["cgu", "confidentialite", "mentions-legales"];

// Contenu par défaut (utilisé tant que l'admin n'a rien enregistré).
// Format : "## Titre de section" pour un sous-titre, ligne vide pour séparer les paragraphes.
export const CONTENUS_DEFAUT: Record<CleContenu, { titre: string; corps: string }> = {
  cgu: {
    titre: "Conditions Générales d'Utilisation",
    corps: `Les présentes Conditions Générales d'Utilisation (« CGU ») encadrent l'accès et l'utilisation de la plateforme Rose Annonce (« la Plateforme »). En accédant à la Plateforme, l'utilisateur accepte sans réserve les présentes CGU.

## 1. Accès réservé aux personnes majeures
La Plateforme est strictement réservée aux personnes âgées de 18 ans ou plus. Tout utilisateur déclare et garantit être majeur. Tout contenu impliquant des mineurs est formellement interdit et fera l'objet d'un signalement aux autorités compétentes.

## 2. Objet de la plateforme
Rose Annonce est un service de mise en relation et de publication d'annonces entre utilisateurs majeurs. La Plateforme fournit un espace technique ; elle n'est pas partie aux relations établies entre les utilisateurs.

## 3. Compte utilisateur
L'utilisateur est responsable de l'exactitude des informations fournies et de la confidentialité de ses identifiants. La Plateforme peut suspendre ou supprimer tout compte en cas de manquement aux présentes CGU.

## 4. Contenus et comportements interdits
Sont notamment interdits : les contenus illicites, la traite et l'exploitation de personnes, l'implication de mineurs, le harcèlement, les arnaques, les faux profils, et tout contenu portant atteinte aux droits de tiers.

## 5. Signalement et modération
Un système de signalement est mis à disposition. La Plateforme se réserve le droit de retirer tout contenu et de sanctionner tout compte ne respectant pas les règles.

## 6. Services payants
Certaines fonctionnalités (mise en avant, options premium) sont payantes. Les montants sont indiqués avant l'achat.

## 7. Responsabilité
La Plateforme agit en qualité d'hébergeur technique. Elle ne saurait être tenue responsable des relations entre utilisateurs ni de l'exécution des prestations convenues entre eux.

## 8. Contact
Pour toute question : [ADRESSE E-MAIL DE CONTACT À COMPLÉTER].`,
  },
  confidentialite: {
    titre: "Politique de confidentialité",
    corps: `La présente politique explique quelles données personnelles Rose Annonce collecte, pourquoi, et quels sont les droits des utilisateurs.

## 1. Données collectées
Selon l'usage : adresse e-mail et/ou numéro de téléphone, pseudonyme, ville, photos publiées, messages échangés, documents de vérification d'identité, et données techniques de connexion.

## 2. Finalités
Les données servent à : créer et gérer les comptes, publier les annonces, permettre la messagerie, vérifier l'identité et l'âge, assurer la sécurité et la modération, et traiter les paiements.

## 3. Conservation
Les données sont conservées le temps nécessaire aux finalités ci-dessus, puis supprimées ou anonymisées.

## 4. Partage
Les données ne sont pas vendues. Elles peuvent être partagées avec des prestataires techniques (hébergement, paiement) strictement pour le fonctionnement du service, ou avec les autorités sur demande légale.

## 5. Sécurité
Des mesures techniques et organisationnelles sont mises en œuvre pour protéger les données. Les mots de passe sont stockés sous forme chiffrée.

## 6. Droits des utilisateurs
L'utilisateur peut demander l'accès, la rectification ou la suppression de ses données en contactant [ADRESSE E-MAIL DE CONTACT À COMPLÉTER].

## 7. Cookies
La Plateforme utilise des cookies et un stockage local nécessaires au fonctionnement (session, confirmation d'âge).`,
  },
  "mentions-legales": {
    titre: "Mentions légales",
    corps: `## Éditeur
Rose Annonce — [RAISON SOCIALE / NOM DE L'ÉDITEUR À COMPLÉTER]. Adresse : [ADRESSE À COMPLÉTER]. Contact : [E-MAIL / TÉLÉPHONE À COMPLÉTER]. Responsable de la publication : [NOM À COMPLÉTER].

## Hébergement
Le site est hébergé par : [NOM DE L'HÉBERGEUR À COMPLÉTER], [ADRESSE DE L'HÉBERGEUR À COMPLÉTER].

## Propriété intellectuelle
La marque Rose Annonce, le logo et les éléments de la Plateforme sont protégés. Toute reproduction non autorisée est interdite.

## Public
Site strictement réservé aux personnes majeures (18 ans et plus).`,
  },
};

export async function getContenuPage(cle: CleContenu): Promise<{ titre: string; corps: string }> {
  try {
    const row = await db.contenuPage.findUnique({ where: { cle } });
    if (row) return { titre: row.titre, corps: row.corps };
  } catch {
    /* table absente ou non migrée : on retombe sur le défaut */
  }
  return CONTENUS_DEFAUT[cle];
}

export async function getTousContenus(): Promise<Record<CleContenu, { titre: string; corps: string }>> {
  const entries = await Promise.all(
    CLES_CONTENU.map(async (cle) => [cle, await getContenuPage(cle)] as const)
  );
  return Object.fromEntries(entries) as Record<CleContenu, { titre: string; corps: string }>;
}
