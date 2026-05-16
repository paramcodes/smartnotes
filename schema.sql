create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  created_at timestamptz default now()
);

create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Untitled',
  content text default '',
  tags text[] default '{}',
  category text default 'General',
  is_archived boolean default false,
  is_public boolean default false,
  share_id text unique default encode(gen_random_bytes(6), 'hex'),
  ai_summary text,
  ai_action_items text[],
  ai_suggested_title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.ai_usage (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  note_id uuid references public.notes(id) on delete cascade,
  type text not null,
  created_at timestamptz default now()
);