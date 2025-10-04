create table public.class (
  id uuid not null default gen_random_uuid (),
  academic_year text not null,
  section text not null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  dept character varying not null,
  class character varying null,
  constraint class_pkey_ primary key (id),
  constraint class_class_key unique (class),
  constraint class_dept_fkey foreign KEY (dept) references department (code) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_class_academic_year on public.class using btree (academic_year) TABLESPACE pg_default;