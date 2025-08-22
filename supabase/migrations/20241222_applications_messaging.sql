-- Phase Relation PR1: Schéma Candidatures + Messagerie
-- Tables pour les candidatures (applications) et système de messagerie

-- Table des candidatures/applications
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade not null,
  tenant_id uuid references auth.users(id) on delete cascade not null,
  dossier_id uuid references rental_dossiers(id) on delete set null,
  status text not null default 'pending', -- pending | accepted | rejected | withdrawn
  message text, -- message d'accompagnement optionnel
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Constraint: un locataire ne peut candidater qu'une fois par propriété
  unique(property_id, tenant_id)
);

-- Table des fils de discussion (threads)
create table if not exists message_threads (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade not null,
  subject text not null default 'Candidature',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table des participants aux fils de discussion
create table if not exists thread_participants (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references message_threads(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'participant', -- participant | owner | tenant
  joined_at timestamptz default now(),
  
  -- Constraint: un utilisateur ne peut être qu'une fois dans un thread
  unique(thread_id, user_id)
);

-- Table des messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references message_threads(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table des notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- application_received | message_received | application_status_changed
  title text not null,
  message text not null,
  related_id uuid, -- ID de l'objet lié (application_id, message_id, etc.)
  read boolean default false,
  created_at timestamptz default now()
);

-- Activation du RLS pour toutes les nouvelles tables
alter table applications enable row level security;
alter table message_threads enable row level security;
alter table thread_participants enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;

-- Politiques RLS pour les applications
create policy "tenant can view own applications" on applications 
  for select using (auth.uid() = tenant_id);

create policy "owner can view applications for own properties" on applications
  for select using (
    auth.uid() in (
      select owner_id from properties where id = applications.property_id
    )
  );

create policy "tenant can create applications" on applications
  for insert with check (auth.uid() = tenant_id);

create policy "tenant can update own applications" on applications
  for update using (auth.uid() = tenant_id) 
  with check (auth.uid() = tenant_id);

create policy "owner can update applications for own properties" on applications
  for update using (
    auth.uid() in (
      select owner_id from properties where id = applications.property_id
    )
  ) with check (
    auth.uid() in (
      select owner_id from properties where id = applications.property_id
    )
  );

-- Politiques RLS pour les threads
create policy "participants can view threads" on message_threads
  for select using (
    id in (
      select thread_id from thread_participants where user_id = auth.uid()
    )
  );

create policy "system can create threads" on message_threads
  for insert with check (true); -- Géré par la fonction create_application

-- Politiques RLS pour les participants
create policy "participants can view thread participants" on thread_participants
  for select using (
    thread_id in (
      select thread_id from thread_participants where user_id = auth.uid()
    )
  );

create policy "system can manage participants" on thread_participants
  for all with check (true); -- Géré par la fonction create_application

-- Politiques RLS pour les messages
create policy "participants can view messages" on messages
  for select using (
    thread_id in (
      select thread_id from thread_participants where user_id = auth.uid()
    )
  );

create policy "participants can send messages" on messages
  for insert with check (
    auth.uid() = sender_id and
    thread_id in (
      select thread_id from thread_participants where user_id = auth.uid()
    )
  );

-- Politiques RLS pour les notifications
create policy "users can view own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "users can update own notifications" on notifications
  for update using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

create policy "system can create notifications" on notifications
  for insert with check (true); -- Géré par les fonctions système

-- Index pour optimiser les performances
create index if not exists applications_property_idx on applications (property_id);
create index if not exists applications_tenant_idx on applications (tenant_id);
create index if not exists applications_status_idx on applications (status);
create index if not exists message_threads_application_idx on message_threads (application_id);
create index if not exists thread_participants_thread_idx on thread_participants (thread_id);
create index if not exists thread_participants_user_idx on thread_participants (user_id);
create index if not exists messages_thread_idx on messages (thread_id);
create index if not exists messages_created_idx on messages (created_at desc);
create index if not exists notifications_user_idx on notifications (user_id);
create index if not exists notifications_unread_idx on notifications (user_id, read) where read = false;

-- Fonction atomique create_application
create or replace function create_application(
  p_property_id uuid,
  p_tenant_id uuid,
  p_dossier_id uuid default null,
  p_message text default null
) returns json as $$
declare
  v_application_id uuid;
  v_thread_id uuid;
  v_property_owner_id uuid;
  v_property_title text;
  v_tenant_name text;
  v_result json;
begin
  -- Vérifier que la propriété existe et récupérer les infos
  select owner_id, title into v_property_owner_id, v_property_title
  from properties 
  where id = p_property_id;
  
  if v_property_owner_id is null then
    return json_build_object(
      'success', false,
      'error', 'Propriété introuvable'
    );
  end if;

  -- Vérifier que le locataire existe et récupérer son nom
  select coalesce(first_name || ' ' || last_name, 'Locataire')
  into v_tenant_name
  from tenant_profiles 
  where user_id = p_tenant_id;
  
  if v_tenant_name is null then
    v_tenant_name := 'Locataire';
  end if;

  -- Vérifier qu'il n'y a pas déjà une candidature pour cette propriété
  if exists(select 1 from applications where property_id = p_property_id and tenant_id = p_tenant_id) then
    return json_build_object(
      'success', false,
      'error', 'Vous avez déjà candidaté pour cette propriété'
    );
  end if;

  -- Créer l'application
  insert into applications (property_id, tenant_id, dossier_id, message)
  values (p_property_id, p_tenant_id, p_dossier_id, p_message)
  returning id into v_application_id;

  -- Créer le thread de discussion
  insert into message_threads (application_id, subject)
  values (v_application_id, 'Candidature pour ' || v_property_title)
  returning id into v_thread_id;

  -- Ajouter les participants (propriétaire et locataire)
  insert into thread_participants (thread_id, user_id, role) values
    (v_thread_id, v_property_owner_id, 'owner'),
    (v_thread_id, p_tenant_id, 'tenant');

  -- Ajouter le message initial s'il est fourni
  if p_message is not null and length(trim(p_message)) > 0 then
    insert into messages (thread_id, sender_id, content)
    values (v_thread_id, p_tenant_id, p_message);
  end if;

  -- Créer une notification pour le propriétaire
  insert into notifications (user_id, type, title, message, related_id)
  values (
    v_property_owner_id,
    'application_received',
    'Nouvelle candidature',
    v_tenant_name || ' a candidaté pour votre propriété "' || v_property_title || '"',
    v_application_id
  );

  -- Retourner le résultat
  v_result := json_build_object(
    'success', true,
    'application_id', v_application_id,
    'thread_id', v_thread_id,
    'message', 'Candidature créée avec succès'
  );

  return v_result;

exception
  when others then
    return json_build_object(
      'success', false,
      'error', 'Erreur lors de la création de la candidature: ' || sqlerrm
    );
end;
$$ language plpgsql security definer;

-- Fonction utilitaire pour marquer les notifications comme lues
create or replace function mark_notifications_read(notification_ids uuid[])
returns void as $$
begin
  update notifications 
  set read = true, updated_at = now()
  where id = any(notification_ids) 
    and user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- Fonction pour récupérer les messages d'un thread avec pagination
create or replace function get_thread_messages(
  p_thread_id uuid,
  p_limit int default 50,
  p_offset int default 0
) returns table (
  id uuid,
  sender_id uuid,
  content text,
  created_at timestamptz,
  sender_name text
) as $$
begin
  -- Vérifier que l'utilisateur est participant du thread
  if not exists(
    select 1 from thread_participants 
    where thread_id = p_thread_id and user_id = auth.uid()
  ) then
    raise exception 'Accès non autorisé à ce thread';
  end if;

  return query
  select 
    m.id,
    m.sender_id,
    m.content,
    m.created_at,
    coalesce(
      tp_sender.first_name || ' ' || tp_sender.last_name,
      'Utilisateur'
    ) as sender_name
  from messages m
  left join tenant_profiles tp_sender on tp_sender.user_id = m.sender_id
  where m.thread_id = p_thread_id
  order by m.created_at desc
  limit p_limit offset p_offset;
end;
$$ language plpgsql security definer;