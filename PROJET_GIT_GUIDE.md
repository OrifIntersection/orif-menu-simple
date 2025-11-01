# 🎯 Commandes Git EXACTES pour le projet orif-menu

## 📂 VOTRE PROJET : orif-menu-simple
**Répertoire** : `c:\Users\ayesh\Desktop\projets_Orif\menu_cafet31-10\orif-menu`

---

## 🚀 SÉQUENCE COMPLÈTE AVEC RÉPONSES ATTENDUES

### 1️⃣ NAVIGATION ET VÉRIFICATION INITIALE

```bash
cd "c:\Users\ayesh\Desktop\projets_Orif\menu_cafet31-10\orif-menu"
```
**Réponse attendue :**
```
PS C:\Users\ayesh\Desktop\projets_Orif\menu_cafet31-10\orif-menu>
```

```bash
git status
```
**Réponse attendue (si tout est à jour) :**
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

**Réponse attendue (avec nouveaux fichiers) :**
```
On branch main
Your branch is up to date with 'origin/main'.

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        NOUVEAU_FICHIER.md

nothing added to commit but untracked files present (use "git add" to track)
```

### 2️⃣ VÉRIFICATION DES BRANCHES

```bash
git branch
```
**Réponse attendue :**
```
  feature/react-router-implementation
* main
```

### 3️⃣ SYNCHRONISATION AVEC GITHUB

```bash
git fetch origin
```
**Réponse attendue (si tout à jour) :**
```
PS C:\Users\ayesh\Desktop\projets_Orif\menu_cafet31-10\orif-menu>
```

```bash
git pull origin main
```
**Réponse attendue (si à jour) :**
```
Already up to date.
```

### 4️⃣ VOIR L'HISTORIQUE ACTUEL

```bash
git log --oneline -5
```
**Réponse attendue :**
```
ce45de1 (HEAD -> main, origin/main, origin/feature/react-router-implementation, origin/HEAD, feature/react-router-implementation) fix: Ajouter react-router-dom aux dépendances pour le déploiement Vercel
dbc5010 docs: Ajout documentation de l'implémentation
1e4b019 feat: Implémentation COMPLÈTE de React Router avec toutes les fonctionnalités
38ea122 feat: Implémentation basique de React Router
f0813a1 Import du projet React (Vite) - Menu cafétéria ORIF
```

---

## 📝 AJOUTER ET COMMITTER DES CHANGEMENTS

### 5️⃣ AJOUTER UN FICHIER SPÉCIFIQUE

```bash
git add GIT_COMMANDS_GUIDE.md
```
**Réponse attendue :**
```
PS C:\Users\ayesh\Desktop\projets_Orif\menu_cafet31-10\orif-menu>
```

### 6️⃣ VÉRIFIER CE QUI SERA COMMITTÉ

```bash
git status
```
**Réponse attendue :**
```
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   GIT_COMMANDS_GUIDE.md
```

### 7️⃣ FAIRE LE COMMIT

```bash
git commit -m "docs: Ajout du guide complet des commandes Git"
```
**Réponse attendue :**
```
[main a1b2c3d] docs: Ajout du guide complet des commandes Git
 1 file changed, 150 insertions(+)
 create mode 100644 GIT_COMMANDS_GUIDE.md
```

### 8️⃣ PUSHER VERS GITHUB

```bash
git push origin main
```
**Réponse attendue :**
```
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 24 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 2.15 KiB | 2.15 MiB/s, done.
Total 3 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (1/1), completed with 1 local object.
To https://github.com/OrifIntersection/orif-menu-simple.git
   ce45de1..a1b2c3d  main -> main
```

### 9️⃣ VÉRIFICATION FINALE

```bash
git status
```
**Réponse attendue :**
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

```bash
git log --oneline -3
```
**Réponse attendue :**
```
a1b2c3d (HEAD -> main, origin/main) docs: Ajout du guide complet des commandes Git
ce45de1 (origin/feature/react-router-implementation, feature/react-router-implementation) fix: Ajouter react-router-dom aux dépendances pour le déploiement Vercel
dbc5010 docs: Ajout documentation de l'implémentation
```

---

## 🔄 TRAVAILLER SUR LA BRANCHE FEATURE

### Switcher vers la branche feature
```bash
git checkout feature/react-router-implementation
```
**Réponse attendue :**
```
Switched to branch 'feature/react-router-implementation'
Your branch is up to date with 'origin/feature/react-router-implementation'.
```

### Pusher vers la branche feature
```bash
git push origin feature/react-router-implementation
```
**Réponse attendue :**
```
Everything up-to-date
```

---

## 🆘 MESSAGES D'ERREUR COURANTS ET SOLUTIONS

### ❌ Erreur : "Your branch and 'origin/main' have diverged"
**Solution :**
```bash
git fetch origin
git pull origin main
```

### ❌ Erreur : "fatal: refusing to merge unrelated histories"
**Solution :**
```bash
git pull origin main --allow-unrelated-histories
```

### ❌ Erreur : "Updates were rejected because the remote contains work"
**Solution :**
```bash
git fetch origin
git pull origin main
# Puis refaire le push
git push origin main
```

---

## 📋 EXEMPLE COMPLET POUR AJOUTER UN NOUVEAU FICHIER

```bash
# 1. Navigation
cd "c:\Users\ayesh\Desktop\projets_Orif\menu_cafet31-10\orif-menu"

# 2. Vérification
git status
git fetch origin

# 3. Ajout du fichier
git add NOUVEAU_FICHIER.md

# 4. Vérification avant commit
git status

# 5. Commit
git commit -m "docs: Ajout de NOUVEAU_FICHIER"

# 6. Push
git push origin main

# 7. Vérification finale
git status
```

---

## ✅ CHECKLIST AVEC RÉPONSES ATTENDUES

- [ ] `cd` → Prompt change vers le bon répertoire
- [ ] `git status` → "working tree clean" ou liste des fichiers modifiés
- [ ] `git fetch` → Pas de message ou infos de récupération
- [ ] `git add` → Pas de message (succès silencieux)
- [ ] `git status` → "Changes to be committed" avec vos fichiers
- [ ] `git commit` → Message avec hash et détails du commit
- [ ] `git push` → Messages "Enumerating objects" et "Writing objects"
- [ ] `git status` → "working tree clean"

---

*🎯 Ce guide contient les VRAIES réponses de VOTRE projet spécifique !*