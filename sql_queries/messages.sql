create table public.messages (
  id uuid not null default gen_random_uuid (),
  sender_id uuid null,
  receiver_id uuid null,
  content text not null,
  message_type character varying(20) null default 'text'::character varying,
  file_url text null,
  is_read boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint messages_pkey primary key (id),
  constraint messages_receiver_id_fkey foreign KEY (receiver_id) references users (id) on delete CASCADE,
  constraint messages_sender_id_fkey foreign KEY (sender_id) references users (id) on delete CASCADE,
  constraint messages_message_type_check check (
    (
      (message_type)::text = any (
        (
          array[
            'text'::character varying,
            'image'::character varying,
            'file'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_messages_sender on public.messages using btree (sender_id) TABLESPACE pg_default;

create index IF not exists idx_messages_receiver on public.messages using btree (receiver_id) TABLESPACE pg_default;

create index IF not exists idx_messages_created_at on public.messages using btree (created_at) TABLESPACE pg_default;