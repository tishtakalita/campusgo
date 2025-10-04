create table public.projects (
  id uuid not null default gen_random_uuid (),
  title character varying(200) not null,
  description text null,
  course_id uuid null,
  creator_id uuid not null,
  creator_name character varying(100) null,
  due_date timestamp without time zone null,
  members_needed integer not null default 1,
  current_members integer not null default 1,
  member_ids uuid[] null default array[]::uuid[],
  member_names text[] null default array[]::text[],
  project_type character varying(50) null default 'academic'::character varying,
  skills_needed text[] null default array[]::text[],
  is_open_for_members boolean not null default true,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint projects_pkey primary key (id),
  constraint projects_course_id_fkey foreign KEY (course_id) references courses (id),
  constraint projects_creator_id_fkey foreign KEY (creator_id) references users (id) on update CASCADE on delete CASCADE,
  constraint projects_members_check check ((current_members <= members_needed)),
  constraint projects_members_positive check (
    (
      (members_needed > 0)
      and (current_members > 0)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_projects_creator on public.projects using btree (creator_id) TABLESPACE pg_default;

create index IF not exists idx_projects_course_due on public.projects using btree (course_id, due_date) TABLESPACE pg_default;

create index IF not exists idx_projects_open_members on public.projects using btree (is_open_for_members, members_needed) TABLESPACE pg_default;

create index IF not exists idx_projects_type on public.projects using btree (project_type) TABLESPACE pg_default;

create trigger update_projects_updated_at BEFORE
update on projects for EACH row
execute FUNCTION update_updated_at_column ();