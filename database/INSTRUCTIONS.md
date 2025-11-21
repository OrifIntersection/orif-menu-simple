# 🚀 Installation de la Base de Données - Guide Simple

## ✅ Un seul script fait TOUT

Le fichier `SETUP_COMPLET.sql` configure toute votre base de données en une seule fois :

- ✅ Supprime les anciennes tables
- ✅ Crée les ENUM (meal_type, dish_type)
- ✅ Crée toutes les tables (profiles, dishes, meals, meals_dishes)
- ✅ Configure la sécurité (Row Level Security)
- ✅ Crée le trigger automatique pour les profils
- ✅ Configure la whitelist admin automatique
- ✅ Ajoute des plats d'exemple

---

## 📝 Avant d'exécuter le script

### **Étape 1 : Modifier la whitelist admin**

Ouvrez le fichier `SETUP_COMPLET.sql` et allez à la **ligne 306** :

```sql
INSERT INTO public.admin_whitelist (email) VALUES
  ('admin@orif.ch'),                    -- ⬅️ Remplacez par votre email
  ('votre-email@exemple.com')           -- ⬅️ Remplacez par votre email
ON CONFLICT (email) DO NOTHING;
```

**Remplacez ces emails** par vos vraies adresses email que vous utiliserez pour vous connecter.

---

## 🎯 Exécution du script

### **1. Ouvrez Supabase Dashboard**
- Allez sur [supabase.com](https://supabase.com)
- Ouvrez votre projet Menu Cafétéria

### **2. Ouvrez SQL Editor**
- Dans le menu de gauche, cliquez sur **SQL Editor**
- Cliquez sur **New Query** (nouvelle requête)

### **3. Copiez-collez le script**
- Ouvrez le fichier `SETUP_COMPLET.sql`
- **Copiez tout le contenu** (Ctrl+A puis Ctrl+C)
- **Collez** dans l'éditeur SQL de Supabase (Ctrl+V)

### **4. Exécutez le script**
- Cliquez sur le bouton **Run** (ou appuyez sur Ctrl+Entrée)
- Attendez quelques secondes

### **5. Vérifiez que ça marche**

Vous devriez voir un message comme :

```
✅ Base de données configurée avec succès !

📋 Prochaines étapes :
1. Modifiez la whitelist admin (ligne 306) avec vos vrais emails
2. Connectez-vous à l'application avec votre email
3. Vous serez automatiquement admin grâce à la whitelist
```

---

## 🎉 C'est terminé !

Votre base de données est **100% prête** ! Maintenant :

### **1. Connectez-vous à l'application**
- Allez sur votre application Replit
- Cliquez sur "Menus" → "Login"
- Entrez l'email que vous avez ajouté dans la whitelist
- Recevez le magic link par email
- Cliquez sur le lien

### **2. Vous êtes automatiquement admin ! 🎊**

Grâce au **trigger automatique** et à la **whitelist**, vous serez admin dès votre première connexion. Plus besoin de faire des UPDATE manuels !

### **3. Créez vos menus**
- Cliquez sur "Éditer par semaine" ou "Éditer par jour"
- Ajoutez vos plats
- Sauvegardez

---

## 🔧 Commandes utiles (optionnel)

### Vérifier la whitelist admin :
```sql
SELECT * FROM public.admin_whitelist;
```

### Voir vos profils utilisateurs :
```sql
SELECT p.*, u.email 
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id;
```

### Voir tous les plats :
```sql
SELECT * FROM public.dishes ORDER BY dish_type, name;
```

### Ajouter un autre admin plus tard :
```sql
INSERT INTO public.admin_whitelist (email) 
VALUES ('nouvel-admin@exemple.com');
```

---

## ❓ Besoin d'aide ?

Si vous avez un problème :

1. **Vérifiez que vous avez bien modifié la whitelist** (ligne 306)
2. **Vérifiez qu'il n'y a pas d'erreur** dans l'éditeur SQL
3. **Relancez le script** - il est conçu pour être exécuté plusieurs fois sans problème (DROP IF EXISTS)

Le script fait **tout automatiquement** ! 🚀
