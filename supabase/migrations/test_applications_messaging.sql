-- Test script pour valider la migration applications/messagerie
-- À exécuter dans Supabase SQL Editor après la migration

-- Test 1: Vérifier que toutes les tables ont été créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('applications', 'message_threads', 'thread_participants', 'messages', 'notifications')
ORDER BY table_name;

-- Test 2: Vérifier que les fonctions ont été créées
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('create_application', 'mark_notifications_read', 'get_thread_messages');

-- Test 3: Vérifier que les politiques RLS sont activées
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('applications', 'message_threads', 'thread_participants', 'messages', 'notifications');

-- Test 4: Vérifier les politiques RLS créées
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('applications', 'message_threads', 'thread_participants', 'messages', 'notifications')
ORDER BY tablename, policyname;

-- Test 5: Vérifier les index créés
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('applications', 'message_threads', 'thread_participants', 'messages', 'notifications')
ORDER BY tablename, indexname;

-- Test 6: Test de la fonction create_application (remplacer les UUIDs par des vrais)
-- ATTENTION: Remplacer les UUIDs par des vraies valeurs de votre base !
/*
SELECT create_application(
  'uuid-property-id',   -- ID d'une vraie propriété
  'uuid-tenant-id',     -- ID d'un vrai utilisateur
  'uuid-dossier-id',    -- ID d'un vrai dossier (optionnel)
  'Message de test pour la candidature'
);
*/

-- Test 7: Vérifier les contraintes d'unicité
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
  AND tc.table_name IN ('applications', 'thread_participants')
ORDER BY tc.table_name, tc.constraint_name;