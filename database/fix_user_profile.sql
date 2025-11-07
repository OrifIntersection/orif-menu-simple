-- Script de correction pour créer manuellement le profil de l'utilisateur connecté
-- À exécuter dans Supabase SQL Editor

-- 1) Créer le profil pour l'utilisateur qui s'est connecté
INSERT INTO public.profiles (user_id, full_name, role)
VALUES ('1ebb59cc-e034-4f09-b8a5-68e07015d11d', 'Utilisateur ORIF', 'viewer')
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 2) Le promouvoir en admin (puisque c'est un email autorisé)
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = '1ebb59cc-e034-4f09-b8a5-68e07015d11d';

-- 3) Vérifier que le profil existe
SELECT user_id, full_name, role, created_at 
FROM public.profiles 
WHERE user_id = '1ebb59cc-e034-4f09-b8a5-68e07015d11d';