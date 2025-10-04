create table public.department (
  id uuid not null default gen_random_uuid (),
  name character varying(200) not null,
  code character varying(10) not null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint departments_pkey primary key (id),
  constraint departments_code_key unique (code)
) TABLESPACE pg_default;