# Locations de confiance – Base propre (Next.js App Router + Tailwind + Supabase)

Aucune dépendance Radix/shadcn. Images locales. Auth & annonces en client-side pour simplicité.

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

## À venir
- Paiement Stripe (2% commission) via `/api/checkout` + Connect
- Favoris & édition (peuvent être ajoutés ensuite)
