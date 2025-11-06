# 🚀 Guide Configuration Supabase - ORIF Menu

## 📋 Étapes à suivre sur supabase.com

### 1️⃣ Création du projet Supabase
1. Connectez-vous sur [supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Choisissez votre organisation (ou créez-en une)
4. Nommez votre projet : `orif-menu-simple`
5. Choisissez une région proche (Europe West recommend)
6. Créez un mot de passe fort pour la base de données
7. Cliquez sur "Create new project"

### 2️⃣ Récupération des clés API
1. Une fois le projet créé, allez dans **Settings** → **API**
2. Copiez l'**URL** du projet (ressemble à : `https://xxxx.supabase.co`)
3. Copiez la clé **anon/public** (commence par `eyJ...`)

### 3️⃣ Configuration locale
1. Ouvrez le fichier `.env.local` dans votre projet
2. Remplacez les valeurs par vos vraies clés :
```bash
VITE_SUPABASE_URL=https://votre-projet-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4️⃣ Création des tables en base
1. Dans Supabase, allez dans **SQL Editor**
2. Cliquez sur "New query"
3. Copiez-collez TOUT le contenu du fichier `supabase_setup.sql`
4. Cliquez sur "Run" (ou Ctrl+Enter)
5. Vérifiez qu'il n'y a pas d'erreurs

### 5️⃣ Vérification des tables
1. Allez dans **Table Editor**
2. Vous devriez voir les tables suivantes :
   - `profiles`
   - `meal_types`
   - `categories`
   - `menus`
   - `menu_days`
   - `meal_items`

### 6️⃣ Configuration des permissions (RLS)
Les permissions sont déjà configurées dans le script SQL, mais vérifiez dans **Authentication** → **Policies** que vous avez :
- Politiques sur `menus` (lecture/écriture)
- Politiques sur `meal_types` (lecture)
- Politiques sur `categories` (lecture)
- etc.

## 🧪 Test de connexion

### Option 1 : Via le navigateur
1. Démarrez votre application : `npm run dev`
2. Ouvrez la console développeur (F12)
3. Vérifiez les logs Supabase

### Option 2 : Via un composant test
Ajoutez temporairement dans `App.jsx` :
```jsx
import { testConnection } from './lib/supabase.js'

// Dans useEffect ou au clic d'un bouton
testConnection()
```

## 🔒 Sécurité Production

### Variables d'environnement Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet `orif-menu-simple`
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez :
   - `VITE_SUPABASE_URL` = votre URL Supabase
   - `VITE_SUPABASE_ANON_KEY` = votre clé anon

### Redéploiement
Après avoir ajouté les variables, redéployez :
```bash
git add .
git commit -m "feat: Intégration complète Supabase"
git push origin main
```

## 🛠️ Utilisation dans le code

### Import du hook
```jsx
import { useMenus } from './hooks/useMenus.js'

function MonComposant() {
  const { 
    menus, 
    currentMenu, 
    loading, 
    error,
    loadMenuByWeek,
    createMenu 
  } = useMenus()

  // Utilisation...
}
```

### Import du service
```jsx
import { MenuService } from './services/MenuService.js'

// Utilisation directe
const menus = await MenuService.getAllMenus()
const menu = await MenuService.getMenuByWeek(2024, 45)
```

## 🚨 Debugging courant

### Erreur "Variables d'environnement manquantes"
- Vérifiez que `.env.local` existe et contient les bonnes clés
- Redémarrez le serveur de dev (`npm run dev`)

### Erreur "Table doesn't exist"
- Exécutez le script `supabase_setup.sql` dans Supabase SQL Editor
- Vérifiez dans Table Editor que les tables sont créées

### Erreur "Authentication required"
- Vérifiez les politiques RLS dans Supabase
- Pour les tests, vous pouvez temporairement désactiver RLS

### Erreur de CORS
- Normalement résolu automatiquement par Supabase
- Vérifiez que votre domaine Vercel est autorisé dans Supabase Settings

## ✅ Checklist finale

- [ ] Projet Supabase créé
- [ ] Clés API récupérées et configurées dans `.env.local`
- [ ] Script SQL exécuté sans erreurs
- [ ] Tables visibles dans Table Editor
- [ ] Application locale fonctionne sans erreurs console
- [ ] Variables d'environnement ajoutées sur Vercel
- [ ] Déployement Vercel réussi avec Supabase

---

🎯 **Votre base de données Supabase est maintenant prête !**