-- =========================================
-- TRIGGER : CRÉATION AUTOMATIQUE DES PROFILS
-- =========================================
-- Ce trigger crée automatiquement un profil "viewer" 
-- pour chaque nouvel utilisateur qui se connecte

-- Fonction trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- COMMENT DEVENIR ADMIN
-- =========================================
-- 1. Connectez-vous avec votre email pour créer votre compte
-- 2. Récupérez votre UUID avec cette requête :
--
--    SELECT id, email FROM auth.users WHERE email = 'votre-email@example.com';
--
-- 3. Attribuez-vous le rôle admin :
--
--    UPDATE public.profiles 
--    SET role = 'admin' 
--    WHERE user_id = 'VOTRE-UUID-ICI';
--
-- =========================================
