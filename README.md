# 🍽️ Menu Cafét - Application de Gestion des Menus

Application web React pour la gestion des menus de la cafétéria.

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev
``` 

## 📁 Structure du Projet

```
orif-menu/
├── 📄 README.md              # Ce fichier
├── 📄 package.json           # Dépendances npm
├── 📄 vite.config.js         # Configuration Vite
├── � eslint.config.js       # Configuration ESLint
├── 📄 index.html             # Point d'entrée HTML
├── 📁 src/                   # Code source React
│   ├── 📄 App.jsx            # Composant principal
│   ├── 📄 main.jsx           # Point d'entrée React
│   ├── 📁 components/        # Composants réutilisables
│   ├── 📁 pages/             # Pages de l'application
│   ├── 📁 services/          # Services API
│   ├── 📁 hooks/             # Hooks React personnalisés
│   ├── 📁 utils/             # Utilitaires
│   └── 📁 data/              # Données par défaut
├── 📁 public/                # Fichiers statiques
├── 📁 docs/                  # 📚 Documentation complète
└── 📁 database/              # 🗄️ Scripts SQL et schémas

```

## � Fonctionnalités

- ✅ **Affichage des menus** : Consultation des menus par jour et semaine
- ✅ **Interface responsive** : Optimisée mobile et desktop
- ✅ **Administration** : Édition des menus par date et semaine
- ✅ **Navigation intuitive** : Menu drawer avec navigation fluide
- ✅ **Mode hors ligne** : Fonctionnement avec données de fallback

## � Documentation

Toute la documentation détaillée se trouve dans le dossier [`docs/`](./docs/):
- Guides de développement et déploiement
- Documentation technique et schémas
- Diagrammes d'architecture

## 🗄️ Base de Données

Les scripts SQL et schémas se trouvent dans le dossier [`database/`](./database/):
- Scripts de création MySQL
- Configuration Supabase
- Diagrammes EER

## 🛠️ Technologies

- **Frontend** : React + Vite
- **Styling** : CSS pur avec design responsive
- **Backend** : Supabase (PostgreSQL)
- **Déploiement** : Vercel

## � Support

Consultez les guides dans `docs/` ou les scripts dans `database/` selon vos besoins.