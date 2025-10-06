create table public.events (
  id uuid not null default gen_random_uuid (),
  title character varying(255) not null,
  description text null,
  start_date date not null,
  start_time time without time zone null,
  end_time time without time zone null,
  is_all_day boolean null default false,
  priority character varying(10) null default 'medium'::character varying,
  color character varying(7) null default '#3b82f6'::character varying,
  course_id uuid null,
  created_by uuid null,
  location character varying(255) null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  is_personal boolean not null default false,
  class character varying null,
  constraint events_pkey primary key (id),
  constraint events_class_fkey foreign KEY (class) references class (class) on update CASCADE on delete CASCADE,
  constraint events_course_id_fkey foreign KEY (course_id) references courses (id) on delete set null,
  constraint events_created_by_fkey foreign KEY (created_by) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_events_start_date on public.events using btree (start_date) TABLESPACE pg_default;

create index IF not exists idx_events_course_id on public.events using btree (course_id) TABLESPACE pg_default;

create index IF not exists idx_events_created_by on public.events using btree (created_by) TABLESPACE pg_default;

create index IF not exists idx_events_is_personal on public.events using btree (is_personal) TABLESPACE pg_default;

create index IF not exists idx_events_is_personal_created_by on public.events using btree (is_personal, created_by) TABLESPACE pg_default;

create trigger update_events_updated_at BEFORE
update on events for EACH row
execute FUNCTION update_events_updated_at ();