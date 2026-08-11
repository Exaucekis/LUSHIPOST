# Déploiement LUSHIPOST sur Vercel

Guide pas à pas pour mettre LUSHIPOST en production sur [Vercel](https://vercel.com).

---

## 1. Prérequis

- Compte [Vercel](https://vercel.com) (gratuit)
- Compte [GitHub](https://github.com) avec le dépôt `Exaucekis/-LUSHIPOST`
- Base PostgreSQL cloud (**Neon** recommandé — gratuit)

---

## 2. Créer la base de données (Neon)

1. Allez sur [neon.tech](https://neon.tech) → créez un projet `lushipost`
2. Copiez les deux URLs de connexion :
   - **Pooled connection** → `DATABASE_URL`
   - **Direct connection** → `DIRECT_URL`

> Si vous n'avez qu'une URL, utilisez la même pour les deux variables en local.  
> En production avec Neon, utilisez impérativement l'URL poolée pour `DATABASE_URL`.

---

## 3. Initialiser la base (depuis votre machine)

```bash
# Configurez .env avec DATABASE_URL et DIRECT_URL Neon
cp .env.example .env

# Poussez le schéma Prisma
npm run db:push

# Insérez les données de démo (catégories, articles, admin)
npm run db:seed
```

Comptes créés par le seed :
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | admin@lushipost.com | admin123 |
| Journaliste | journaliste@lushipost.com | journaliste123 |

---

## 4. Importer le projet sur Vercel

1. [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → sélectionnez `Exaucekis/-LUSHIPOST`
3. Framework détecté : **Next.js** (automatique)
4. **Ne modifiez pas** le Build Command (déjà configuré dans `vercel.json`)

---

## 5. Variables d'environnement Vercel

Dans **Project Settings → Environment Variables**, ajoutez :

| Variable | Valeur | Environnements |
|----------|--------|----------------|
| `DATABASE_URL` | URL poolée Neon (`?pgbouncer=true`) | Production, Preview, Development |
| `DIRECT_URL` | URL directe Neon (sans pgbouncer) | Production, Preview, Development |
| `NEXTAUTH_SECRET` | Chaîne aléatoire 32+ caractères | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://votre-projet.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://votre-projet-git-branche.vercel.app` | Preview |
| `NEXT_PUBLIC_SITE_URL` | Même valeur que `NEXTAUTH_URL` | Production / Preview |
| `NEXT_PUBLIC_SITE_NAME` | `LUSHIPOST` | Tous |

### Générer NEXTAUTH_SECRET

```bash
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Ou avec OpenSSL
openssl rand -base64 32
```

> **Important** : après le premier déploiement, mettez à jour `NEXTAUTH_URL` et `NEXT_PUBLIC_SITE_URL` avec l'URL réelle Vercel (ex. `https://lushipost.vercel.app`).

---

## 6. Déployer

Cliquez **Deploy**. Vercel va :

1. Cloner le dépôt GitHub
2. Exécuter `npm install` → `prisma generate` (postinstall)
3. Exécuter `prisma generate && next build`
4. Mettre en ligne l'application

---

## 7. Après le déploiement

### Mettre à jour les URLs de production

Une fois l'URL connue (ex. `https://lushipost.vercel.app`) :

1. Vercel → Settings → Environment Variables
2. Mettez à jour `NEXTAUTH_URL` et `NEXT_PUBLIC_SITE_URL`
3. **Redeploy** (Deployments → ⋯ → Redeploy)

### Domaine personnalisé (optionnel)

Settings → Domains → ajoutez `lushipost.com` ou votre domaine.  
Puis mettez à jour `NEXTAUTH_URL` et `NEXT_PUBLIC_SITE_URL` avec le domaine final.

### Vérifications

- [ ] Page d'accueil : `https://votre-url.vercel.app`
- [ ] Admin : `https://votre-url.vercel.app/admin`
- [ ] Connexion admin fonctionne
- [ ] Articles s'affichent (base Neon seedée)
- [ ] Sitemap : `/sitemap.xml`
- [ ] RSS : `/feed.xml`

---

## 8. Déploiements automatiques

Chaque `git push` sur `main` déclenche un redéploiement automatique Vercel.

```bash
git add .
git commit -m "feat: mise à jour"
git push origin main
```

---

## 9. Région serveur

Le projet est configuré pour la région **`cdg1` (Paris)** dans `vercel.json`, plus proche de la RDC pour de meilleures latences.

Pour changer : modifiez `"regions": ["cdg1"]` dans `vercel.json`.

---

## 10. Dépannage

| Problème | Solution |
|----------|----------|
| Build échoue sur Prisma | Vérifiez que `DATABASE_URL` et `DIRECT_URL` sont définies dans Vercel |
| Admin : erreur connexion | Vérifiez `NEXTAUTH_SECRET` et `NEXTAUTH_URL` |
| Pages vides (pas d'articles) | Exécutez `npm run db:seed` en local avec l'URL Neon |
| Erreur pool connexions | Utilisez l'URL **poolée** (`?pgbouncer=true`) pour `DATABASE_URL` |
| Images Unsplash lentes | Normal en preview ; configurez un CDN/S3 pour la prod |

---

## Structure des fichiers Vercel

```
vercel.json          → Config build + région cdg1
.env.example         → Template variables
DEPLOYMENT.md        → Ce guide
prisma/schema.prisma → directUrl pour Neon/Vercel
package.json         → build: prisma generate && next build
```

---

© LUSHIPOST — Déploiement Vercel
