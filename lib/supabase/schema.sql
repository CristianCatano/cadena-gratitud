-- Supabase schema for the gratitude app
create extension if not exists pgcrypto;


create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  a_name text not null,
  b_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists tokens (
  token text primary key,
  for_name text not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);
