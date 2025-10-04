create table public.saturday_class (
  id uuid not null default gen_random_uuid (),
  date date not null,
  class character varying(50) not null,
  tt_followed public.saturday_followed_enum not null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint saturday_class_pkey primary key (id),
  constraint saturday_class_class_fkey foreign KEY (class) references class (class) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_saturday_class_date on public.saturday_class using btree (date) TABLESPACE pg_default;

create index IF not exists idx_saturday_class_tt_followed on public.saturday_class using btree (tt_followed) TABLESPACE pg_default;

create index IF not exists idx_saturday_class_section on public.saturday_class using btree (class) TABLESPACE pg_default;