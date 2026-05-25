-- Silver100 Platform — Schema completo
-- Ejecutar en: Supabase > SQL Editor

-- 1. PROFILES
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  nombre text not null default '',
  role text not null default 'alumno' check (role in ('admin','profesor','alumno')),
  aprobado boolean not null default false,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Own profile" on profiles for select using (auth.uid() = id);
create policy "Admin reads all" on profiles for select using (exists (select 1 from profiles where id=auth.uid() and role='admin'));
create policy "Admin updates all" on profiles for update using (exists (select 1 from profiles where id=auth.uid() and role='admin'));
create policy "Insert own" on profiles for insert with check (auth.uid() = id);
create policy "Update own" on profiles for update using (auth.uid() = id);

-- 2. GRUPOS
create table if not exists grupos (
  id bigserial primary key,
  nombre text not null,
  horario text default '',
  dias text default '',
  profesor_id uuid references profiles(id),
  profesor_nombre text default '',
  max_alumnos int default 4,
  created_at timestamptz default now()
);
alter table grupos enable row level security;
create policy "Admin full grupos" on grupos for all using (exists (select 1 from profiles where id=auth.uid() and role='admin'));
create policy "Profesor own grupos" on grupos for select using (profesor_id=auth.uid() or exists (select 1 from profiles where id=auth.uid() and role='admin'));

-- 3. LEADS
create table if not exists leads (
  id bigserial primary key,
  nombre text not null,
  celular text default '',
  correo text default '',
  fuente text default 'WhatsApp',
  tiene_grupo boolean default false,
  estado text default 'new' check (estado in ('new','contact','interest','closed')),
  nota text default '',
  grupo_id bigint references grupos(id) on delete set null,
  pago_confirmado boolean default false,
  created_at timestamptz default now()
);
alter table leads enable row level security;
create policy "Admin full leads" on leads for all using (exists (select 1 from profiles where id=auth.uid() and role='admin'));
create policy "Profesor read leads" on leads for select using (exists (select 1 from profiles where id=auth.uid() and role in ('admin','profesor')));

-- 4. SESIONES
create table if not exists sesiones (
  id bigserial primary key,
  grupo_id bigint references grupos(id) on delete cascade not null,
  numero int not null,
  realizada boolean default false,
  no_realizada boolean default false,
  correo_enviado boolean default false,
  foto_adjunta boolean default false,
  foto_url text,
  feedback text default '',
  created_at timestamptz default now()
);
alter table sesiones enable row level security;
create policy "Admin full sesiones" on sesiones for all using (exists (select 1 from profiles where id=auth.uid() and role='admin'));
create policy "Profesor own sesiones" on sesiones for all using (
  exists (select 1 from grupos where id=sesiones.grupo_id and profesor_id=auth.uid()) or
  exists (select 1 from profiles where id=auth.uid() and role='admin')
);
create policy "Alumno read sesiones" on sesiones for select using (
  exists (select 1 from leads l join profiles p on p.email=l.correo where l.grupo_id=sesiones.grupo_id and p.id=auth.uid())
);

-- 5. CIERRE
create table if not exists cierre (
  id bigserial primary key,
  grupo_id bigint references grupos(id) on delete cascade unique not null,
  nps_enviado boolean default false,
  certificado_enviado boolean default false,
  pago_confirmado boolean default false,
  created_at timestamptz default now()
);
alter table cierre enable row level security;
create policy "Admin full cierre" on cierre for all using (exists (select 1 from profiles where id=auth.uid() and role='admin'));
create policy "Profesor read cierre" on cierre for select using (
  exists (select 1 from grupos where id=cierre.grupo_id and profesor_id=auth.uid())
);

-- 6. MATERIAL
create table if not exists material (
  id bigserial primary key,
  sesion_numero int not null check (sesion_numero in (1,2,3)),
  nombre text not null,
  url text not null,
  created_at timestamptz default now()
);
alter table material enable row level security;
create policy "Admin full material" on material for all using (exists (select 1 from profiles where id=auth.uid() and role='admin'));
create policy "All auth read material" on material for select using (auth.uid() is not null);

-- 7. NPS
create table if not exists nps (
  id bigserial primary key,
  lead_id bigint references leads(id),
  grupo_id bigint references grupos(id),
  nombre text,
  score int not null check (score between 1 and 10),
  comentario text default '',
  created_at timestamptz default now()
);
alter table nps enable row level security;
create policy "Admin full nps" on nps for all using (exists (select 1 from profiles where id=auth.uid() and role='admin'));
create policy "Anyone insert nps" on nps for insert with check (true);

-- 8. STORAGE
insert into storage.buckets (id, name, public) values ('silver100', 'silver100', true) on conflict do nothing;
create policy "Admin upload" on storage.objects for insert with check (
  bucket_id='silver100' and exists (select 1 from profiles where id=auth.uid() and role='admin')
);
create policy "All read storage" on storage.objects for select using (bucket_id='silver100');

-- ========================================
-- PASO FINAL: crear tu usuario admin
-- 1. En Supabase > Authentication > Users > Add user
--    Email: agustin@silver100.cl  (o el que uses con Google)
-- 2. Ejecutar:
-- UPDATE profiles SET role='admin', nombre='Agustín Dittborn', aprobado=true
--   WHERE email='tu-email@gmail.com';
-- ========================================
