create table public.resources (
  id uuid not null default gen_random_uuid (),
  title character varying(200) not null,
  description text null,
  file_url text not null,
  resource_type public.resource_type not null,
  course_id uuid not null,
  uploaded_by uuid not null,
  download_count integer null default 0,
  tags text[] null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  category public.resource_category not null default 'materials'::resource_category,
  constraint resources_pkey primary key (id),
  constraint resources_course_id_fkey foreign KEY (course_id) references courses (id),
  constraint resources_uploaded_by_fkey foreign KEY (uploaded_by) references users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_resources_course_type on public.resources using btree (course_id, resource_type) TABLESPACE pg_default;

create index IF not exists idx_resources_type_course on public.resources using btree (resource_type, course_id) TABLESPACE pg_default;

create index IF not exists idx_resources_category on public.resources using btree (category) TABLESPACE pg_default;

create index IF not exists idx_resources_category_course on public.resources using btree (category, course_id) TABLESPACE pg_default;

create index IF not exists idx_resources_category_type on public.resources using btree (category, resource_type) TABLESPACE pg_default;