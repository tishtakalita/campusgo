create table public.users (
  id uuid not null default gen_random_uuid (),
  email character varying(255) not null,
  roll_no character varying(100) not null,
  password_hash character varying(255) not null,
  first_name character varying(100) not null,
  last_name character varying(100) not null,
  role public.user_role not null,
  is_active boolean not null default true,
  last_login timestamp without time zone not null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  cgpa double precision null,
  dept character varying not null,
  class character varying null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_student_id_key unique (roll_no),
  constraint users_class_fkey foreign KEY (class) references class (class),
  constraint users_dept_fkey foreign KEY (dept) references department (code) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_users_email on public.users using btree (email) TABLESPACE pg_default;

create index IF not exists idx_users_student_id on public.users using btree (roll_no) TABLESPACE pg_default;

create index IF not exists idx_users_role on public.users using btree (role) TABLESPACE pg_default;