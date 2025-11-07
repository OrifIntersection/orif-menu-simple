# 🚀 Guide Complet Git - Commandes Infaillibles

## ⚠️ IMPORTANT : Exécuter TOUTES ces commandes dans l'ordre exact !

---

## 📋 PHASE 1 : PRÉPARATION ET VÉRIFICATION

### 🚨 DIAGNOSTIC CRITIQUE : VÉRIFICATION DE BRANCHE

```bash
# COMMANDE OBLIGATOIRE AVANT TOUTE ACTION
git branch
```

**✅ VOUS ÊTES SUR MAIN (PARFAIT) :**
```
  feature/autre-branche
* main
```

**❌ VOUS ÊTES SUR UNE FEATURE (ATTENTION) :**
```
* feature/autre-branche
  main
```

**🔧 SI VOUS N'ÊTES PAS SUR MAIN :**
```bash
git checkout main
git branch  # Vérifier que * est maintenant sur main
```

### 🕵️ POURQUOI AVEZ-VOUS BASCULÉ DE BRANCHE ?

**Causes fréquentes :**
1. **Commande manuelle** : `git checkout feature/...`
2. **VS Code** : Clic sur nom de branche (barre de statut)
3. **Extensions Git** : Bascule automatique
4. **Clone/Pull** : Branche par défaut différente
5. **Session précédente** : Resté sur feature

**Vérifier l'historique :**
```bash
# PowerShell : voir les dernières commandes
Get-History | Select-Object -Last 10
```

---

## 📋 PHASE 1 : PRÉPARATION ET VÉRIFICATION

### 1.1 Vérifier l'état actuel
```bash
# Naviguer vers le projet (OBLIGATOIRE)
cd "c:\Users\ayesh\Desktop\projets_Orif\menu_cafet31-10\orif-menu"

# Vérifier la branche actuelle et l'état
git status

# Vérifier quelle branche est active
git branch

# Voir les derniers commits
git log --oneline -5
```

### 1.2 S'assurer d'être sur la bonne branche (MAIN RECOMMANDÉ)
```bash
# ✅ RECOMMANDÉ : Toujours travailler sur main pour éviter les complications
git checkout main

# ❌ ÉVITER : Travailler sur feature branches (galère de merge après)
# git checkout feature/react-router-implementation
```

**🚨 POURQUOI MAIN ET PAS FEATURE ?**
- ✅ Push direct sans merge compliqué
- ✅ Pas de conflits d'historiques
- ✅ Déploiement automatique sur URL principale
- ✅ Simplicité maximale

---

## 📋 PHASE 2 : SYNCHRONISATION AVEC LE REMOTE

### 2.1 Récupérer les dernières modifications (CRUCIAL)
```bash
# Récupérer toutes les infos du remote
git fetch origin

# Vérifier s'il y a des différences
git status
```

### 2.2 Mettre à jour la branche locale (SI NÉCESSAIRE)
```bash
# Si votre branche est en retard, faire un pull
git pull origin VOTRE_BRANCHE_ACTUELLE

# Par exemple :
# git pull origin feature/react-router-implementation
# OU
# git pull origin main
```

---

## 📋 PHASE 3 : PRÉPARATION DES FICHIERS

### 3.1 Vérifier les fichiers modifiés
```bash
# Voir tous les fichiers modifiés
git status

# Voir les détails des modifications
git diff
```

### 3.2 Ajouter les fichiers (MÉTHODES SÛRES)

#### Option A : Ajouter des fichiers spécifiques (RECOMMANDÉ)
```bash
# Ajouter un fichier spécifique
git add src/App.jsx

# Ajouter plusieurs fichiers spécifiques
git add src/App.jsx package.json package-lock.json

# Ajouter tous les fichiers d'un dossier
git add src/
```

#### Option B : Ajouter tous les fichiers (ATTENTION)
```bash
# Vérifier d'abord ce qui sera ajouté
git add --dry-run .

# Si tout est OK, ajouter tous les fichiers
git add .
```

### 3.3 Vérification avant commit
```bash
# Vérifier ce qui sera committé
git status

# Voir le diff de ce qui va être committé
git diff --cached
```

---

## 📋 PHASE 4 : COMMIT

### 4.1 Faire le commit avec un message clair
```bash
# Commit avec message descriptif
git commit -m "feat: Description claire de ce qui a été fait"

# Exemples de messages :
# git commit -m "feat: Ajout de nouvelles fonctionnalités React Router"
# git commit -m "fix: Correction du bug de navigation"
# git commit -m "docs: Mise à jour de la documentation"
# git commit -m "style: Amélioration du CSS des composants"
```

---

## 📋 PHASE 5 : PUSH VERS GITHUB

### 5.1 Push simple (CAS NORMAL)
```bash
# Push vers la branche actuelle
git push origin VOTRE_BRANCHE

# Par exemple :
# git push origin feature/react-router-implementation
# OU
# git push origin main
```

### 5.2 Push avec vérifications (PLUS SÛR)
```bash
# Vérifier le remote configuré
git remote -v

# Push avec tracking de la branche
git push -u origin VOTRE_BRANCHE

# Vérifier que le push a fonctionné
git status
```

---

## 📋 PHASE 6 : VÉRIFICATION FINALE

### 6.1 Confirmer que tout est synchronisé
```bash
# Vérifier l'état final
git status

# Voir les derniers commits
git log --oneline -3

# Vérifier la synchronisation avec le remote
git remote show origin
```

---

## 🆘 COMMANDES DE RÉCUPÉRATION D'ERREUR

### En cas de conflit de merge
```bash
# Annuler un merge en cours
git merge --abort

# Annuler un rebase en cours
git rebase --abort

# Revenir au dernier commit
git reset --hard HEAD
```

### En cas d'erreur de push
```bash
# Force push (ATTENTION : destructeur)
git push origin VOTRE_BRANCHE --force-with-lease

# Push avec upstream
git push -u origin VOTRE_BRANCHE
```

### Pour revenir en arrière
```bash
# Annuler le dernier commit (garde les changements)
git reset --soft HEAD~1

# Annuler le dernier commit (supprime les changements)
git reset --hard HEAD~1
```

---

## 🎯 SÉQUENCE COMPLÈTE RÉSUMÉE (AVEC VÉRIFICATION BRANCHE)

```bash
# 0. DIAGNOSTIC OBLIGATOIRE
git branch
# Si pas sur main : git checkout main

# 1. Navigation et état
cd "VOTRE_REPERTOIRE_PROJET"
git status

# 2. Synchronisation
git fetch origin
git pull origin main

# 3. Ajout des fichiers
git add FICHIERS_SPECIFIQUES
git status

# 4. Commit
git commit -m "type: Description claire"

# 5. Push
git push origin main

# 6. Vérification
git status
```

---

## ✅ CHECKLIST AVANT CHAQUE COMMIT

- [ ] **CRITIQUE** : Je suis dans le bon répertoire
- [ ] **CRITIQUE** : `git branch` montre `* main` (pas feature!)
- [ ] J'ai fait `git fetch origin`
- [ ] J'ai vérifié `git status`
- [ ] J'ai ajouté uniquement les fichiers nécessaires
- [ ] Mon message de commit est clair et descriptif
- [ ] J'ai vérifié le push avec `git status`

**🚨 Si `git branch` ne montre pas `* main`, faire `git checkout main` !**

---

## 🚨 RÈGLES D'OR

1. **TOUJOURS** faire `git status` avant et après chaque action
2. **TOUJOURS** faire `git fetch origin` avant de commencer
3. **JAMAIS** utiliser `git add .` sans vérifier avec `git status` d'abord
4. **TOUJOURS** utiliser des messages de commit descriptifs
5. **TOUJOURS** vérifier que le push a fonctionné

---

*Ce guide vous évitera 99,9% des problèmes Git ! 🎉*