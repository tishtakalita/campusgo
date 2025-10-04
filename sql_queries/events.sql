create table public.events (
  id uuid not null default gen_random_uuid (),
  title character varying(255) not null,
  description text null,
  event_type character varying(50) not null default 'event'::character varying,
  start_date date not null,
  end_date date null,
  start_time time without time zone null,
  end_time time without time zone null,
  is_all_day boolean null default false,
  is_recurring boolean null default false,
  recurrence_type character varying(20) null,
  recurrence_end_date date null,
  priority character varying(10) null default 'medium'::character varying,
  status character varying(20) null default 'scheduled'::character varying,
  color character varying(7) null default '#3b82f6'::character varying,
  course_id uuid null,
  assignment_id uuid null,
  class_id uuid null,
  created_by uuid null,
  location character varying(255) null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  is_personal boolean not null default false,
  constraint events_pkey primary key (id),
  constraint events_assignment_id_fkey foreign KEY (assignment_id) references assignments (id) on delete CASCADE,
  constraint events_course_id_fkey foreign KEY (course_id) references courses (id) on delete set null,
  constraint events_created_by_fkey foreign KEY (created_by) references users (id) on delete CASCADE,
  constraint check_date_order check (
    (
      (end_date is null)
      or (end_date >= start_date)
    )
  ),
  constraint check_recurrence_end check (
    (
      (recurrence_end_date is null)
      or (recurrence_end_date >= start_date)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_events_start_date on public.events using btree (start_date) TABLESPACE pg_default;

create index IF not exists idx_events_end_date on public.events using btree (end_date) TABLESPACE pg_default;

create index IF not exists idx_events_event_type on public.events using btree (event_type) TABLESPACE pg_default;

create index IF not exists idx_events_course_id on public.events using btree (course_id) TABLESPACE pg_default;

create index IF not exists idx_events_created_by on public.events using btree (created_by) TABLESPACE pg_default;

create index IF not exists idx_events_date_range on public.events using btree (start_date, end_date) TABLESPACE pg_default;

create index IF not exists idx_events_is_personal on public.events using btree (is_personal) TABLESPACE pg_default;

create index IF not exists idx_events_is_personal_created_by on public.events using btree (is_personal, created_by) TABLESPACE pg_default;

create trigger update_events_updated_at BEFORE
update on events for EACH row
execute FUNCTION update_events_updated_at ();