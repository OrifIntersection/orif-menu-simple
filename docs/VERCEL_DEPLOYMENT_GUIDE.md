# 🚀 Guide Déploiement Vercel avec Supabase

## 📋 Variables d'environnement à ajouter sur Vercel

### 1️⃣ Se connecter à Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub

### 2️⃣ Sélectionner votre projet
1. Trouvez votre projet `orif-menu-simple`
2. Cliquez dessus pour ouvrir le dashboard

### 3️⃣ Ajouter les variables d'environnement
1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez ces 2 variables **EXACTEMENT** comme suit :

#### Variable 1 :
- **Name** : `VITE_SUPABASE_URL`
- **Value** : `https://ndclkhqugqakgggehfxs.supabase.co`
- **Environment** : Production, Preview, Development (cocher les 3)

#### Variable 2 :
- **Name** : `VITE_SUPABASE_ANON_KEY`
- **Value** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kY2xraHF1Z3Fha2dnZ2VoZnhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzE1NDYsImV4cCI6MjA3ODAwNzU0Nn0.YF3fp2C0wZonw6waZESXFN1LxBmfCEikQsH_kix70kg`
- **Environment** : Production, Preview, Development (cocher les 3)

### 4️⃣ Sauvegarder
1. Cliquez sur **"Save"** pour chaque variable
2. Les variables sont maintenant configurées

### 5️⃣ Redéploiement automatique
Après avoir poussé le code avec `git push origin main`, Vercel va :
1. Détecter les nouveaux commits
2. Redéployer automatiquement 
3. Utiliser les nouvelles variables d'environnement
4. Votre app sera disponible avec Supabase fonctionnel

## ✅ Résultat attendu
- URL Vercel : https://orif-menu-simple.vercel.app
- Application avec données Supabase en temps réel
- Menus de la cafétéria ORIF affichés depuis la base de données

## 🚨 Important
- Les clés sont déjà exposées dans le `.env.local` (normal pour les clés publiques)
- La clé `anon` est sécurisée par les Row Level Security (RLS) de Supabase
- Ne JAMAIS partager la clé `service_role` (non utilisée ici)

---
🎯 **Votre app React + Supabase sera en production !**