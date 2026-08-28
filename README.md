# LUBUMBASHIPOST

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

Remplacez ou mettez à jour les fichiers officiels dans :

```
public/logo/lushipost-monogram.png  → Symbole lp (favicon, mobile)
public/logo/lushipost-brand.png     → Logo complet LUBUMBASHIPOST
```

## Architecture

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── [slug]/             # Pages catégories
│   ├── article/[slug]/     # Pages articles
│   ├── video/              # Rubrique vidéo
│   ├── live/               # LUBUMBASHIPOST LIVE
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

## Guide d’utilisation

LUBUMBASHIPOST distingue clairement le site public, l’espace journaliste et le back-office. Toutes les interfaces sont conçues pour mobile, tablette et ordinateur.

### Lecteur / utilisateur

Un visiteur peut :

- parcourir la Une, les rubriques locales et internationales, les vidéos et les directs ;
- lire les articles, les partager et consulter les contenus associés ;
- utiliser la recherche par mots-clés ;
- s’inscrire à la newsletter puis confirmer son adresse e-mail ;
- créer ou utiliser un compte lecteur avec Google ou un lien de connexion par e-mail, selon la configuration ;
- consulter les pages éditoriales : charte, corrections, fact-checking, sources, confidentialité et mentions légales.

Les compteurs de lecture sont enregistrés à chaque consultation. La rubrique publique reste utilisable sans compte.

### Journaliste

Après connexion, un journaliste accède à `/journaliste` et peut :

1. créer un article et l’enregistrer comme brouillon ;
2. choisir la rubrique, le sous-titre, le chapô, la zone géographique, l’image et le contenu ;
3. importer une image ou en choisir une dans la médiathèque ;
4. prévisualiser son article avant publication ;
5. soumettre un article à validation ou proposer une programmation ;
6. suivre le statut de ses publications (brouillon, en attente, programmé, publié ou refusé) et lire le motif d’un refus ;
7. recevoir les notifications éditoriales ;
8. proposer une vidéo depuis son espace.

Un journaliste ne publie pas directement sans permission éditoriale : son contenu suit le workflow de validation.

### Administrateur et rédaction

Le back-office `/admin` est protégé par authentification et permissions. Selon son rôle, le membre de la rédaction peut :

- gérer les articles, les statuts, les corrections, la modération et les publications programmées ;
- prévisualiser puis publier immédiatement les contenus autorisés ;
- organiser les rubriques, la Une et les alertes « dernières informations » ;
- gérer la médiathèque, les vidéos et les directs ;
- modérer les commentaires ;
- créer, modifier, activer ou désactiver les comptes de la rédaction ;
- paramétrer l’identité du site, les liens sociaux et les réglages éditoriaux ;
- consulter le tableau de bord, les contenus les plus lus et l’évolution journalière des lectures ;
- consulter les éléments de traçabilité du workflow éditorial.

### Rôles et accès

| Rôle | Accès principal |
|---|---|
| Abonné | Lecture, newsletter et compte personnel |
| Journaliste | Création et suivi de ses contenus, soumission à validation |
| Éditeur | Correction et publication selon permissions |
| Rédacteur en chef | Validation éditoriale, UNE, rubriques et publication |
| Modérateur | Modération des commentaires |
| Vidéaste | Gestion des vidéos et médias autorisés |
| Super Admin | Accès complet, utilisateurs et paramètres |

## Fonctionnalités

### Site public
- Homepage éditoriale avec UNE configurable
- 19 rubriques (Lubumbashi, RDC, Enquête, Afrique, International...)
- Pages articles professionnelles (Schema.org, partage social)
- Barre breaking news
- Recherche avec filtres
- Newsletter
- Vidéo et Live
- PWA (manifest.json)
- Mobile-first responsive

### Back-office (/admin)
- Dashboard newsroom avec statistiques
- Courbe des lectures quotidiennes sur 14 jours, alimentée par les consultations enregistrées
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

Après le déploiement, testez : la page d’accueil, une page article, la connexion, la newsletter et les espaces `/journaliste` et `/admin`. Vérifiez également que `NEXTAUTH_URL` et `NEXT_PUBLIC_SITE_URL` correspondent exactement à l’URL publique Vercel.

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

© LUBUMBASHIPOST — Tous droits réservés.
