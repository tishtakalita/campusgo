create table public.assignments (
  id uuid not null default gen_random_uuid (),
  course_id uuid not null,
  title character varying(200) not null,
  description text null,
  due_date timestamp without time zone not null,
  created_by uuid null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  class character varying null,
  constraint assignments_pkey primary key (id),
  constraint assignments_class_fkey foreign KEY (class) references class (class) on update CASCADE on delete CASCADE,
  constraint assignments_course_id_fkey foreign KEY (course_id) references courses (id) on update CASCADE on delete CASCADE,
  constraint assignments_created_by_fkey foreign KEY (created_by) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_assignments_course_due on public.assignments using btree (course_id, due_date) TABLESPACE pg_default;