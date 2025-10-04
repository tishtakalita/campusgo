create table public.friend_requests (
  id uuid not null default gen_random_uuid (),
  sender_id uuid null,
  receiver_id uuid null,
  status character varying(20) null default 'pending'::character varying,
  message text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint friend_requests_pkey primary key (id),
  constraint friend_requests_sender_id_receiver_id_key unique (sender_id, receiver_id),
  constraint friend_requests_receiver_id_fkey foreign KEY (receiver_id) references users (id) on delete CASCADE,
  constraint friend_requests_sender_id_fkey foreign KEY (sender_id) references users (id) on delete CASCADE,
  constraint friend_requests_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pending'::character varying,
            'accepted'::character varying,
            'rejected'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_friend_requests_sender on public.friend_requests using btree (sender_id) TABLESPACE pg_default;

create index IF not exists idx_friend_requests_receiver on public.friend_requests using btree (receiver_id) TABLESPACE pg_default;

create index IF not exists idx_friend_requests_status on public.friend_requests using btree (status) TABLESPACE pg_default;