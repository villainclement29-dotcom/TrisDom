Agentic Course Builder
Application web qui permet à un utilisateur de générer des cours sur le sujet de son choix grâce à un système d’agents IA. Les cours peuvent être plus ou moins complexes en fonction du prompt de l’utilisateur, et chaque sous‑thème dispose d’exercices et de QCM associés.

Fonctionnalités
Génération de cours par IA à partir d’un simple prompt (sujet + niveau de détail souhaité).

Gestion de la complexité du cours via le prompt :

“Je veux un cours rapide” → cours court.

“Je veux un cours détaillé” → cours long et approfondi.

Pas de précision → cours de complexité standard.

Structuration des cours en thèmes et sous‑thèmes, avec contenu pédagogique pour chacun.

Génération d’exercices et de QCM associés à chaque sous‑thème.

Suivi de la réussite par couleur sur les QCM :

Case verte = sous‑thème réussi.

Case rouge = sous‑thème à retravailler.

Galerie de projets : liste de tous les cours générés par l’utilisateur, recherche et consultation détaillée.

Authentification : création de compte, connexion et association des projets à un utilisateur.

# Setup 
## 1 Prérequis
Node.js installé (version recommandée : voir package.json).
​

Compte Supabase.
​

Clés/API des modèles d’IA nécessaires (OpenAI / autre, si utilisé).

## 2 Création du projet Supabase
Créer un nouveau projet sur Supabase.
​

Récupérer l’URL du projet et la clé anon dans l’onglet Project settings → API.
​

Dans Supabase, créer une table projects avec la structure suivante (inspirée de ton schéma) :
​

id : int8, clé primaire, auto‑increment.

created_at : timestamptz, valeur par défaut now().

title : text (titre du projet / cours).

author : text (nom ou identifiant de l’auteur si tu le stockes).

data : json (ou jsonb) pour stocker la structure globale du cours (thèmes, sous‑thèmes, contenu).

LearnResponses : jsonb pour stocker les réponses liées à la partie “cours / apprentissage”.

ExercisesResponses : jsonb pour stocker les réponses aux exercices.

qcm : jsonb pour stocker les QCM et l’état de réussite (couleurs, résultats, etc.).

user_id : uuid, clé étrangère vers auth.users.id (l’utilisateur Supabase).

Configurer la relation user_id → auth.users.id et les politiques RLS pour que chaque utilisateur ne voie que ses propres projets (facultatif dans le README, mais conseillé).

## 3 Variables d’environnement
Créer un fichier .env.local (ou .env) à la racine du projet et y ajouter au minimum :

supabase : 

NEXT_PUBLIC_SUPABASE_URL= your_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY= your_anon_key

groc llm : 

VITE_PUBLIC_LLM_API_KEY = your_key
VITE_PUBLIC_LLM_BASE_URL = https://api.groq.com/openai/v1
VITE_PUBLIC_LLM_MODEL = openai/gpt-oss-20b
## Ajouter ici les autres clés (par ex. OPENAI_API_KEY, etc.)
Adapter les noms aux variables effectivement utilisées dans ton code.

Installation du projet
Dans un terminal, à la racine du repo :

bash
## Cloner le dépôt
git clone https://github.com/Web-Interactive-Systems/project-agentic-canvas-villainclement29-dotcom.git

cd project-agentic-canvas-villainclement29-dotcom

## Installer les dépendances
npm install
### ou
yarn install
### ou
pnpm install
Lancement en développement
bash
npm run dev
### ou
yarn dev
### ou
pnpm dev
L’application sera disponible sur http://localhost:3000 (par défaut, si tu utilises Next.js).

# Utilisation de l’outil
## 1 Générer un cours
Se connecter ou créer un compte via l’interface d’authentification (gérée par Supabase).
​

Saisir un sujet dans le champ prévu (ex. “Algorithmes de tri”, “Histoire de la Bretagne”).

Préciser le niveau de détail dans le prompt :

“Je veux un cours rapide sur …” → génération d’un cours synthétique.

“Je veux un cours détaillé sur …” → génération d’un cours long.

Laisser la requête simple (sans précision) → cours de niveau standard.

Lancer la génération : les agents IA créent automatiquement la structure du cours (thèmes, sous‑thèmes, contenu).

## 2. Générer exercices et QCM
Pour chaque sous‑thème d’un cours, utiliser le bouton ou l’action “Générer exercices / QCM”.

L’outil crée :

Une série d’exercices (questions ouvertes avec correction detaillees).

Un QCM associé au sous‑thème.

L’utilisateur répond aux QCM directement dans l’interface.

## 3 Suivi de la progression
Chaque sous‑thème affiche une case colorée :

Vert : QCM réussi (score suffisant).

Rouge : QCM non réussi ou non complété.

Ce code couleur permet de visualiser rapidement les parties du cours à revoir.

## 4 Galerie de projets
Accès à une page listant tous les cours déjà générés par l’utilisateur.

Possibilité de :

Rechercher un projet par titre ou mot‑clé.

Ouvrir un projet pour relire le cours, les exercices et les QCM.

Reprendre la progression là où elle s’était arrêtée.

## Scripts disponibles
Dans package.json, plusieurs scripts sont disponibles (à adapter selon ton repo) :

dev : lance le serveur de développement.

build : génère la version de production de l’application.
​

start : démarre le serveur en mode production après un build.

lint : lance les linters (ESLint, etc.) s’ils sont configurés.

# Config
## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

##