# LokSecure – Base propre (Next.js App Router + Tailwind + Supabase)

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

## Mobile First Considerations

### Property Creation Wizard
- **Multi-step wizard**: Address → Details → Photos → Review
- **Mobile stepper**: Horizontal progress header on ≤768px viewports
- **Desktop stepper**: Sidebar navigation with step validation
- **Touch-friendly actions**: Sticky bottom action bar with 44px+ touch targets
- **iOS compatibility**: 16px font-size prevents zoom, safe area insets supported

### Address (BAN) Behavior
- **API Integration**: French national address API (api-adresse.data.gouv.fr)
- **Debouncing**: 250ms delay with request cancellation for performance
- **Validation**: Server-side BAN ID validation on form submission
- **Accessibility**: Full keyboard navigation (↑↓ + Enter), ARIA roles, screen reader support
- **Auto-selection**: Enter key selects first suggestion if none explicitly chosen

### Responsive Design
- **Viewport handling**: 100dvh with fallbacks for mobile browsers
- **Keyboard overlay**: Layout stability when virtual keyboard appears
- **Input optimization**: Prevents iOS zoom with 16px minimum font-size
- **Touch targets**: All interactive elements ≥44px for accessibility

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

-- Enhanced property fields for advanced features
alter table properties add column if not exists address_label text;
alter table properties add column if not exists charges numeric default 0;
alter table properties add column if not exists property_type text default 'appartement';
alter table properties add column if not exists dpe_rating text;
alter table properties add column if not exists lat numeric;
alter table properties add column if not exists lng numeric;

-- Index recommandés
create index if not exists properties_owner_created_idx on properties (owner_id, created_at desc);
create index if not exists properties_created_idx on properties (created_at desc);
create index if not exists properties_type_idx on properties (property_type);
create index if not exists properties_postal_idx on properties (postal_code);
create index if not exists properties_price_idx on properties (price);
```

## Test mobile sur réseau local

Pour tester sur un appareil mobile via LAN :

1. Démarrez le serveur : `npm run dev`
2. Trouvez l'IP locale : `ip addr show` (Linux) ou `ipconfig` (Windows)
3. Accédez depuis mobile : `http://[IP_LOCALE]:3000`
4. Testez les fonctionnalités tactiles, le zoom iOS, et la saisie d'adresse

### Vérification des fonctionnalités clés
- [ ] Assistant de création d'annonce (4 étapes)
- [ ] Saisie d'adresse avec suggestions BAN
- [ ] Navigation tactile (barre d'action collante)
- [ ] Filtres de recherche avec synchronisation URL
- [ ] Affichage des badges DPE et prix CC
- [ ] Rotation portrait/paysage

## À venir
- Paiement Stripe (2% commission) via `/api/checkout` + Connect
- Favoris & édition (peuvent être ajoutés ensuite)
