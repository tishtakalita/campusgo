create table public.timetable (
  id uuid not null default gen_random_uuid (),
  course_id uuid not null,
  room character varying(100) not null,
  class text not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  day_of_week public.day_of_week_enum not null,
  constraint class_pkey primary key (id),
  constraint class_course_id_fkey foreign KEY (course_id) references courses (id),
  constraint timetable_class_fkey foreign KEY (class) references class (class)
) TABLESPACE pg_default;

create index IF not exists idx_class_section on public.timetable using btree (class) TABLESPACE pg_default;

create index IF not exists idx_class_course_start_time on public.timetable using btree (course_id, start_time) TABLESPACE pg_default;

create index IF not exists idx_class_day_of_week on public.timetable using btree (day_of_week) TABLESPACE pg_default;