-- supabase/schema.sql
-- Run this in your Supabase SQL editor

create extension if not exists "uuid-ossp";

-- ==========================================
-- USER PROFILES with Resonance gamification
-- ==========================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  
  -- Resonance Gamification
  vibrations int default 0,
  resonance_rank int default 1,
  total_measurements int default 0,
  streak_days int default 0,
  last_active date,
  
  -- Badges stored as JSONB array
  badges jsonb default '[]'::jsonb,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- LOCATIONS (spaces to rate)
-- ==========================================
create table if not exists public.locations (
  id uuid primary key default uuid_generate_v4(),
  
  -- Basic info
  name text not null,
  location_type text not null, -- 'cafe', 'library', 'park', 'office', 'home', 'other'
  address text,
  city text,
  state text,
  country text default 'USA',
  
  -- Geo
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  
  -- Aggregate scores (updated by triggers)
  avg_sound_db decimal(5, 2) default 0,
  avg_light_lux decimal(8, 2) default 0,
  avg_stability decimal(5, 2) default 0,
  avg_vibe_score decimal(4, 2) default 0,
  total_ratings int default 0,
  
  -- Metadata
  created_by uuid references public.profiles(id),
  verified boolean default false,
  featured boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- VIBE MEASUREMENTS (individual readings)
-- ==========================================
create table if not exists public.measurements (
  id uuid primary key default uuid_generate_v4(),
  
  user_id uuid references public.profiles(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  
  -- Raw sensor data
  sound_db decimal(5, 2),
  light_lux decimal(8, 2),
  stability_score decimal(5, 2),
  
  -- Calculated scores
  vibe_score decimal(4, 2),
  comfort_rating int check (comfort_rating between 1 and 10),
  
  -- 17-second measurement data
  measurement_duration int default 17,
  frequency_data jsonb, -- stores the waveform data
  
  -- Context tags
  tags text[] default '{}',
  notes text,
  
  -- Resonance rewards earned
  vibrations_earned int default 10,
  
  created_at timestamptz default now()
);

-- ==========================================
-- RESONANCE TRANSACTIONS (vibration history)
-- ==========================================
create table if not exists public.resonance_transactions (
  id uuid primary key default uuid_generate_v4(),
  
  user_id uuid references public.profiles(id) on delete cascade,
  
  amount int not null,
  transaction_type text not null, -- 'measurement', 'streak', 'level_up', 'send_vibes', 'amplify', 'badge'
  
  -- Optional references
  measurement_id uuid references public.measurements(id),
  target_user_id uuid references public.profiles(id),
  
  description text,
  created_at timestamptz default now()
);

-- ==========================================
-- RANK THRESHOLDS
-- ==========================================
create table if not exists public.rank_thresholds (
  rank int primary key,
  name text not null,
  min_vibrations int not null,
  icon text,
  color text
);

-- Seed rank data
insert into public.rank_thresholds (rank, name, min_vibrations, icon, color) values
  (1, 'Listener', 0, '👂', '#6B7280'),
  (2, 'Sensor', 100, '📡', '#3B82F6'),
  (3, 'Resonator', 500, '🔊', '#8B5CF6'),
  (4, 'Harmonizer', 1500, '🎵', '#EC4899'),
  (5, 'Frequency Master', 5000, '⚡', '#F59E0B')
on conflict (rank) do nothing;

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Update location averages after new measurement
create or replace function update_location_averages()
returns trigger as $$
begin
  update public.locations
  set 
    avg_sound_db = (select avg(sound_db) from public.measurements where location_id = NEW.location_id),
    avg_light_lux = (select avg(light_lux) from public.measurements where location_id = NEW.location_id),
    avg_stability = (select avg(stability_score) from public.measurements where location_id = NEW.location_id),
    avg_vibe_score = (select avg(vibe_score) from public.measurements where location_id = NEW.location_id),
    total_ratings = (select count(*) from public.measurements where location_id = NEW.location_id),
    updated_at = now()
  where id = NEW.location_id;
  return NEW;
end;
$$ language plpgsql;

create trigger update_location_trigger
after insert on public.measurements
for each row execute function update_location_averages();

-- Update user stats & vibrations after measurement
create or replace function update_user_resonance()
returns trigger as $$
declare
  new_total int;
  current_rank int;
  next_rank_threshold int;
begin
  -- Update profile stats
  update public.profiles
  set 
    total_measurements = total_measurements + 1,
    vibrations = vibrations + NEW.vibrations_earned,
    last_active = current_date,
    updated_at = now()
  where id = NEW.user_id;
  
  -- Check for rank up
  select vibrations into new_total from public.profiles where id = NEW.user_id;
  select resonance_rank into current_rank from public.profiles where id = NEW.user_id;
  select min_vibrations into next_rank_threshold 
    from public.rank_thresholds 
    where rank = current_rank + 1;
  
  if next_rank_threshold is not null and new_total >= next_rank_threshold then
    update public.profiles
    set resonance_rank = current_rank + 1
    where id = NEW.user_id;
  end if;
  
  -- Log the transaction
  insert into public.resonance_transactions (user_id, amount, transaction_type, measurement_id, description)
  values (NEW.user_id, NEW.vibrations_earned, 'measurement', NEW.id, 'Vibe measurement completed');
  
  return NEW;
end;
$$ language plpgsql;

create trigger user_resonance_trigger
after insert on public.measurements
for each row execute function update_user_resonance();

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.measurements enable row level security;
alter table public.resonance_transactions enable row level security;

-- Profiles: users can read all, update own
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Locations: anyone can read, authenticated can create
create policy "Locations are viewable by everyone" on public.locations
  for select using (true);

create policy "Authenticated users can create locations" on public.locations
  for insert with check (auth.role() = 'authenticated');

-- Measurements: anyone can read, owner can create
create policy "Measurements are viewable by everyone" on public.measurements
  for select using (true);

create policy "Users can create own measurements" on public.measurements
  for insert with check (auth.uid() = user_id);

-- Transactions: users can only see their own
create policy "Users can view own transactions" on public.resonance_transactions
  for select using (auth.uid() = user_id);

-- ==========================================
-- INDEXES
-- ==========================================

create index if not exists idx_locations_geo on public.locations(latitude, longitude);
create index if not exists idx_locations_type on public.locations(location_type);
create index if not exists idx_measurements_user on public.measurements(user_id);
create index if not exists idx_measurements_location on public.measurements(location_id);
create index if not exists idx_profiles_vibrations on public.profiles(vibrations desc);
