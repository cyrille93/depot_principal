# Confiance — starter

Socle technique de la plateforme (Phase 0 · Chantiers D & E + ticket P1-01).
Stack : **Next.js 15 (App Router) · TypeScript · Tailwind (branché sur la charte) · Prisma · PostgreSQL**.

## ⚠️ Mise à jour du schéma (à faire en récupérant cette version)

Le schéma de données a beaucoup évolué (annonces, portefeuille, parrainage, etc.) et l'inscription crée désormais un portefeuille + un code de parrainage. En développement, recréez la base proprement et chargez les annonces de démo :

```bash
npm run db:reset   # recrée le schéma + relance le seed (confirmez quand demandé)
```

Ensuite, `/explorer` et `/profil/[id]` affichent de **vraies données** lues en base (plus les données fictives).

## Ce qui est déjà là

- Projet Next.js responsive qui démarre, **à votre charte verte** (tokens dans `src/app/globals.css`, mappés dans `tailwind.config.ts`).
- Landing de démonstration (`src/app/page.tsx`) prouvant que les tokens s'appliquent.
- **Schéma multi-pays** (`prisma/schema.prisma`) : `Pays`, `Ville`, `User`, `Profil`, rôles. Le pays est une dimension — on lance le Cameroun, on étend ensuite sans réécrire.
- **Seed Cameroun** (`prisma/seed.ts`) : pays (XAF, +237) + 13 grandes villes, régions anglophones repérées.
- **Socle i18n FR/EN** (`src/i18n/`), FR par défaut.
- **Auth email/mot de passe (P1-02/03)** : inscription avec choix client/pro, connexion, session JWT (Auth.js), hachage bcrypt, validation zod. Pages `/inscription`, `/connexion` et `/compte` (protégée, avec déconnexion).
- **Écran Explorer (`/explorer`)** : le feed « conversion » responsive (rail de filtres desktop, tiroir mobile, filtrage par catégorie fonctionnel, favoris), sur **données fictives** (`src/lib/mock.ts`) — à brancher sur la vraie base aux Phases 2-3.

## Prérequis

- Node.js 20+
- Un PostgreSQL accessible (local ou managé). Pour la géoloc (Phase 3) on activera l'extension PostGIS.

## Démarrage

```bash
# 1. Dépendances
npm install

# 2. Variables d'environnement
cp .env.example .env
# puis renseignez DATABASE_URL

# 3. Base de données : créer les tables + générer le client
npm run db:migrate      # crée la première migration
npm run db:seed         # charge le Cameroun + ses villes

# 4. Lancer
npm run dev             # http://localhost:3000
```

## Scripts

| Script | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | génère le client Prisma puis build de prod |
| `npm run db:migrate` | crée/applique les migrations |
| `npm run db:seed` | seed Cameroun |
| `npm run db:reset` | réinitialise la base (efface tout) |

## Prochains tickets (Phase 1)

- ~~P1-02/03 : inscription + connexion email~~ ✅ fait
- **P1-06/07** : rôles client/pro (le champ existe déjà) + garde-fous d'autorisation.
- **P1-08 → P1-12** : profils (édition, photo, page responsive).
- **P1-13 → P1-15** : vérification téléphone par OTP (+237).

## Routes disponibles

| Route | Rôle |
| --- | --- |
| `/` | landing à la charte |
| `/inscription` | créer un compte (client ou pro) |
| `/connexion` | se connecter |
| `/compte` | espace compte (protégé) |
| `/explorer` | le feed (données fictives) |
| `/profil/[id]` | fiche profil détaillée (ex: /profil/1) |
| `/publier` | publication réelle (connexion requise, annonce en attente de modération) |
| `/portefeuille` | tableau de bord portefeuille + parrainage |
| `/recharge` | recharge Mobile Money (Orange / MTN) |
| `/transfert` | transfert de solde entre utilisateurs |
| `/premium` | offres Premium (booster la visibilité) |
| `/admin` | back-office réel (réservé ADMIN) : modération annonces/signalements |

> Avant de lancer, générez un vrai secret : `npx auth secret` (ou renseignez `AUTH_SECRET` dans `.env`).

## Notes d'architecture

- **Pas de hex en dur** : toujours passer par les tokens de la charte.
- `src/lib/db.ts` : client Prisma en singleton.
- La photo de profil (`Profil.photoUrl`) transitera par le **service de floutage** en Phase 2.
- Strictement **18+** : la vérification d'âge des prestataires et la modération anti-mineurs sont à intégrer (Phases 4 et 6) et ne sont pas optionnelles.
