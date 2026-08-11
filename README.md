# LUSHIPOST

**L'information au cœur de Lubumbashi.**

Plateforme d'information numérique professionnelle couvrant Lubumbashi, le Haut-Katanga, la RDC, l'Afrique et le monde.

## Stack technique

- **Frontend** : Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend** : Next.js API Routes, Server Actions
- **Base de données** : PostgreSQL + Prisma ORM
- **Auth** : NextAuth.js (Credentials + RBAC)
- **SEO** : Sitemap, RSS, Schema.org NewsArticle, Open Graph

## Démarrage rapide

### 1. Installation

```bash
npm install
```

### 2. Configuration

Copiez `.env.example` vers `.env` et configurez :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lushipost"
NEXTAUTH_SECRET="votre-secret-securise"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Base de données

```bash
npm run db:push
npm run db:seed
```

### 4. Lancement

```bash
npm run dev
```

Site public : [http://localhost:3000](http://localhost:3000)  
Back-office : [http://localhost:3000/admin](http://localhost:3000/admin)

**Comptes de démo (après seed) :**
- Admin : `admin@lushipost.com` / `admin123`
- Journaliste : `journaliste@lushipost.com` / `journaliste123`

## Logo officiel

Remplacez les fichiers placeholder par votre logo officiel :

```
public/logo/lushipost.svg       → Logo fond clair
public/logo/lushipost-white.svg → Logo fond sombre
```

**Ne pas** modifier les proportions, déformer ou remplacer le symbole du logo officiel.

## Architecture

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── [slug]/             # Pages catégories
│   ├── article/[slug]/     # Pages articles
│   ├── video/              # Rubrique vidéo
│   ├── live/               # LUSHIPOST Live
│   ├── recherche/          # Recherche full-text
│   ├── admin/              # Back-office newsroom
│   └── api/                # API REST
├── components/
│   ├── layout/             # Header, Footer, Breaking News
│   ├── articles/           # Cartes articles, partage
│   └── home/               # Sections homepage
└── lib/
    ├── data/               # Couche d'accès données
    ├── auth.ts             # Configuration NextAuth
    └── permissions.ts      # RBAC éditorial
```

## Fonctionnalités

### Site public
- Homepage éditoriale avec UNE configurable
- 18 rubriques (Lubumbashi, RDC, Afrique, International...)
- Pages articles professionnelles (Schema.org, partage social)
- Barre breaking news
- Recherche avec filtres
- Newsletter
- Vidéo et Live
- PWA (manifest.json)
- Mobile-first responsive

### Back-office (/admin)
- Dashboard newsroom avec statistiques
- Gestion articles (CRUD, statuts, programmation)
- Gestion de la UNE
- Médiathèque
- Gestion utilisateurs et rôles (RBAC)
- Analytics
- Journal d'audit

### Rôles éditoriaux
| Rôle | Permissions |
|------|-------------|
| Super Admin | Accès complet |
| Rédacteur en chef | UNE, publication, catégories |
| Éditeur | Modification, correction, publication |
| Journaliste | Création, modification propres articles |
| Modérateur | Commentaires |
| Vidéaste | Vidéos et médias |

## Déploiement Vercel

Consultez **[DEPLOYMENT.md](./DEPLOYMENT.md)** pour le guide complet.

**Résumé rapide :**

1. Créez une base PostgreSQL sur [Neon](https://neon.tech)
2. Importez le dépôt sur [vercel.com/new](https://vercel.com/new)
3. Ajoutez les variables d'environnement :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL poolée Neon (`?pgbouncer=true`) |
| `DIRECT_URL` | URL directe Neon |
| `NEXTAUTH_SECRET` | Secret aléatoire 32+ caractères |
| `NEXTAUTH_URL` | URL Vercel (ex. `https://lushipost.vercel.app`) |
| `NEXT_PUBLIC_SITE_URL` | Même URL que `NEXTAUTH_URL` |

4. Initialisez la base en local : `npm run db:push && npm run db:seed`
5. Deploy → chaque push sur `main` redéploie automatiquement

## SEO

- Meta tags dynamiques par page
- Open Graph et Twitter Cards
- Schema.org NewsArticle
- Sitemap XML automatique (`/sitemap.xml`)
- Flux RSS (`/feed.xml`)
- robots.txt

## Sécurité

- HTTPS (production)
- Headers de sécurité (X-Frame-Options, CSP-ready)
- RBAC granulaire
- Validation Zod sur les API
- Mots de passe hashés (bcrypt)
- Secrets en variables d'environnement
- Middleware auth sur /admin

## Licence

© LUSHIPOST — Tous droits réservés.
