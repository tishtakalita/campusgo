-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying,
  context_data jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.ai_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  user_message text,
  ai_response text,
  message_order integer NOT NULL,
  response_time integer,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_messages_pkey PRIMARY KEY (id),
  CONSTRAINT ai_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id)
);
CREATE TABLE public.assignment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  student_id uuid NOT NULL,
  submission_text text,
  file_url text,
  submitted_at timestamp without time zone,
  grade integer,
  feedback text,
  graded_by uuid,
  graded_at timestamp without time zone,
  status USER-DEFINED DEFAULT 'draft'::submission_status,
  CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id),
  CONSTRAINT assignment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id),
  CONSTRAINT assignment_submissions_graded_by_fkey FOREIGN KEY (graded_by) REFERENCES public.users(id)
);
CREATE TABLE public.assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  due_date timestamp without time zone NOT NULL,
  total_points integer DEFAULT 100,
  assignment_type USER-DEFINED DEFAULT 'homework'::assignment_type,
  priority USER-DEFINED DEFAULT 'medium'::assignment_priority,
  is_published boolean DEFAULT false,
  created_by uuid,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT assignments_pkey PRIMARY KEY (id),
  CONSTRAINT assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bookmarkable_type character varying NOT NULL,
  bookmarkable_id uuid NOT NULL,
  title character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  room character varying,
  start_time timestamp without time zone NOT NULL,
  end_time timestamp without time zone NOT NULL,
  day_of_week integer,
  is_recurring boolean DEFAULT true,
  status USER-DEFINED DEFAULT 'scheduled'::class_status,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  instructor_images ARRAY,
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  code character varying NOT NULL UNIQUE,
  description text,
  credits integer DEFAULT 3,
  department_id uuid,
  faculty_id uuid,
  semester integer,
  academic_year character varying,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT courses_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.users(id)
);
CREATE TABLE public.current_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  actual_start_time timestamp without time zone,
  actual_end_time timestamp without time zone,
  attendance_count integer DEFAULT 0,
  status USER-DEFINED DEFAULT 'scheduled'::class_status,
  notes text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  attendance_taken boolean DEFAULT false,
  attendance_data jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT current_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT current_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  code character varying NOT NULL UNIQUE,
  description text,
  head_id uuid,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT fk_head_id FOREIGN KEY (head_id) REFERENCES public.users(id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  course_id uuid NOT NULL,
  enrollment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  status USER-DEFINED DEFAULT 'active'::enrollment_status,
  final_grade character varying,
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id),
  CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  original_name character varying NOT NULL,
  file_type USER-DEFINED NOT NULL,
  file_size integer NOT NULL,
  mime_type character varying,
  file_path text NOT NULL,
  owner_id uuid NOT NULL,
  course_id uuid,
  project_id uuid,
  assignment_id uuid,
  is_public boolean DEFAULT false,
  upload_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  last_accessed timestamp without time zone,
  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id),
  CONSTRAINT files_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT files_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT files_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id)
);
CREATE TABLE public.ideas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  content text NOT NULL,
  user_id uuid NOT NULL,
  course_id uuid,
  project_id uuid,
  tags ARRAY,
  is_favorite boolean DEFAULT false,
  color character varying DEFAULT '#ffffff'::character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ideas_pkey PRIMARY KEY (id),
  CONSTRAINT ideas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT ideas_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT ideas_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  message text,
  type USER-DEFINED NOT NULL,
  is_read boolean DEFAULT false,
  related_id uuid,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  priority_level integer DEFAULT 1,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.project_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role character varying DEFAULT 'member'::character varying,
  joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT project_members_pkey PRIMARY KEY (id),
  CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  course_id uuid,
  creator_id uuid NOT NULL,
  status USER-DEFINED DEFAULT 'not_started'::project_status,
  due_date timestamp without time zone,
  start_date timestamp without time zone,
  progress_percentage integer DEFAULT 0,
  team_size integer DEFAULT 1,
  is_group_project boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT projects_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id)
);
CREATE TABLE public.quick_access_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type character varying NOT NULL,
  item_id uuid NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT quick_access_items_pkey PRIMARY KEY (id),
  CONSTRAINT quick_access_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.resource_downloads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL,
  user_id uuid NOT NULL,
  downloaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT resource_downloads_pkey PRIMARY KEY (id),
  CONSTRAINT resource_downloads_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id),
  CONSTRAINT resource_downloads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  file_url text,
  file_name character varying,
  file_size bigint,
  file_type character varying,
  resource_type USER-DEFINED NOT NULL,
  course_id uuid,
  uploaded_by uuid,
  download_count integer DEFAULT 0,
  is_external boolean DEFAULT false,
  external_url text,
  tags ARRAY,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT resources_pkey PRIMARY KEY (id),
  CONSTRAINT resources_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT resources_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id)
);
CREATE TABLE public.search_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  query text NOT NULL,
  search_type character varying,
  results_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT search_history_pkey PRIMARY KEY (id),
  CONSTRAINT search_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type character varying NOT NULL,
  related_type character varying,
  related_id uuid,
  metadata jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_activity_pkey PRIMARY KEY (id),
  CONSTRAINT user_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  theme character varying DEFAULT 'dark'::character varying,
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  language character varying DEFAULT 'en'::character varying,
  timezone character varying DEFAULT 'UTC'::character varying,
  dashboard_layout jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  navigation_preferences jsonb DEFAULT '{}'::jsonb,
  quick_access_config jsonb DEFAULT '{}'::jsonb,
  search_preferences jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  student_id character varying UNIQUE,
  password_hash character varying NOT NULL,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  role USER-DEFINED NOT NULL,
  avatar_url text,
  phone character varying,
  department_id uuid,
  year_of_study integer,
  is_active boolean DEFAULT true,
  last_login timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  bio text,
  gpa numeric,
  total_credits integer DEFAULT 0,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);