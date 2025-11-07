-- Script de sécurisation avec Row Level Security et Magic Link Auth
-- À exécuter dans Supabase SQL Editor après avoir configuré l'auth

-- 1) ACTIVER RLS sur toutes les tables exposées au front
ALTER TABLE public.menus           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_days       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_types      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;

-- 2) FONCTION UTILITAIRE pour tester le rôle admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  );
$$;

-- 3) POLICIES DE LECTURE PUBLIQUE (tout le monde peut voir le menu)
CREATE POLICY "public read menus"       ON public.menus      FOR SELECT USING (true);
CREATE POLICY "public read menu_days"   ON public.menu_days  FOR SELECT USING (true);
CREATE POLICY "public read meal_types"  ON public.meal_types FOR SELECT USING (true);
CREATE POLICY "public read categories"  ON public.categories FOR SELECT USING (true);
CREATE POLICY "public read dishes"      ON public.dishes     FOR SELECT USING (true);
CREATE POLICY "public read meal_items"  ON public.meal_items FOR SELECT USING (true);

-- 4) POLICIES D'ÉCRITURE ADMIN SEULEMENT
-- Menus
CREATE POLICY "admin write menus"    ON public.menus    FOR INSERT WITH CHECK ( (SELECT is_admin()) );
CREATE POLICY "admin update menus"   ON public.menus    FOR UPDATE USING      ( (SELECT is_admin()) );
CREATE POLICY "admin delete menus"   ON public.menus    FOR DELETE USING      ( (SELECT is_admin()) );

-- Menu Days
CREATE POLICY "admin write menu_days"  ON public.menu_days  FOR INSERT WITH CHECK ( (SELECT is_admin()) );
CREATE POLICY "admin update menu_days" ON public.menu_days  FOR UPDATE USING      ( (SELECT is_admin()) );
CREATE POLICY "admin delete menu_days" ON public.menu_days  FOR DELETE USING      ( (SELECT is_admin()) );

-- Meal Items (assignation des plats)
CREATE POLICY "admin write meal_items"  ON public.meal_items  FOR INSERT WITH CHECK ( (SELECT is_admin()) );
CREATE POLICY "admin update meal_items" ON public.meal_items  FOR UPDATE USING      ( (SELECT is_admin()) );
CREATE POLICY "admin delete meal_items" ON public.meal_items  FOR DELETE USING      ( (SELECT is_admin()) );

-- Dishes
CREATE POLICY "admin write dishes"    ON public.dishes    FOR INSERT WITH CHECK ( (SELECT is_admin()) );
CREATE POLICY "admin update dishes"   ON public.dishes    FOR UPDATE USING      ( (SELECT is_admin()) );
CREATE POLICY "admin delete dishes"   ON public.dishes    FOR DELETE USING      ( (SELECT is_admin()) );

-- Categories
CREATE POLICY "admin write categories"  ON public.categories  FOR INSERT WITH CHECK ( (SELECT is_admin()) );
CREATE POLICY "admin update categories" ON public.categories  FOR UPDATE USING      ( (SELECT is_admin()) );
CREATE POLICY "admin delete categories" ON public.categories  FOR DELETE USING      ( (SELECT is_admin()) );

-- Meal Types
CREATE POLICY "admin write meal_types"  ON public.meal_types  FOR INSERT WITH CHECK ( (SELECT is_admin()) );
CREATE POLICY "admin update meal_types" ON public.meal_types  FOR UPDATE USING      ( (SELECT is_admin()) );
CREATE POLICY "admin delete meal_types" ON public.meal_types  FOR DELETE USING      ( (SELECT is_admin()) );

-- 5) GESTION DES PROFILS
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- Seuls les admins peuvent modifier les rôles
CREATE POLICY "admin can manage profiles" ON public.profiles FOR ALL USING ( (SELECT is_admin()) );

-- 6) TRIGGER pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'viewer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Associer le trigger à auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7) FONCTION pour promouvoir un utilisateur en admin (à utiliser côté serveur uniquement)
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Trouver l'utilisateur par email
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;
  
  -- Promouvoir en admin
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE user_id = user_id;
  
  RAISE NOTICE 'Utilisateur % promu en admin', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemple d'utilisation (remplacer par votre email admin) :
-- SELECT public.promote_to_admin('admin@orif.ch');