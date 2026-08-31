-- ─────────────────────────────────────────────────────────────
-- Generador de Brief de Clientes — esquema de Supabase
--
-- Ejecutar completo en el editor SQL del proyecto. Es idempotente.
-- ─────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Preguntas ────────────────────────────────────────────────
-- El catálogo del código es sólo la semilla: una vez creadas acá, estas filas
-- son la fuente de verdad y el panel las edita.
create table if not exists public.questions (
  id          text primary key,
  niche       text not null,
  category    text not null,
  text        text not null,
  type        text not null,
  required    boolean not null default false,
  options     jsonb not null default '[]'::jsonb,
  conditions  jsonb not null default '[]'::jsonb,
  help        text,
  placeholder text,
  format      text,
  "order"     integer not null default 0,
  built_in    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists questions_niche_idx on public.questions (niche);
create index if not exists questions_category_idx on public.questions (category);

-- ── Clientes / proyectos ─────────────────────────────────────
create table if not exists public.clients (
  id               uuid primary key default gen_random_uuid(),
  contact_name     text not null,
  company          text not null,
  email            text not null,
  phone            text not null default '',
  niche            text,
  status           text not null default 'borrador',
  token            text not null unique,
  internal_notes   text not null default '',
  answers          jsonb not null default '{}'::jsonb,
  brief_overrides  jsonb not null default '{"sections":{},"agencyNotes":""}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  submitted_at     timestamptz
);

create index if not exists clients_token_idx on public.clients (token);
create index if not exists clients_status_idx on public.clients (status);
create index if not exists clients_niche_idx on public.clients (niche);

alter table public.clients
  drop constraint if exists clients_status_check;
alter table public.clients
  add constraint clients_status_check
  check (status in ('borrador','enviado','incompleto','recibido','en_revision','aprobado'));

-- ── Seguridad ────────────────────────────────────────────────
-- Ambas tablas quedan cerradas: el acceso del cliente pasa por el servidor de
-- la app, que valida el token y usa la clave de servicio. Así el token nunca
-- sirve para leer la tabla completa desde el navegador.
alter table public.clients   enable row level security;
alter table public.questions enable row level security;

-- Cualquier persona autenticada de la agencia lee y escribe.
drop policy if exists "agencia lee clientes" on public.clients;
create policy "agencia lee clientes" on public.clients
  for select to authenticated using (true);

drop policy if exists "agencia escribe clientes" on public.clients;
create policy "agencia escribe clientes" on public.clients
  for all to authenticated using (true) with check (true);

drop policy if exists "agencia lee preguntas" on public.questions;
create policy "agencia lee preguntas" on public.questions
  for select to authenticated using (true);

drop policy if exists "agencia escribe preguntas" on public.questions;
create policy "agencia escribe preguntas" on public.questions
  for all to authenticated using (true) with check (true);

-- Sin políticas para `anon`: el formulario del cliente no habla directo con la
-- base, va contra las rutas de la app.

-- ── updated_at automático ────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_touch on public.clients;
create trigger clients_touch before update on public.clients
  for each row execute function public.touch_updated_at();

drop trigger if exists questions_touch on public.questions;
create trigger questions_touch before update on public.questions
  for each row execute function public.touch_updated_at();

-- ── Storage ──────────────────────────────────────────────────
-- Bucket privado para los adjuntos. Se lee y escribe sólo desde el servidor
-- con la clave de servicio.
insert into storage.buckets (id, name, public)
values ('brief-adjuntos', 'brief-adjuntos', false)
on conflict (id) do nothing;

drop policy if exists "agencia lee adjuntos" on storage.objects;
create policy "agencia lee adjuntos" on storage.objects
  for select to authenticated using (bucket_id = 'brief-adjuntos');
