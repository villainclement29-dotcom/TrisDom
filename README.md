# Trisdom — Agentic Canvas

> Projet universitaire réalisé à l'**IUT de Lannion** dans le cadre d'un module de développement web avancé — BUT MMI 3ème année.

**Trisdom** est une plateforme d'apprentissage assistée par IA qui permet aux enseignants et aux étudiants de créer, structurer et explorer des contenus pédagogiques sous forme de **canvas visuel interactif**. Des agents IA génèrent automatiquement des cours, exercices, corrections et quiz à partir de n'importe quel sujet.

---

## Fonctionnalités

- **Canvas de connaissances** — Organisez vos sujets sous forme de graphe de nœuds connectés, mis en page automatiquement avec l'algorithme Dagre.
- **Génération de contenu par IA** — Décomposition de cours en modules, génération de leçons détaillées, exercices, corrections et QCM.
- **Cycle d'apprentissage intégré** — Chaque module suit le triptyque *Apprendre → Appliquer → Évaluer*.
- **Quiz interactifs** — QCM à choix multiples avec score et review des réponses.
- **Gestion de projets** — Galerie de projets persistée en base de données (Supabase).
- **Authentification** — Inscription et connexion sécurisées via Supabase Auth.
- **Interface de chat** — Panneau de discussion pour interagir avec les agents IA.

---

## Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| Framework | React 19 + Vite |
| Routage | Raviger |
| Styling | Radix UI + Stitches (CSS-in-JS) |
| Graph | @xyflow/react (React Flow) + Dagre |
| État | Nanostores |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| IA | OpenAI SDK (compatible API OpenAI) |
| Markdown | Marked |
| Monorepo | Yarn 4 (Workspaces) |

---

## Architecture du projet

Le projet est organisé en **monorepo Yarn** avec plusieurs packages sous le namespace `@agentix` :

```
packages/
├── _app/          # Application principale (routing, pages)
│   └── src/
│       ├── Connexion/   # Pages Login / Register
│       ├── Gallery/     # Galerie de projets
│       └── home/        # Espace de travail principal
│
├── canvas/        # @agentix/canvas — Canvas React Flow
│   └── src/flow/
│       ├── FlowCanvas.jsx        # Composant principal du graphe
│       ├── BasicNode.jsx         # Nœud simple
│       └── NodeWithToolbar.jsx   # Nœud interactif avec actions IA
│
├── ai/            # @agentix/ai — Intégrations IA
│   └── src/
│       ├── actions/
│       │   ├── agent.js      # Exécuteur d'agents générique
│       │   ├── openai.js     # Configuration du client OpenAI
│       │   ├── explain.js    # Génération de leçons
│       │   ├── exercises.js  # Génération d'exercices + corrections
│       │   └── quizz.js      # Génération de QCM
│       └── chat/             # Interface de chat (UI)
│
├── base/          # @agentix/base — Actions CRUD & composants partagés
│   └── src/
│       ├── actions/          # createProject, updateProject, login, register
│       └── components/       # Markdown, Qcm, SaveButton
│
├── store/         # @agentix/store — État global (Nanostores)
│   └── src/
│       ├── canvas.js         # Nœuds et arêtes du graphe
│       ├── agents.js         # Configurations des agents IA
│       ├── response.js       # Contenu généré (leçons, exercices, quiz)
│       └── chat.js           # Messages du chat
│
├── content-box/   # @agentix/content-box — Panneau d'affichage du contenu
│
└── util/          # @agentix/util — Utilitaires partagés
    └── src/
        ├── agents.js         # Prompts et rôles des agents
        ├── layout.js         # Mise en page Dagre
        ├── supabase.js       # Client Supabase
        └── Component/        # Composants UI réutilisables
```

---

## Pipeline de génération de contenu

```
Utilisateur clique sur un nœud
        ↓
[ Apprendre ] → ContentModuleAgent génère une leçon en Markdown
        ↓
[ Appliquer ] → ExercicesAgent génère 10 exercices + CorrectionAgent les corrige
        ↓
[ Évaluer ]  → QcmAgent génère un QCM interactif (JSON structuré)
        ↓
Résultats sauvegardés en base Supabase
```

Les nœuds changent de couleur pour indiquer l'avancement :
- **Vert** — Leçon générée
- **Or** — Quiz en cours / incomplet
- **Vert vif** — Score parfait au quiz
- **Rouge** — Quiz échoué

---

## Installation

### Prérequis

- **Node.js** v18+
- **Yarn** v4 (via Corepack)

```bash
npm install -g corepack
corepack enable
```

### Cloner et installer

```bash
git clone <url-du-repo>
cd project-agentic-canvas-villainclement29-dotcom
yarn install
```

> Si vous avez un problème avec Yarn Berry, exécutez `yarn set version berry` puis `yarn install`.

### Variables d'environnement

Créez un fichier `.env` dans `packages/_app/` :

```env
VITE_PUBLIC_SUPABASE_URL=<votre_url_supabase>
VITE_PUBLIC_SUPABASE_KEY=<votre_clé_publique_supabase>
VITE_PUBLIC_LLM_BASE_URL=<url_api_openai_ou_compatible>
VITE_PUBLIC_LLM_API_KEY=<votre_clé_api>
VITE_PUBLIC_LLM_MODEL=<nom_du_modèle>
```

> Le projet est compatible avec n'importe quelle API OpenAI-compatible (OpenAI, Ollama, Groq, etc.).

### Schéma de base de données Supabase

Créez une table `projects` dans votre projet Supabase :

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text,
  author text,
  data jsonb,
  "LearnResponses" jsonb,
  "ExercisesResponses" jsonb,
  qcm jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activer Row Level Security
alter table projects enable row level security;

create policy "Users can manage their own projects"
  on projects for all
  using (auth.uid() = user_id);
```

---

## Lancer l'application

```bash
# Démarrer le serveur de développement
yarn dev

# Build de production
yarn build

# Prévisualiser le build
yarn preview
```

L'application est accessible sur [http://localhost:5173](http://localhost:5173) par défaut.

---

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `yarn dev` | Démarre le serveur de développement (HMR activé) |
| `yarn build` | Compile pour la production |
| `yarn preview` | Prévisualise le build de production |
| `yarn lint` | Analyse statique du code (ESLint) |

---

## Agents IA

Le système repose sur **8 agents spécialisés**, chacun avec son propre prompt système, sa température et son format de réponse :

| Agent | Rôle |
|-------|------|
| `HeadlineAgent` | Génère des titres de sujets |
| `CourseModuleAgent` | Découpe un cours en modules |
| `ModuleTopicsAgent` | Décompose un module en 3 sujets précis |
| `ToolsModuleAgent` | Crée le cycle fixe Apprendre / Appliquer / Évaluer |
| `ContentModuleAgent` | Rédige une leçon pédagogique complète en Markdown |
| `ExercicesAgent` | Génère 10 exercices pratiques |
| `CorrectionAgent` | Produit les corrections détaillées des exercices |
| `QcmAgent` | Crée un QCM structuré en JSON (4 choix, scoring) |

---

## Contexte académique

Ce projet a été réalisé dans le cadre d'un **projet universitaire à l'IUT de Lannion** (Département MMI — Métiers du Multimédia et de l'Internet), en 3ème année de BUT MMI.

---

## Licence

Ce projet est fourni à titre éducatif. Aucune licence commerciale n'est accordée.
