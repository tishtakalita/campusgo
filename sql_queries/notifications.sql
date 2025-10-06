create table public.notifications (
  id uuid not null default gen_random_uuid (),
  recipient_id uuid not null,
  actor_id uuid null,
  notif_type public.notification_type not null,
  title text not null,
  message text null,
  meta jsonb null,
  is_read boolean not null default false,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  resource_id uuid null,
  assignment_id uuid null,
  event_id uuid null,
  timetable_id uuid null,
  saturday_row_id uuid null,
  constraint notifications_pkey primary key (id),
  constraint notifications_assignment_fkey foreign KEY (assignment_id) references assignments (id) on update CASCADE on delete set null,
  constraint notifications_event_fkey foreign KEY (event_id) references events (id) on update CASCADE on delete set null,
  constraint notifications_actor_fkey foreign KEY (actor_id) references users (id) on update CASCADE on delete set null,
  constraint notifications_recipient_fkey foreign KEY (recipient_id) references users (id) on update CASCADE on delete CASCADE,
  constraint notifications_satclass_fkey foreign KEY (saturday_row_id) references saturday_class (id) on update CASCADE on delete set null,
  constraint notifications_timetable_fkey foreign KEY (timetable_id) references timetable (id) on update CASCADE on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_notifications_recipient on public.notifications using btree (recipient_id, is_read, created_at) TABLESPACE pg_default;

create index IF not exists idx_notifications_type on public.notifications using btree (notif_type) TABLESPACE pg_default;

create index IF not exists idx_notifications_created on public.notifications using btree (created_at desc) TABLESPACE pg_default;