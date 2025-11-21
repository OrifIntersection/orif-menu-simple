# Comment obtenir le rôle Admin

## 🚨 Problème
Quand vous vous connectez avec le magic link, vous restez en **invité** au lieu d'être **admin**. Cela arrive parce que votre compte n'a pas encore le rôle admin dans la base de données.

## ✅ Solution en 4 étapes

### **Étape 1 : Installer le trigger automatique**

Dans votre **Supabase Dashboard** > **SQL Editor**, exécutez le fichier :
```
database/auto_create_profile_trigger.sql
```

Ce trigger créera automatiquement un profil pour chaque nouvel utilisateur.

---

### **Étape 2 : Se connecter une première fois**

1. Allez sur votre application
2. Cliquez sur "Menus" → "Login"
3. Entrez votre email et recevez le magic link
4. Cliquez sur le lien dans l'email

Votre profil est maintenant créé avec le rôle **viewer** (invité).

---

### **Étape 3 : Trouver votre UUID**

Dans **Supabase Dashboard** > **SQL Editor**, exécutez :

```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'VOTRE-EMAIL@example.com';
```

Remplacez `VOTRE-EMAIL@example.com` par votre vraie adresse email.

Vous obtiendrez quelque chose comme :
```
id: 8a3f2c1d-9876-5432-1abc-def012345678
email: vous@exemple.com
created_at: 2025-11-21 10:30:00
```

**Copiez cet UUID** (le `id`).

---

### **Étape 4 : Vous attribuer le rôle admin**

Toujours dans **SQL Editor**, exécutez :

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = '8a3f2c1d-9876-5432-1abc-def012345678';
```

Remplacez l'UUID par celui que vous avez copié à l'étape 3.

---

### **Étape 5 : Vérifier que ça marche**

1. Retournez sur votre application
2. Déconnectez-vous si vous êtes connecté
3. Reconnectez-vous avec le magic link
4. Vous devriez maintenant voir **"Admin"** au lieu de **"Invité"**

---

## 📝 Notes importantes

- Le trigger crée automatiquement les profils avec le rôle **viewer** (par sécurité)
- Seul un admin peut modifier les rôles
- Pour ajouter d'autres admins, répétez les étapes 3 et 4 avec leur UUID

---

## 🔧 Alternative : Whitelist admin automatique (optionnel)

Si vous voulez que certains emails deviennent admin **automatiquement**, créez une table whitelist :

```sql
-- Table whitelist admin
CREATE TABLE public.admin_whitelist (
  email text PRIMARY KEY,
  added_at timestamptz DEFAULT now()
);

-- Ajouter vos emails admin
INSERT INTO public.admin_whitelist (email) VALUES
  ('admin@orif.ch'),
  ('votreadresse@exemple.com');

-- Modifier le trigger pour vérifier la whitelist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text := 'viewer';
BEGIN
  -- Vérifier si l'email est dans la whitelist admin
  IF EXISTS (SELECT 1 FROM public.admin_whitelist WHERE email = NEW.email) THEN
    user_role := 'admin';
  END IF;

  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_role
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;
```

Avec cette méthode, tout email dans la `admin_whitelist` devient admin automatiquement à la première connexion ! 🎉
