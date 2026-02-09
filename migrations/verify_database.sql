-- Script de vérification de la base de données
-- Pour vérifier que tout est en ordre après les migrations

-- 1. Vérifier les rôles actuellement utilisés
SELECT 'Roles in use:' as check_name;
SELECT role, COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY count DESC;

-- 2. Vérifier la contrainte CHECK
SELECT 'Check constraint:' as check_name;
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
AND conname LIKE '%role%';

-- 3. Vérifier les valeurs enum disponibles
SELECT 'Enum values:' as check_name;
SELECT enumlabel as role_value
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'user_role'
ORDER BY enumsortorder;

-- 4. Vérifier qu'il n'y a plus d'admin/moderator
SELECT 'Admin/Moderator count (should be 0):' as check_name;
SELECT COUNT(*) as admin_moderator_count
FROM public.profiles
WHERE role IN ('admin', 'moderator');

-- 5. Vérifier les colonnes copil
SELECT 'Copil columns check:' as check_name;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name IN ('copil_role', 'copil_start_year', 'is_referent')
ORDER BY column_name;

-- 6. Sample de profils Copil pour vérifier les données
SELECT 'Sample Copil profiles:' as check_name;
SELECT 
    first_name,
    last_name,
    role,
    copil_role,
    copil_start_year,
    is_referent
FROM public.profiles
WHERE role IN ('copil', 'copil_plus')
LIMIT 5;

-- 7. Vérifier les index de performance
SELECT 'Performance indexes:' as check_name;
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('profiles', 'events')
AND schemaname = 'public'
ORDER BY tablename, indexname;
