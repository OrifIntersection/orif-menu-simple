# Configuration de l'Authentification Supabase Magic Link

## Vue d'ensemble

Ce projet utilise l'authentification Supabase avec Magic Link pour sécuriser l'accès à l'administration du menu. L'authentification fonctionne en mode dégradé quand Supabase n'est pas configuré.

## 🔧 Configuration Supabase

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com) et créer un compte
2. Créer un nouveau projet
3. Noter l'URL du projet et la clé anonyme

### 2. Configurer la base de données

Exécuter le script SQL `database/auth_rls_setup.sql` dans l'éditeur SQL de Supabase :

```sql
-- Ce script configure :
-- ✅ Système de profils utilisateur avec rôles
-- ✅ Row Level Security (RLS) 
-- ✅ Fonction is_admin() pour vérifier les permissions
-- ✅ Triggers automatiques pour création de profils
-- ✅ Fonction promote_to_admin() pour promouvoir un utilisateur
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Important :** 
- Ne jamais commiter `.env.local` 
- Utiliser les vrais URL et clés de votre projet Supabase

## 🚀 Flux d'authentification

### Mode Production (Supabase configuré)

1. **Accueil** → Utilisateur clique sur dropdown UserStatus
2. **Login** → Redirection vers `/login`, saisie email
3. **Magic Link** → Email envoyé avec lien de connexion
4. **Callback** → Retour sur `/auth/callback`, vérification session
5. **Admin** → Redirection vers `/admin` si authentifié

### Mode Développement (Sans Supabase)

- Mode simulation disponible
- Authentification factice pour tester l'interface
- Avertissements visuels indiquant le mode simulation

## 📁 Structure des fichiers

```
src/
├── lib/
│   └── supabase.js          # Configuration et helpers Supabase
├── contexts/
│   └── AuthContext.jsx      # Contexte d'authentification global
├── pages/
│   ├── LoginPage.jsx        # Page de connexion avec formulaire email
│   └── AuthCallback.jsx     # Page de retour Magic Link
├── components/
│   └── UserStatus.jsx       # Composant statut utilisateur avec dropdown
database/
└── auth_rls_setup.sql       # Script SQL pour configurer la DB
```

## 🔐 Sécurité

### Row Level Security (RLS)

- **Lecture publique** : Tous peuvent lire les menus
- **Écriture admin** : Seuls les admins peuvent modifier
- **Profils protégés** : Accès en lecture seule aux profils

### Rôles utilisateur

- **guest** : Lecture seule des menus publics
- **admin** : Accès complet lecture/écriture

### Promotion d'un utilisateur en admin

```sql
-- Dans l'éditeur SQL Supabase
SELECT promote_to_admin('email@exemple.com');
```

## 🧪 Tests

### Tester l'authentification

1. **Mode simulation** (sans Supabase) :
   - Cliquer sur UserStatus → "Se connecter" 
   - Accès immédiat à l'admin

2. **Mode production** (avec Supabase) :
   - Aller sur `/login`
   - Saisir un email valide
   - Vérifier la réception du Magic Link
   - Cliquer sur le lien pour se connecter

### Vérifier les permissions

1. **Utilisateur non-admin** :
   - Ne voit pas le bouton "Administration" dans MenuDrawer
   - Accès interdit aux pages `/admin/*`

2. **Utilisateur admin** :
   - Voit tous les boutons d'administration
   - Accès complet aux fonctionnalités

## 🛠️ Développement

### Ajouter de nouvelles protections

```jsx
// Dans un composant
import { useAuth } from '../hooks/useAuth'

function AdminOnlyComponent() {
  const { isAdmin } = useAuth()
  
  if (!isAdmin()) {
    return <div>Accès interdit</div>
  }
  
  return <div>Contenu admin</div>
}
```

### Debugging

```javascript
// Vérifier l'état de Supabase
import { isSupabaseConfigured, testConnection } from '../lib/supabase'

console.log('Supabase configuré:', isSupabaseConfigured())
testConnection()
```

## 📱 Déploiement

### Variables d'environnement Vercel

1. Dans le dashboard Vercel, aller dans Settings → Environment Variables
2. Ajouter :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### URL de redirection Supabase

Dans le dashboard Supabase, aller dans Authentication → URL Configuration :

```
Site URL: https://menu-cafet.vercel.app
Redirect URLs: 
- http://localhost:5173/auth/callback
- http://localhost:5174/auth/callback  
- http://localhost:5175/auth/callback
- https://menu-cafet.vercel.app/auth/callback
```

## 🆘 Dépannage

### Erreur "Supabase non configuré"
- Vérifier que `.env.local` existe et contient les bonnes variables
- Redémarrer le serveur de développement

### Magic Link ne fonctionne pas
- Vérifier les URL de redirection dans Supabase
- Contrôler les spams dans la boîte mail
- Vérifier que l'email est confirmé dans Supabase Auth

### Erreurs de permissions
- Vérifier que les politiques RLS sont appliquées
- Contrôler que l'utilisateur a le bon rôle via `SELECT * FROM profiles`
- Utiliser `promote_to_admin()` si nécessaire

## 🔗 Liens utiles

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Magic Links Supabase](https://supabase.com/docs/guides/auth/auth-magic-link)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)