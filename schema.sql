-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.forum_replies (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  topic_id bigint,
  body text NOT NULL,
  author_name text NOT NULL,
  image_url text,
  CONSTRAINT forum_replies_pkey PRIMARY KEY (id),
  CONSTRAINT forum_replies_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.forum_topics(id)
);
CREATE TABLE public.forum_topics (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL,
  author_name text NOT NULL,
  image_url text,
  CONSTRAINT forum_topics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.materi (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text,
  kelas integer,
  spesialisasi text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  modul text,
  durasi integer DEFAULT 0,
  tingkat text,
  icon text,
  deskripsi text,
  konten text,
  videourl text,
  pdfurl text,
  jobsheeturl text,
  quiz_data jsonb,
  created_by uuid,
  essay_pdf_url text,
  CONSTRAINT materi_pkey PRIMARY KEY (id),
  CONSTRAINT materi_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'superadmin'::text])),
  email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  username text,
  name text,
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
