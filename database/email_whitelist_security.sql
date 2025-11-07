-- Extension du script de sécurité pour valider les emails autorisés
-- À ajouter après auth_rls_setup.sql

-- 1) Table des emails autorisés (gérée uniquement par les super-admins)
CREATE TABLE IF NOT EXISTS public.allowed_emails (
  email TEXT PRIMARY KEY,
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Activer RLS sur cette table critique
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Seuls les super-admins peuvent gérer cette table
CREATE POLICY "super_admin_only_allowed_emails" ON public.allowed_emails 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- 2) Fonction pour vérifier si un email est autorisé
CREATE OR REPLACE FUNCTION public.is_email_allowed(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.allowed_emails 
    WHERE email = email_to_check AND is_active = TRUE
  );
$$;

-- 3) Trigger pour bloquer l'inscription d'emails non autorisés
CREATE OR REPLACE FUNCTION public.validate_signup_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si l'email est dans la liste autorisée
  IF NOT public.is_email_allowed(NEW.email) THEN
    RAISE EXCEPTION 'Email % non autorisé pour l''inscription', NEW.email
    USING HINT = 'Contactez l''administrateur système';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger avant l'insertion d'un nouvel utilisateur
DROP TRIGGER IF EXISTS validate_email_on_signup ON auth.users;
CREATE TRIGGER validate_email_on_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_signup_email();

-- 4) Insérer les emails autorisés par défaut
INSERT INTO public.allowed_emails (email, added_by) VALUES 
  ('aayyyeesh@gmail.com', NULL),
  ('ayesh.alotaibi@formation.orif.ch', NULL),
  ('raphael.schmutz@orif.ch', NULL),
  ('raphael.schmutz@sectioninformatique.ch', NULL),
  ('admin@orif.ch', NULL)
ON CONFLICT (email) DO NOTHING;

-- 5) Fonction pour ajouter un nouvel email autorisé (super-admin seulement)
CREATE OR REPLACE FUNCTION public.add_allowed_email(new_email TEXT)
RETURNS VOID AS $$
BEGIN
  -- Vérifier que l'utilisateur actuel est super-admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Seuls les super-admins peuvent ajouter des emails autorisés';
  END IF;
  
  INSERT INTO public.allowed_emails (email, added_by)
  VALUES (new_email, auth.uid())
  ON CONFLICT (email) DO UPDATE SET 
    is_active = TRUE,
    added_by = auth.uid(),
    added_at = NOW();
    
  RAISE NOTICE 'Email % ajouté à la liste autorisée', new_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemple d'utilisation :
-- SELECT public.add_allowed_email('nouveau.admin@orif.ch');