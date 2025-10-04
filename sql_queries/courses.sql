create table public.courses (
  id uuid not null default gen_random_uuid (),
  name character varying(200) not null,
  code character varying(20) not null,
  faculty_id uuid not null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  dept character varying not null,
  semester smallint not null,
  constraint courses_pkey primary key (id),
  constraint courses_code_key unique (code),
  constraint courses_dept_fkey foreign KEY (dept) references department (code) on update CASCADE on delete CASCADE,
  constraint courses_faculty_id_fkey foreign KEY (faculty_id) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;