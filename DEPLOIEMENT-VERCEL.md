# 🚀 Mettre Rose Annonce en ligne — Vercel + Neon (pas-à-pas)

Tout se fait depuis ton ordinateur (PowerShell) et tes comptes. Suis les étapes dans l'ordre.

---

## Étape 1 — Mettre le code sur GitHub

1. Crée un compte sur https://github.com (si besoin), puis un **nouveau dépôt privé** (bouton « New »), nomme-le par ex. `rose-annonce`. Ne coche rien (pas de README).
2. Dans le dossier du projet, lance :

```powershell
git init
git add .
git commit -m "Rose Annonce v1"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/rose-annonce.git
git push -u origin main
```

✅ Vérifie sur GitHub que le fichier **`.env` n'apparaît PAS** (il est volontairement ignoré). Tes secrets ne doivent jamais être sur GitHub.

---

## Étape 2 — Créer la base de données (Neon)

1. Crée un compte sur https://neon.tech (gratuit).
2. « New Project » → choisis une région proche (Europe) → crée.
3. Copie la **Connection string** (format `postgresql://...@...neon.tech/...?sslmode=require`).
4. Applique le schéma de la base **depuis ton ordinateur** (remplace l'URL) :

```powershell
$env:DATABASE_URL="postgresql://...colle-ton-URL-Neon...?sslmode=require"
npx prisma db push
npm run db:seed
```
- `db push` crée toutes les tables.
- `db:seed` ajoute les villes du Cameroun (+ quelques comptes de démo, à supprimer plus tard si tu veux).

---

## Étape 3 — Préparer les variables d'environnement

Tu auras besoin de 3 valeurs :

- **DATABASE_URL** = l'URL Neon de l'étape 2.
- **AUTH_SECRET** = un secret aléatoire. Génère-le :
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
- **NEXT_PUBLIC_SITE_URL** = l'adresse finale de ton site (ex. `https://roseannonce.cm`).

---

## Étape 4 — Déployer sur Vercel

1. Crée un compte sur https://vercel.com avec ton compte GitHub.
2. « Add New… » → « Project » → importe le dépôt `rose-annonce`.
3. Framework détecté : **Next.js** (ne change rien).
4. Déplie **Environment Variables** et ajoute les 3 variables de l'étape 3
   (DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL).
5. Clique **Deploy**. Attends la fin du build.

Tu obtiens une URL de test `https://rose-annonce-xxxx.vercel.app` — vérifie que le site s'ouvre (le filtre 18+ doit apparaître).

---

## Étape 5 — Brancher ton nom de domaine

1. Sur Vercel : projet → **Settings → Domains** → ajoute `roseannonce.cm` (et `www.roseannonce.cm`).
2. Vercel t'indique les **enregistrements DNS** à créer (un `A` ou un `CNAME`).
3. Va chez ton fournisseur de domaine (là où tu l'as acheté) → zone DNS → crée les enregistrements indiqués par Vercel.
4. Attends la propagation (quelques minutes à quelques heures). Le HTTPS est automatique.
5. Mets à jour la variable **NEXT_PUBLIC_SITE_URL** avec le domaine final, puis **redeploie** (Vercel → Deployments → Redeploy).

---

## Étape 6 — Créer ton compte administrateur

1. Sur le site en ligne, **inscris-toi** normalement.
2. Passe ton compte en ADMIN. Le plus simple :
```powershell
$env:DATABASE_URL="...ton-URL-Neon..."
npx prisma studio
```
   → ouvre la table **User** → trouve ton compte → mets `role` = `ADMIN` → Save.
3. Recharge le site : tu as accès à `/admin`.

---

## Étape 7 — Vérifications après mise en ligne

- [ ] `https://ton-domaine/` s'ouvre, filtre 18+ OK.
- [ ] `https://ton-domaine/sitemap.xml` répond.
- [ ] `https://ton-domaine/robots.txt` pointe vers ton sitemap.
- [ ] Tu peux t'inscrire, publier une annonce, l'admin la valide.
- [ ] Complète les **pages légales** (admin → Pages légales) avec tes vraies infos.
- [ ] Inscris le site dans la **Google Search Console** et soumets le sitemap.

---

## À savoir (limites de cette v1)

- **Photos** : stockées dans la base (encodées). Ça fonctionne pour démarrer, mais prévois un **stockage CDN** (Cloudflare R2 / Bunny / S3) avant d'avoir beaucoup d'utilisateurs.
- **Mobile Money** : la recharge est encore **simulée**. Tu peux ouvrir la v1 ainsi, puis brancher un agrégateur (Orange Money / MTN MoMo) pour la monétisation réelle.
- **À chaque changement de schéma plus tard** : relance `npx prisma db push` avec l'URL Neon.
