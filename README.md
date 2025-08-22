# Locations de confiance – Base propre (Next.js App Router + Tailwind + Supabase)

Plateforme de locations de confiance pour une gestion locative sécurisée. Aucune dépendance Radix/shadcn. Images locales. Auth & annonces en client-side pour simplicité.

## Démarrage
1) `npm install`
2) Copier `.env.example` → `.env.local` et remplir
3) Créer les tables dans Supabase (SQL ci-dessous)
4) `npm run dev` → http://localhost:3000

## .env
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Réinitialisation de mot de passe

Le système inclut un flux complet de réinitialisation de mot de passe :

1. **Page de connexion** (`/login`) : lien "Mot de passe oublié ?" vers `/forgot-password`
2. **Demande de réinitialisation** (`/forgot-password`) : formulaire de saisie d'email
3. **Nouveau mot de passe** (`/reset-password`) : formulaire de mise à jour du mot de passe après clic sur le lien reçu par email

### Post-réinitialisation

Après une réinitialisation réussie du mot de passe, l'utilisateur est redirigé vers la page de connexion avec une bannière de confirmation verte. Le système utilise un mécanisme de stockage local temporaire pour afficher cette confirmation de manière sécurisée, sans exposer d'informations sensibles dans l'URL.

### Configuration requise

Dans le dashboard Supabase, sous **Authentication > URL Configuration**, ajouter l'URL de redirection :
- **Site URL** : `VOTRE_DOMAINE/reset-password` (ex: `http://localhost:3000/reset-password`)
- **Redirect URLs** : même URL que Site URL

Le système utilise `NEXT_PUBLIC_SITE_URL` pour construire dynamiquement l'URL de redirection.

## SQL Supabase
```sql
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  title text not null,
  description text not null,
  price numeric not null,
  city text not null,
  photos text[] not null default '{}',
  created_at timestamp with time zone default now()
);

alter table properties enable row level security;
create policy "owners can manage their properties" on properties
  for all using (auth.uid() = owner_id);

create policy "anyone can read properties" on properties
  for select using (true);
```

## Storage
Créer un bucket `properties` (public). Les images uploadées obtiennent des URLs publiques.

## Supabase: politiques et migrations

### Bucket Storage
Créer un bucket public `properties` dans Supabase Storage.

### Politiques et contraintes complètes
```sql
-- Storage policies (lecture publique + RLS par préfixe {userId}/)
drop policy if exists "public read properties" on storage.objects;
drop policy if exists "authenticated upload properties" on storage.objects;
drop policy if exists "authenticated update properties" on storage.objects;
drop policy if exists "authenticated delete properties" on storage.objects;

create policy "public read properties"
on storage.objects for select using (bucket_id = 'properties');

create policy "authenticated upload properties"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'properties'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "authenticated update properties"
on storage.objects for update to authenticated
using (
  bucket_id = 'properties'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'properties'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "authenticated delete properties"
on storage.objects for delete to authenticated
using (
  bucket_id = 'properties'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- RLS properties + contraintes
alter table properties enable row level security;

drop policy if exists "owners can manage their properties" on properties;
drop policy if exists "anyone can read properties" on properties;
drop policy if exists "owner can insert own properties" on properties;
drop policy if exists "owner can update own properties" on properties;
drop policy if exists "owner can delete own properties" on properties;

create policy "anyone can read properties"
on properties for select using (true);

create policy "owner can insert own properties"
on properties for insert with check (auth.uid() = owner_id);

create policy "owner can update own properties"
on properties for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "owner can delete own properties"
on properties for delete using (auth.uid() = owner_id);

-- postal_code + contraintes photos
alter table properties add column if not exists postal_code text;
alter table properties drop constraint if exists properties_postal_code_check;
alter table properties add constraint properties_postal_code_check
  check (postal_code ~ '^[0-9]{5}$');

alter table properties drop constraint if exists properties_photos_max6;
alter table properties add constraint properties_photos_max6
  check (array_length(photos, 1) is null or array_length(photos, 1) <= 6);

-- Index recommandés
create index if not exists properties_owner_created_idx on properties (owner_id, created_at desc);
create index if not exists properties_created_idx on properties (created_at desc);

-- Espace locataire: tables et contraintes
create table if not exists tenant_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  identity_status text not null default 'unverified', -- unverified | pending_review | verified
  identity_document_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists rental_dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'incomplete', -- incomplete | submitted | auto_validated | rejected
  monthly_income numeric,
  employment_type text,
  employment_start date,
  dependents_count int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists rental_dossier_files (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references rental_dossiers(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,   -- payslip | contract | tax_notice | domicile | other
  file_url text not null,
  mime_type text,
  created_at timestamptz default now()
);

-- RLS pour les tables locataires
alter table tenant_profiles enable row level security;
alter table rental_dossiers enable row level security;
alter table rental_dossier_files enable row level security;

-- Policies RLS locataires
create policy "tenant self select profile" on tenant_profiles for select using (auth.uid() = user_id);
create policy "tenant upsert profile" on tenant_profiles for insert with check (auth.uid() = user_id);
create policy "tenant update profile" on tenant_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tenant self select dossier" on rental_dossiers for select using (auth.uid() = user_id);
create policy "tenant insert dossier" on rental_dossiers for insert with check (auth.uid() = user_id);
create policy "tenant update dossier" on rental_dossiers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tenant self select dossier files" on rental_dossier_files for select using (auth.uid() = user_id);
create policy "tenant insert dossier files" on rental_dossier_files for insert with check (auth.uid() = user_id);
create policy "tenant delete dossier files" on rental_dossier_files for delete using (auth.uid() = user_id);

-- Index utiles pour les locataires
create index if not exists rental_dossiers_user_created_idx on rental_dossiers (user_id, created_at desc);
```

## Buckets Storage pour l'espace locataire

Créer les buckets suivants dans Supabase Storage:

### 1. Bucket `avatars` (public)
```sql
-- Policies avatars (bucket public)
create policy "public read avatars" on storage.objects for select using (bucket_id='avatars');
create policy "tenant write own avatars" on storage.objects for insert to authenticated with check (bucket_id='avatars' and split_part(name,'/',1)=auth.uid()::text);
create policy "tenant update own avatars" on storage.objects for update to authenticated using (bucket_id='avatars' and split_part(name,'/',1)=auth.uid()::text) with check (bucket_id='avatars' and split_part(name,'/',1)=auth.uid()::text);
create policy "tenant delete own avatars" on storage.objects for delete to authenticated using (bucket_id='avatars' and split_part(name,'/',1)=auth.uid()::text);
```

### 2. Bucket `identity` (privé)
```sql
-- Policies identity (bucket privé)
create policy "tenant read own identity" on storage.objects for select to authenticated using (bucket_id='identity' and split_part(name,'/',1)=auth.uid()::text);
create policy "tenant upload own identity" on storage.objects for insert to authenticated with check (bucket_id='identity' and split_part(name,'/',1)=auth.uid()::text);
create policy "tenant update own identity" on storage.objects for update to authenticated using (bucket_id='identity' and split_part(name,'/',1)=auth.uid()::text) with check (bucket_id='identity' and split_part(name,'/',1)=auth.uid()::text);
create policy "tenant delete own identity" on storage.objects for delete to authenticated using (bucket_id='identity' and split_part(name,'/',1)=auth.uid()::text);
```

### 3. Bucket `dossiers` (privé)
```sql
-- Policies dossiers (bucket privé)
create policy "tenant read own dossiers" on storage.objects for select to authenticated using (bucket_id='dossiers' and split_part(name,'/',1)=auth.uid()::text);
create policy "tenant upload own dossiers" on storage.objects for insert to authenticated with check (bucket_id='dossiers' and split_part(name,'/',1)=auth.uid()::text);
create policy "tenant update own dossiers" on storage.objects for update to authenticated using (bucket_id='dossiers' and split_part(name,'/',1)=auth.uid()::text) with check (bucket_id='dossiers' and split_part(name,'/',1)=auth.uid()::text);
create policy "tenant delete own dossiers" on storage.objects for delete to authenticated using (bucket_id='dossiers' and split_part(name,'/',1)=auth.uid()::text);
```

## Espace locataire

L'espace locataire est accessible via `/tenant/profile` et `/tenant/dossier` pour les utilisateurs avec `role=tenant`.

### Fonctionnalités:
- **Profil**: Gestion nom, prénom, bio, avatar
- **Vérification d'identité**: Upload pièce d'identité avec validation automatique immédiate (MVP)
- **Dossier de location**: Informations personnelles + upload pièces justificatives
- **Auto-validation**: Règles simples (>= 1 fiche de paie OU avis d'imposition)

### Statuts:
- Identité: `unverified` | `pending_review` | `verified` 
- Dossier: `incomplete` | `submitted` | `auto_validated` | `rejected`

## À venir
- Paiement Stripe (2% commission) via `/api/checkout` + Connect
- Favoris & édition (peuvent être ajoutés ensuite)

## Phase Relation PR1: Candidatures et Messagerie

### Nouvelles fonctionnalités (Phase Relation)

Cette phase ajoute le système de candidatures et de messagerie entre locataires et propriétaires.

#### Tables ajoutées:

**1. `applications`** - Candidatures des locataires
- Liaison entre un locataire et une propriété
- Statuts: `pending` | `accepted` | `rejected` | `withdrawn`
- Message d'accompagnement optionnel
- Contrainte: une seule candidature par locataire/propriété

**2. `message_threads`** - Fils de discussion
- Créé automatiquement avec chaque candidature
- Contient les conversations entre locataire et propriétaire

**3. `thread_participants`** - Participants aux discussions
- Gère qui peut voir/participer à un thread
- Rôles: `owner` | `tenant` | `participant`

**4. `messages`** - Messages échangés
- Contenu des conversations
- Référence au thread et à l'expéditeur

**5. `notifications`** - Notifications utilisateur
- Alertes pour nouvelles candidatures, messages, etc.
- Types: `application_received` | `message_received` | `application_status_changed`

#### Fonction atomique `create_application`

La fonction SQL `create_application()` gère en une transaction:
1. Création de la candidature
2. Création du thread de discussion
3. Ajout des participants (propriétaire + locataire)
4. Message initial optionnel
5. Notification au propriétaire

#### Politiques RLS

Toutes les tables ont des politiques de sécurité au niveau ligne (RLS):
- Les locataires voient leurs propres candidatures
- Les propriétaires voient les candidatures pour leurs propriétés
- Seuls les participants peuvent voir les messages d'un thread
- Chaque utilisateur voit ses propres notifications

#### Utilisation

```typescript
import { createApplication } from '@/lib/applications';

// Créer une candidature
const result = await createApplication({
  property_id: 'uuid-property',
  tenant_id: 'uuid-tenant',
  dossier_id: 'uuid-dossier', // optionnel
  message: 'Bonjour, je suis intéressé...' // optionnel
});
```

#### Migration

Le fichier de migration se trouve dans `supabase/migrations/20241222_applications_messaging.sql` et contient:
- Création des 5 nouvelles tables
- Politiques RLS complètes
- Index pour les performances
- Fonctions utilitaires
- Contraintes d'intégrité
