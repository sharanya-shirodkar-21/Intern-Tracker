-- Row-Level Security Policies for InternTrack

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.guide_assignments enable row level security;
alter table public.internships enable row level security;
alter table public.documents enable row level security;
alter table public.weekly_logs enable row level security;
alter table public.log_entries enable row level security;
alter table public.supervisor_links enable row level security;
alter table public.supervisor_confirmations enable row level security;
alter table public.guide_comments enable row level security;
alter table public.guide_contacts enable row level security;
alter table public.deadlines enable row level security;
alter table public.reminders enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;
alter table public.showcase_profiles enable row level security;
alter table public.atlas_posts enable row level security;

-- Helper function to get current user role
create or replace function public.current_user_role()
returns user_role as $$
    select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- Helper function to check if a student is assigned to current guide
create or replace function public.is_student_assigned_to_guide(p_student_id uuid)
returns boolean as $$
    select exists (
        select 1 from public.guide_assignments
        where student_id = p_student_id and guide_id = auth.uid()
    );
$$ language sql security definer stable;

-- 1. Profiles Policies
create policy "Users can view own profile or coordinators view all"
on public.profiles for select
using (
    id = auth.uid() 
    or public.current_user_role() = 'coordinator'
    or (public.current_user_role() = 'guide' and public.is_student_assigned_to_guide(id))
);

create policy "Users can update own contact info"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Coordinators can manage profiles"
on public.profiles for all
using (public.current_user_role() = 'coordinator');

-- 2. Guide Assignments Policies
create policy "Anyone authenticated can view guide assignments"
on public.guide_assignments for select
using (auth.uid() is not null);

create policy "Coordinators manage guide assignments"
on public.guide_assignments for all
using (public.current_user_role() = 'coordinator');

-- 3. Internships Policies
create policy "Students view and edit own internship"
on public.internships for all
using (
    student_id = auth.uid() 
    or public.current_user_role() = 'coordinator'
    or (public.current_user_role() = 'guide' and public.is_student_assigned_to_guide(student_id))
);

-- 4. Documents Policies
create policy "Document access policy"
on public.documents for all
using (
    exists (
        select 1 from public.internships i
        where i.id = internship_id and (
            i.student_id = auth.uid()
            or public.current_user_role() = 'coordinator'
            or (public.current_user_role() = 'guide' and public.is_student_assigned_to_guide(i.student_id))
        )
    )
);

-- 5. Weekly Logs Policies
create policy "Weekly logs access policy"
on public.weekly_logs for all
using (
    exists (
        select 1 from public.internships i
        where i.id = internship_id and (
            i.student_id = auth.uid()
            or public.current_user_role() = 'coordinator'
            or (public.current_user_role() = 'guide' and public.is_student_assigned_to_guide(i.student_id))
        )
    )
);

-- 6. Log Entries Policies
create policy "Log entries access policy"
on public.log_entries for all
using (
    exists (
        select 1 from public.weekly_logs w
        join public.internships i on i.id = w.internship_id
        where w.id = weekly_log_id and (
            i.student_id = auth.uid()
            or public.current_user_role() = 'coordinator'
            or (public.current_user_role() = 'guide' and public.is_student_assigned_to_guide(i.student_id))
        )
    )
);

-- 7. Supervisor Confirmations & Links
-- Supervisor links and confirmations are managed via Service Role / Edge Functions with hashed token
create policy "Coordinators and guides view supervisor confirmations"
on public.supervisor_confirmations for select
using (
    exists (
        select 1 from public.weekly_logs w
        join public.internships i on i.id = w.internship_id
        where w.id = weekly_log_id and (
            i.student_id = auth.uid()
            or public.current_user_role() = 'coordinator'
            or (public.current_user_role() = 'guide' and public.is_student_assigned_to_guide(i.student_id))
        )
    )
);

-- 8. Guide Comments & Contacts
create policy "Guide comments read policy"
on public.guide_comments for select
using (
    exists (
        select 1 from public.weekly_logs w
        join public.internships i on i.id = w.internship_id
        where w.id = weekly_log_id and (
            i.student_id = auth.uid()
            or public.current_user_role() = 'coordinator'
            or (public.current_user_role() = 'guide' and public.is_student_assigned_to_guide(i.student_id))
        )
    )
);

create policy "Guides can insert comments"
on public.guide_comments for insert
with check (
    guide_id = auth.uid() and public.current_user_role() = 'guide'
);

create policy "Guide contacts policy"
on public.guide_contacts for all
using (
    public.current_user_role() = 'coordinator'
    or (public.current_user_role() = 'guide' and guide_id = auth.uid())
);

-- 9. Deadlines & Notifications
create policy "Deadlines are readable by all"
on public.deadlines for select
using (auth.uid() is not null);

create policy "Notifications viewable by owner"
on public.notifications for select
using (user_id = auth.uid());

create policy "Notifications updatable by owner"
on public.notifications for update
using (user_id = auth.uid());

-- 10. Showcase and Atlas
create policy "Showcase profiles public read if is_public"
on public.showcase_profiles for select
using (is_public = true or student_id = auth.uid());

create policy "Students manage own showcase profile"
on public.showcase_profiles for all
using (student_id = auth.uid());

create policy "Atlas posts viewable by authenticated"
on public.atlas_posts for select
using (auth.uid() is not null and approved_by_coordinator = true);
