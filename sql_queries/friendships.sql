create table public.friendships (
  id uuid not null default gen_random_uuid (),
  user1_id uuid null,
  user2_id uuid null,
  created_at timestamp with time zone null default now(),
  constraint friendships_pkey primary key (id),
  constraint friendships_user1_id_user2_id_key unique (user1_id, user2_id),
  constraint friendships_user1_id_fkey foreign KEY (user1_id) references users (id) on delete CASCADE,
  constraint friendships_user2_id_fkey foreign KEY (user2_id) references users (id) on delete CASCADE,
  constraint friendships_check check ((user1_id <> user2_id)),
  constraint friendships_check1 check ((user1_id < user2_id))
) TABLESPACE pg_default;

create index IF not exists idx_friendships_user1 on public.friendships using btree (user1_id) TABLESPACE pg_default;

create index IF not exists idx_friendships_user2 on public.friendships using btree (user2_id) TABLESPACE pg_default;