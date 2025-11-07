-- Script de diagnostic pour vérifier la configuration Supabase
-- À exécuter dans Supabase SQL Editor

-- 1) Vérifier si la table profiles existe
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2) Vérifier si le trigger handle_new_user existe
SELECT trigger_name, trigger_schema, trigger_table, action_timing, event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3) Vérifier si la fonction handle_new_user existe
SELECT routine_name, routine_type, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 4) Lister tous les profils existants
SELECT user_id, full_name, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- 5) Vérifier les RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6) Vérifier l'état RLS de la table
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';