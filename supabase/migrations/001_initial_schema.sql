-- InternTrack Database Schema Migration
-- Course: ET740 BE Sem VII Internship (8 weeks)
-- Target: Supabase Postgres

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
    create type user_role as enum ('student', 'guide', 'coordinator');
exception when duplicate_object then null;
end $$;

do $$ begin
    create type internship_mode as enum ('onsite', 'remote', 'hybrid');
exception when duplicate_object then null;
end $$;

do $$ begin
    create type internship_status as enum ('draft', 'registered', 'approved', 'completed');
exception when duplicate_object then null;
end $$;

do $$ begin
    create type document_type as enum ('offer_letter', 'certificate', 'report');
exception when duplicate_object then null;
end $$;

do $$ begin
    create type confirmation_status as enum ('pending', 'confirmed', 'flagged');
exception when duplicate_object then null;
end $$;

do $$ begin
    create type contact_type as enum ('visit', 'phone', 'online');
exception when duplicate_object then null;
end $$;

-- 1. Profiles
create table if not exists public.profiles (
    id uuid primary key default gen_random_uuid(),
    role user_role not null default 'student',
    name text not null,
    email text unique not null,
    phone text,
    roll_no text unique,
    batch text not null default '2021-2025',
    semester text not null default 'VII',
    department text not null default 'Electronics & Telecommunication',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. Guide Assignments
create table if not exists public.guide_assignments (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.profiles(id) on delete cascade,
    guide_id uuid not null references public.profiles(id) on delete cascade,
    assigned_at timestamptz not null default now(),
    unique(student_id)
);

-- 3. Internships
create table if not exists public.internships (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.profiles(id) on delete cascade,
    company_name text not null,
    address text not null,
    company_email text not null,
    company_phone text not null,
    supervisor_name text not null,
    supervisor_designation text not null,
    supervisor_email text not null,
    start_date date not null,
    end_date date not null,
    mode internship_mode not null default 'onsite',
    domain text not null,
    status internship_status not null default 'registered',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(student_id)
);

-- 4. Documents (Versioned)
create table if not exists public.documents (
    id uuid primary key default gen_random_uuid(),
    internship_id uuid not null references public.internships(id) on delete cascade,
    type document_type not null,
    storage_path text not null,
    file_name text not null,
    file_size int not null,
    mime_type text not null,
    version int not null default 1,
    checks_json jsonb default '{}'::jsonb,
    uploaded_at timestamptz not null default now()
);

-- 5. Weekly Logs (Weeks 1 to 8 with Hash Chain)
create table if not exists public.weekly_logs (
    id uuid primary key default gen_random_uuid(),
    internship_id uuid not null references public.internships(id) on delete cascade,
    week_no int not null check (week_no between 1 and 8),
    week_start date not null,
    week_end date not null,
    locked_at timestamptz,
    prev_hash text,
    hash text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(internship_id, week_no)
);

-- 6. Log Entries
create table if not exists public.log_entries (
    id uuid primary key default gen_random_uuid(),
    weekly_log_id uuid not null references public.weekly_logs(id) on delete cascade,
    entry_date date not null,
    content text not null,
    specificity_score int default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(weekly_log_id, entry_date)
);

-- 7. Supervisor Links & Confirmations
create table if not exists public.supervisor_links (
    id uuid primary key default gen_random_uuid(),
    internship_id uuid not null references public.internships(id) on delete cascade,
    token_hash text not null unique,
    otp_code_hash text,
    otp_expires_at timestamptz,
    expires_at timestamptz not null,
    revoked_at timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists public.supervisor_confirmations (
    id uuid primary key default gen_random_uuid(),
    weekly_log_id uuid not null references public.weekly_logs(id) on delete cascade,
    token_hash text not null,
    status confirmation_status not null default 'confirmed',
    confirmed_by_name text not null,
    confirmed_at timestamptz not null default now(),
    ip inet,
    user_agent text,
    comment text,
    unique(weekly_log_id)
);

-- 8. Guide Comments & Contacts
create table if not exists public.guide_comments (
    id uuid primary key default gen_random_uuid(),
    weekly_log_id uuid not null references public.weekly_logs(id) on delete cascade,
    guide_id uuid not null references public.profiles(id) on delete cascade,
    body text not null,
    created_at timestamptz not null default now()
);

create table if not exists public.guide_contacts (
    id uuid primary key default gen_random_uuid(),
    internship_id uuid not null references public.internships(id) on delete cascade,
    guide_id uuid not null references public.profiles(id) on delete cascade,
    type contact_type not null,
    contact_date date not null,
    with_whom text not null,
    summary text not null,
    outcome text,
    follow_up_date date,
    created_at timestamptz not null default now()
);

-- 9. Deadlines & Reminders
create table if not exists public.deadlines (
    id uuid primary key default gen_random_uuid(),
    key text unique not null,
    label text not null,
    rule_json jsonb not null,
    created_at timestamptz not null default now()
);

create table if not exists public.reminders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    deadline_key text not null references public.deadlines(key) on delete cascade,
    sent_at timestamptz not null default now(),
    channel text not null default 'in_app'
);

create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    body text not null,
    link text,
    read_at timestamptz,
    created_at timestamptz not null default now()
);

-- 10. Audit Log (Append-Only)
create table if not exists public.audit_log (
    id uuid primary key default gen_random_uuid(),
    actor uuid,
    action text not null,
    table_name text not null,
    row_id uuid not null,
    before_state jsonb,
    after_state jsonb,
    ip inet,
    recorded_at timestamptz not null default now()
);

-- 11. Showcase & Atlas
create table if not exists public.showcase_profiles (
    student_id uuid primary key references public.profiles(id) on delete cascade,
    is_public boolean not null default false,
    slug text unique not null,
    headline text,
    skills_tags text[] default '{}',
    visibility_json jsonb not null default '{"company": true, "domain": true, "logs": true, "badges": true}'::jsonb,
    updated_at timestamptz not null default now()
);

create table if not exists public.atlas_posts (
    id uuid primary key default gen_random_uuid(),
    internship_id uuid not null references public.internships(id) on delete cascade,
    is_anonymized boolean not null default true,
    tips text not null,
    what_i_wish_i_knew text,
    how_i_got_it text,
    difficulty_rating int check (difficulty_rating between 1 and 5),
    overall_rating int check (overall_rating between 1 and 5),
    tags text[] default '{}',
    approved_by_coordinator boolean default true,
    created_at timestamptz not null default now()
);

-- Hard Backfill Prevention Trigger Function
create or replace function public.fn_prevent_weekly_log_backfilling()
returns trigger as $$
declare
    v_week_start date;
    v_week_end date;
    v_lock_time timestamptz;
    v_grace_hours int := 24;
    v_now timestamptz := now();
begin
    select week_start, week_end, locked_at 
    into v_week_start, v_week_end, v_lock_time
    from public.weekly_logs 
    where id = new.weekly_log_id;

    -- 1. No future entries
    if new.entry_date > current_date then
        raise exception 'BACKFILL_PROHIBITED: Cannot log entries for future dates (%).', new.entry_date;
    end if;

    -- 2. Within designated week bounds
    if new.entry_date < v_week_start or new.entry_date > v_week_end then
        raise exception 'INVALID_WEEK_DATE: Date % does not belong to Week window [% - %].', 
            new.entry_date, v_week_start, v_week_end;
    end if;

    -- 3. Check lock status
    if v_lock_time is not null and v_now > v_lock_time then
        raise exception 'WEEK_LOCKED: Week ended on % and lock was sealed on %. Editing is strictly barred.', 
            v_week_end, v_lock_time;
    end if;

    if v_now > (v_week_end + interval '1 day' + (v_grace_hours || ' hours')::interval) then
        update public.weekly_logs set locked_at = v_now where id = new.weekly_log_id;
        raise exception 'WEEK_LOCKED: Grace period of % hours expired on %. Editing is strictly barred.', 
            v_grace_hours, (v_week_end + interval '1 day' + (v_grace_hours || ' hours')::interval);
    end if;

    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_enforce_weekly_lock on public.log_entries;
create trigger trg_enforce_weekly_lock
before insert or update on public.log_entries
for each row execute function public.fn_prevent_weekly_log_backfilling();
