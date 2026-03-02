# Eaglet

Eaglet est une plateforme web moderne.

## 🚀 Technologies

Ce projet utilise une stack moderne et performante :

*   **Backend Framework :** [AdonisJS v6](https://adonisjs.com/)
*   **Frontend Library :** [React](https://react.dev/)
*   **Glue :** [Inertia.js](https://inertiajs.com/)
*   **Styling :** [TailwindCSS v4](https://tailwindcss.com/)
*   **Database :** [PostgreSQL](https://www.postgresql.org/) (avec pgvector)
*   **Cache/Queue :** [Redis](https://redis.io/)
*   **Monorepo :** [TurboRepo](https://turbo.build/)
*   **Infrastructure :** [Docker](https://www.docker.com/)

## ✨ Fonctionnalités

*   **Authentification et Gestion des Utilisateurs** : Inscription, connexion, réinitialisation de mot de passe, authentification sécurisée.
*   **Dashboard** : Espace connecté avec gestion de profil.
*   **Temps Réel** : Notifications en direct.
*   **Administration** : Gestion des utilisateurs et des rôles.

## 🛠️ Prérequis

Avant de commencer, assurez-vous d'avoir installé :

*   [Node.js](https://nodejs.org/) (v20+ recommandé)
*   [pnpm](https://pnpm.io/)
*   [Docker](https://www.docker.com/) & Docker Compose

## 📦 Installation

1.  **Cloner le dépôt :**

    ```bash
    git clone <votre-repo-url>
    cd Eaglet
    ```

2.  **Installer les dépendances :**

    ```bash
    pnpm install
    ```

3.  **Configurer les variables d'environnement :**

    Dupliquez le fichier d'exemple et ajustez les variables si nécessaire.

    ```bash
    cp apps/web/.env.example apps/web/.env
    ```

4.  **Lancer l'infrastructure (Base de données & Redis) :**

    ```bash
    docker-compose up -d
    ```

5.  **Exécuter les migrations :**

    ```bash
    cd apps/web
    node ace migration:run
    # ou pour injecter des données de test
    node ace db:seed
    cd ../..
    ```

## 🚀 Démarrage

Pour lancer l'application en mode développement :

```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3333`.

## 📂 Structure du Projet

Ce projet est un monorepo géré par TurboRepo :

*   `apps/web` : L'application principale (AdonisJS + React + Inertia).
*   `packages/ui` : Librairie de composants partagée (React + Tailwind).
*   `packages/eslint-config` : Configuration ESLint partagée.
*   `packages/typescript-config` : Configuration TypeScript partagée.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour les tâches à venir, consultez le fichier `todo.md`.

## ⚖️ Licence et Droits d'Utilisation

Ce projet est protégé par le droit d'auteur. Contrairement à de nombreux projets sur GitHub, **ce code n'est PAS Open Source** (au sens MIT/GPL).

**✅ Ce que vous POUVEZ faire :**
* Consulter le code pour comprendre son fonctionnement (transparence).
* Télécharger et lancer le projet **localement** pour le tester.
* Copier de petits extraits de code (snippets, fonctions utilitaires) pour vos propres projets personnels ou éducatifs.

**❌ Ce qu'il est STRICTEMENT INTERDIT de faire :**
* **Redéployer ce site** en production (publicement) sur un autre serveur/domaine.
* Utiliser le nom **"Eaglet"**, son logo ou son identité visuelle.
* Copier l'intégralité ou une partie substantielle du projet pour créer un service concurrent.

> ⚠️ **Note légale :** Le code est mis à disposition sous une licence **"Source Available"** restrictive. Tout usage commercial ou redéploiement non autorisé constitue une violation de la propriété intellectuelle. Voir le fichier [LICENSE](./LICENSE) pour le texte juridique complet.
# eaglet
# avok-IA
