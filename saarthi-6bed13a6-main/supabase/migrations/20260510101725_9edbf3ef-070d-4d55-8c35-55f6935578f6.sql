create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  destination text not null,
  start_date date,
  end_date date,
  budget numeric default 0,
  cover_image text,
  notes text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.trips enable row level security;
create policy "trips_select_own_or_public" on public.trips for select using (auth.uid() = user_id or is_public = true);
create policy "trips_insert_own" on public.trips for insert with check (auth.uid() = user_id);
create policy "trips_update_own" on public.trips for update using (auth.uid() = user_id);
create policy "trips_delete_own" on public.trips for delete using (auth.uid() = user_id);

create table public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_number int not null,
  date date,
  summary text,
  created_at timestamptz not null default now()
);
alter table public.itinerary_days enable row level security;
create policy "days_owner" on public.itinerary_days for all
  using (exists (select 1 from public.trips t where t.id = trip_id and (t.user_id = auth.uid() or t.is_public = true)))
  with check (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()));

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.itinerary_days(id) on delete cascade,
  title text not null,
  location text,
  time text,
  notes text,
  lat numeric,
  lng numeric,
  sort_order int default 0,
  created_at timestamptz not null default now()
);
alter table public.activities enable row level security;
create policy "activities_owner" on public.activities for all
  using (exists (select 1 from public.itinerary_days d join public.trips t on t.id = d.trip_id where d.id = day_id and (t.user_id = auth.uid() or t.is_public = true)))
  with check (exists (select 1 from public.itinerary_days d join public.trips t on t.id = d.trip_id where d.id = day_id and t.user_id = auth.uid()));

create table public.packing_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  category text default 'general',
  packed boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.packing_items enable row level security;
create policy "packing_owner" on public.packing_items for all
  using (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()))
  with check (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()));

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null,
  content text,
  mood text,
  entry_date date default current_date,
  created_at timestamptz not null default now()
);
alter table public.journal_entries enable row level security;
create policy "journal_owner_or_public" on public.journal_entries for select
  using (exists (select 1 from public.trips t where t.id = trip_id and (t.user_id = auth.uid() or t.is_public = true)));
create policy "journal_write_owner" on public.journal_entries for insert with check (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()));
create policy "journal_update_owner" on public.journal_entries for update using (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()));
create policy "journal_delete_owner" on public.journal_entries for delete using (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()));

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  category text not null default 'other',
  amount numeric not null default 0,
  description text,
  spent_at date default current_date,
  created_at timestamptz not null default now()
);
alter table public.expenses enable row level security;
create policy "expenses_owner" on public.expenses for all
  using (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()))
  with check (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()));