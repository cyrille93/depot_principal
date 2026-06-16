# Mise en ligne de Rose Annonce — guide de déploiement

Ce guide liste les étapes pour publier une première version en ligne.

## 1. Pré-requis (comptes à créer)
- Un hébergement pour l'application (recommandé : **Vercel** pour Next.js, ou un VPS).
- Une **base PostgreSQL managée** (Neon, Supabase ou Amazon RDS).
- Un **nom de domaine** (ex. roseannonce.cm).

## 2. Variables d'environnement (sur l'hébergeur)
À partir de `.env.example`, définir :
- `DATABASE_URL` : URL de la base Postgres managée.
- `AUTH_SECRET` : un secret aléatoire (`openssl rand -base64 32`).
- `NEXT_PUBLIC_SITE_URL` : l'URL finale du site (ex. https://roseannonce.cm).

## 3. Base de données
Appliquer le schéma sur la base de production :
```
npx prisma migrate deploy
```
Puis (optionnel) initialiser les villes :
```
npm run db:seed
```

## 4. Build et démarrage
```
npm install
npx prisma generate
npm run build
npm run start
```
(Sur Vercel, le build et le `prisma generate` se font automatiquement.)

## 5. Compte administrateur
Créer un compte via l'inscription, puis passer son rôle à ADMIN
(via `npx prisma studio` → table User → role = ADMIN).

## 6. À faire avant l'ouverture au public
- [ ] Compléter les pages légales (CGU, confidentialité, mentions légales) avec un professionnel.
- [ ] Mettre en place le **stockage CDN** des photos (sinon la base grossit vite).
- [ ] Brancher le **Mobile Money** réel (Orange Money / MTN MoMo via agrégateur).
- [ ] Vérifier le filtre d'âge 18+ et la modération.
- [ ] Soumettre le sitemap dans la **Google Search Console**.

## 7. Vérifications post-déploiement
- `https://VOTRE-DOMAINE/sitemap.xml` répond.
- `https://VOTRE-DOMAINE/robots.txt` pointe vers le bon sitemap.
- Les titres et URLs SEO utilisent bien le domaine de production.
