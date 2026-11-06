create table if not exists public.project_submissions (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(title) between 1 and 80),
    description text not null check (char_length(description) between 1 and 1000),
    modules jsonb not null check (
        jsonb_typeof(modules) = 'array'
        and case
            when jsonb_typeof(modules) = 'array' then jsonb_array_length(modules) > 0
            else false
        end
    ),
    roles jsonb not null check (
        jsonb_typeof(roles) = 'array'
        and case
            when jsonb_typeof(roles) = 'array' then jsonb_array_length(roles) > 0
            else false
        end
    ),
    project_type text not null default 'Community',
    status text not null default 'new'
        check (status in ('new', 'contacted', 'in_progress', 'closed')),
    created_at timestamptz not null default now()
);

create table if not exists public.submission_contacts (
    submission_id uuid primary key
        references public.project_submissions(id) on delete cascade,
    client_name text not null check (char_length(client_name) between 1 and 100),
    client_email text not null check (char_length(client_email) between 3 and 254),
    client_phone text not null check (char_length(client_phone) between 3 and 32)
);

grant usage on schema public to anon, authenticated;

alter table public.project_submissions enable row level security;
alter table public.submission_contacts enable row level security;

drop policy if exists "Anyone can view public project details"
    on public.project_submissions;
create policy "Anyone can view public project details"
    on public.project_submissions for select
    to anon, authenticated
    using (true);

drop policy if exists "Admins can update submission status"
    on public.project_submissions;
create policy "Admins can update submission status"
    on public.project_submissions for update
    to authenticated
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can view client contact details"
    on public.submission_contacts;
create policy "Admins can view client contact details"
    on public.submission_contacts for select
    to authenticated
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

revoke all on public.project_submissions from public;
revoke all on public.project_submissions from anon;
revoke all on public.project_submissions from authenticated;
grant select on public.project_submissions to anon;
grant select on public.project_submissions to authenticated;
grant update (status) on public.project_submissions to authenticated;

revoke all on public.submission_contacts from public;
revoke all on public.submission_contacts from anon;
revoke all on public.submission_contacts from authenticated;
grant select on public.submission_contacts to authenticated;

create or replace function public.submit_project(
    p_title text,
    p_description text,
    p_modules jsonb,
    p_roles jsonb,
    p_client_name text,
    p_client_email text,
    p_client_phone text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    new_submission_id uuid;
begin
    if nullif(pg_catalog.btrim(p_title), '') is null
        or nullif(pg_catalog.btrim(p_description), '') is null
        or case
            when pg_catalog.jsonb_typeof(p_modules) = 'array'
                then pg_catalog.jsonb_array_length(p_modules) = 0
            else true
        end
        or case
            when pg_catalog.jsonb_typeof(p_roles) = 'array'
                then pg_catalog.jsonb_array_length(p_roles) = 0
            else true
        end
        or nullif(pg_catalog.btrim(p_client_name), '') is null
        or nullif(pg_catalog.btrim(p_client_email), '') is null
        or nullif(pg_catalog.btrim(p_client_phone), '') is null then
        raise exception 'All project and contact fields are required; modules and roles must be non-empty arrays.';
    end if;

    insert into public.project_submissions (title, description, modules, roles)
    values (
        pg_catalog.btrim(p_title),
        pg_catalog.btrim(p_descriError: sql parser error: Expected: end of statement, found: anon at Line: 60, Column: 55ption),
        p_modules,
        p_roles
    )
    returning id into new_submission_id;

    insert into public.submission_contacts (
        submission_id, client_name, client_email, client_phone
    )
    values (
        new_submission_id,
        pg_catalog.btrim(p_client_name),
        pg_catalog.btrim(p_client_email),
        pg_catalog.btrim(p_client_phone)
    );

    return new_submission_id;
end;
$$;

revoke all on function public.submit_project(
    text, text, jsonb, jsonb, text, text, text
) from public;
grant execute on function public.submit_project(
    text, text, jsonb, jsonb, text, text, text
) to anon;
grant execute on function public.submit_project(
    text, text, jsonb, jsonb, text, text, text
) to authenticated;
