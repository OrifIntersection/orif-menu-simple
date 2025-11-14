# 📥 Guide d'import de menus Excel

## Vue d'ensemble

Cette fonctionnalité permet d'importer une semaine complète de menus depuis un fichier Excel ou CSV, avec détection automatique des catégories de plats.

## 🚀 Accès à la fonctionnalité

1. Connectez-vous à l'interface d'administration : `/admin`
2. Cliquez sur le bouton **📥 Importer un fichier Excel**
3. Vous serez redirigé vers `/admin/import`

## 📋 Format de fichier attendu

### Structure CSV/Excel

Le fichier doit contenir 4 colonnes :

| Semaine | Jour     | Moment | Plat                              |
|---------|----------|--------|-----------------------------------|
| 2025-48 | Lundi    | Midi   | Émincé de poulet aux champignons  |
| 2025-48 | Lundi    | Midi   | Tagliatelles                      |
| 2025-48 | Lundi    | Midi   | Petit pois                        |
| 2025-48 | Lundi    | Midi   | Tartelette citron meringuée       |
| 2025-48 | Lundi    | Soir   | Pizzas diverses                   |

### Règles importantes

- **En-tête obligatoire** : La première ligne doit contenir `Semaine`, `Jour`, `Moment`, `Plat`
- **Jours valides** : Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche
- **Moments valides** : Midi, Soir
- **Format semaine** : `YYYY-WW` (ex: 2025-48)

## 🎯 Processus d'import

### Étape 1 : Sélection du fichier

1. Entrez le **numéro de semaine** (ex: `2025-48`)
2. Cliquez sur **Choisir un fichier**
3. Sélectionnez votre fichier `.xlsx`, `.xls` ou `.csv`

### Étape 2 : Analyse et prévisualisation

Le système va automatiquement :
- ✅ Lire le fichier
- 🔍 Détecter les catégories de chaque plat
- 📊 Afficher un résumé statistique
- 👁️ Montrer un aperçu organisé par jour/moment

### Catégories détectées automatiquement

| Catégorie | Exemples de mots-clés détectés |
|-----------|--------------------------------|
| 🥗 **Salade** | salade, carottes râpées, betteraves, taboulé, vinaigrette |
| 🍖 **Viande/Poisson** | poulet, boeuf, porc, saumon, poisson, escalope, émincé, saucisse |
| 🍚 **Féculent** | pâtes, riz, pommes de terre, frites, purée, spaghetti, tagliatelles |
| 🥦 **Légumes** | légumes, haricots, petits pois, brocoli, carottes, courgettes |
| 🍰 **Dessert** | tarte, mousse, yaourt, fruit, entremet, chocolat, meringue |

### Étape 3 : Validation

Le système vous affiche :
- ✅ Nombre de plats détectés avec catégorie
- ⚠️ Nombre de plats non catégorisés (qui ne seront pas importés)
- 📊 Répartition par catégorie
- 👁️ Aperçu complet du menu

### Étape 4 : Confirmation

1. Vérifiez l'aperçu
2. Cliquez sur **✅ Confirmer l'import**
3. Le système va :
   - Créer les plats manquants dans la base de données
   - Assigner chaque plat à la bonne date/moment/catégorie
   - Vous rediriger vers l'éditeur de semaine

## ⚠️ Gestion des erreurs

### Plats non catégorisés

Si certains plats ne sont pas détectés automatiquement (marqués en rouge avec ⚠️) :
- **Option 1** : Modifier le nom du plat dans l'Excel pour inclure un mot-clé reconnu
- **Option 2** : Les ajouter manuellement après l'import dans l'éditeur de semaine
- **Option 3** : Demander l'ajout du mot-clé dans le système de détection

### Exemple de correction

❌ Mauvais : "Plat du jour"  
✅ Bon : "Émincé de poulet du jour"

❌ Mauvais : "Accompagnement"  
✅ Bon : "Légumes de saison"

## 💡 Conseils d'utilisation

### Pour un import réussi

1. **Utilisez des noms descriptifs** : "Poulet rôti" plutôt que "Viande"
2. **Vérifiez l'orthographe** : Les accents sont gérés mais l'orthographe doit être correcte
3. **Soyez cohérent** : Utilisez toujours "Midi" et non "midi" ou "MIDI"
4. **Testez avec un petit fichier** : Commencez avec une semaine complète pour valider

### Workflow recommandé

```
1. Préparer Excel → 2. Importer → 3. Vérifier aperçu → 4. Confirmer → 5. Ajuster si nécessaire
```

## 📝 Modèle Excel

Vous pouvez créer votre propre fichier Excel avec cette structure :

```excel
Semaine     Jour        Moment      Plat
2025-48     Lundi       Midi        Salade verte
2025-48     Lundi       Midi        Poulet rôti
2025-48     Lundi       Midi        Riz
2025-48     Lundi       Midi        Haricots verts
2025-48     Lundi       Midi        Yaourt
2025-48     Lundi       Soir        Soupe
2025-48     Lundi       Soir        Pizza
...
```

## 🔄 Après l'import

Après un import réussi, vous êtes automatiquement redirigé vers l'éditeur de semaine où vous pouvez :
- Vérifier les menus importés
- Ajouter les plats manquants (non catégorisés)
- Modifier ou supprimer des entrées
- Publier le menu final

## 🆘 Support

En cas de problème :
1. Vérifiez le format de votre fichier (en-têtes, colonnes)
2. Consultez les messages d'erreur affichés
3. Essayez avec un fichier plus simple pour identifier le problème
4. Contactez l'administrateur système si le problème persiste

## 📊 Exemple complet

Voir le fichier exemple : `csv_excel_menus/2025-48_24-28-novembre-2025.csv`

Ce fichier contient un menu complet d'une semaine et peut servir de modèle pour vos propres imports.
