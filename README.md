# LINK – Plateforme de stages pour écoles tech

> SaaS collaboratif qui centralise les expériences de stage, les offres et les données d'insertion professionnelle.

## Structure (Monorepo)

```
LINK/
├── apps/
│   ├── backend/          # Node.js + Express MVC API
│   └── frontend/         # React + Vite SPA
├── packages/
│   └── shared/           # Constantes et utilitaires partagés
├── docker/
│   ├── backend/          # Dockerfile backend
│   └── frontend/         # Dockerfile + nginx.conf
├── github/workflows/     # CI/CD GitHub Actions
├── docker-compose.yml
└── package.json          # npm workspaces root
```

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit, React Query |
| Backend | Node.js, Express.js (MVC), Mongoose |
| Base de données | MongoDB |
| Auth | JWT (access + refresh tokens) + OAuth (GitHub, Google) |
| PDF | Puppeteer |
| DevOps | Docker, docker-compose, GitHub Actions → AWS ECS |

## Architecture Backend MVC

```
apps/backend/src/
├── controllers/    # Logique métier
├── models/         # Schémas Mongoose
├── routes/         # Définition des endpoints
├── middleware/     # Auth, validation, rate limiting, upload
├── services/       # Email, PDF, agrégateur offres
└── config/         # MongoDB, Passport OAuth
```

## Démarrage rapide

### Prérequis
- Node.js >= 18
- MongoDB local ou Atlas
- npm >= 9

### Installation

```bash
# Cloner le repo et installer toutes les dépendances
npm install

# Configurer le backend
cp apps/backend/.env.example apps/backend/.env
# Éditer .env avec vos valeurs (MongoDB URI, JWT secrets, OAuth keys...)

# Démarrer en dev (backend + frontend en parallèle)
npm run dev
```

### Avec Docker

```bash
docker-compose up --build
# Frontend → http://localhost
# Backend API → http://localhost:5000/api/health
```

## Variables d'environnement

Voir [apps/backend/.env.example](apps/backend/.env.example) pour la liste complète.

## API Endpoints principaux

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/v1/auth/register` | Inscription |
| POST | `/api/v1/auth/login` | Connexion |
| GET | `/api/v1/companies` | Liste entreprises |
| POST | `/api/v1/companies/:id/reviews` | Ajouter un avis |
| GET | `/api/v1/offers` | Liste offres de stage |
| POST | `/api/v1/offers/:id/apply` | Suivre une offre (Kanban) |
| GET | `/api/v1/dashboard` | KPIs école (admin) |
| GET | `/api/v1/users/me/profile-pdf` | Générer CV PDF |

## Rôles utilisateurs

- `student` – Consulte, postule, laisse des avis
- `admin` – Gestion école, modération, dashboard analytique  
- `superadmin` – Gestion multi-écoles, plans SaaS

## CI/CD

Le pipeline `.github/workflows/ci-cd.yml` :
1. **Test** – lint + tests Jest sur chaque PR
2. **Build** – images Docker poussées sur DockerHub (`main` seulement)
3. **Deploy** – déploiement sur AWS ECS (`main` seulement)

Secrets GitHub requis : `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.
