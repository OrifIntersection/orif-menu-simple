# Guide de Sécurité Renforcée - Liste Blanche d'Emails

## 🛡️ Vue d'ensemble

Ce système implémente une sécurité à 3 niveaux pour contrôler l'accès à l'administration :

1. **Validation côté client** - Emails obfusqués dans le code
2. **Validation côté serveur** - Base de données Supabase
3. **Row Level Security** - Policies de base de données

## 🔐 Niveaux de sécurité

### Niveau 1 : Validation Client (Obfuscation)

**Fichier :** `src/utils/emailValidation.js`

- **Emails autorisés :** Encodés en hashes pour masquer les vrais emails
- **Avantage :** Feedback immédiat, pas d'appel serveur inutile
- **Limite :** Peut être contourné côté client (d'où le niveau 2)

**Emails actuellement autorisés :**
- aayyyeesh@gmail.com
- ayesh.alotaibi@formation.orif.ch
- raphael.schmutz@orif.ch
- raphael.schmutz@sectioninformatique.ch
- admin@orif.ch

### Niveau 2 : Validation Serveur (Base de données)

**Fichier :** `database/email_whitelist_security.sql`

- **Table :** `allowed_emails` avec RLS activé
- **Trigger :** Bloque l'inscription des emails non autorisés
- **Fonction :** `is_email_allowed()` vérifie en temps réel

**Configuration requise :**
```sql
-- Exécuter après auth_rls_setup.sql
\i database/email_whitelist_security.sql
```

### Niveau 3 : Row Level Security

**Fichier :** `database/auth_rls_setup.sql`

- **Rôles :** viewer (défaut) → admin (promotion manuelle)
- **Policies :** Lecture publique, écriture admin uniquement
- **Fonction :** `is_admin()` vérifie les permissions

## 🔧 Configuration et Utilisation

### Ajouter un nouvel email autorisé

**Option A : Via SQL (Recommandée)**
```sql
-- En tant que super-admin
SELECT public.add_allowed_email('nouvel.admin@orif.ch');
```

**Option B : Via code (Développement)**
```javascript
// En mode développement uniquement
window.__generateEmailHash('nouvel.admin@orif.ch')
// Copier le hash généré dans emailValidation.js
```

### Promouvoir un utilisateur en admin

```sql
-- Une fois l'utilisateur connecté
SELECT public.promote_to_admin('admin@orif.ch');
```

### Variables d'environnement

```env
# .env.local (pour approche alternative)
VITE_ALLOWED_ADMIN_EMAILS=admin@orif.ch,directeur@orif.ch,rh@orif.ch
```

## 🛠️ Maintenance

### Désactiver un email temporairement

```sql
UPDATE public.allowed_emails 
SET is_active = FALSE 
WHERE email = 'ancien.admin@orif.ch';
```

### Audit des tentatives de connexion

```sql
-- Voir les emails autorisés actifs
SELECT email, added_at, added_by FROM public.allowed_emails 
WHERE is_active = TRUE;

-- Logs des connexions (côté Supabase)
-- Dashboard Supabase → Authentication → Logs
```

### Rotation de sécurité

1. **Trimestielle :** Révision de la liste des emails autorisés
2. **Annuelle :** Rotation des hashes côté client
3. **En cas de compromission :** Révoquer tous les tokens et refaire la liste

## 🚨 Procédures d'urgence

### En cas de compte compromis

```sql
-- 1. Désactiver l'email immédiatement
UPDATE public.allowed_emails 
SET is_active = FALSE 
WHERE email = 'compte.compromis@orif.ch';

-- 2. Révoquer le rôle admin
UPDATE public.profiles 
SET role = 'viewer' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'compte.compromis@orif.ch'
);

-- 3. Forcer la déconnexion (côté Supabase Dashboard)
```

### Verrouillage total temporaire

```sql
-- Désactiver tous les emails sauf super-admin
UPDATE public.allowed_emails 
SET is_active = FALSE 
WHERE email != 'super.admin@orif.ch';
```

## 📊 Monitoring

### Métriques à surveiller

- **Tentatives de connexion échouées** : Emails non autorisés
- **Connexions suspectes** : Horaires inhabituels
- **Modifications de données** : Actions d'administration

### Alertes recommandées

- Plus de 5 tentatives d'email non autorisé/heure
- Connexion admin en dehors des heures de bureau
- Modifications massives de menus

## 🔒 Bonnes pratiques

### Pour les administrateurs

1. **Emails professionnels uniquement** (@orif.ch)
2. **Mots de passe forts** sur les comptes emails
3. **2FA activée** sur les comptes emails ORIF
4. **Pas de partage** des liens Magic Link

### Pour les développeurs

1. **Ne jamais commiter** les vrais emails en clair
2. **Utiliser les hashes** pour obfusquer
3. **Tester la validation** avant déploiement
4. **Logs sécurisés** sans révéler les emails tentés

## 🎯 Avantages du système

- ✅ **Triple protection** : Client + Serveur + Base
- ✅ **Emails obfusqués** dans le code source
- ✅ **Gestion centralisée** via base de données
- ✅ **Audit trail** complet des accès
- ✅ **Révocation** immédiate possible
- ✅ **Scalable** pour ajouter/retirer des emails

Cette approche garantit qu'**uniquement les personnes autorisées** de l'ORIF peuvent accéder au système d'administration, même en cas de fuite du code source.