CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS notebooks (
  id TEXT PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES users(id),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notebook_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id TEXT NOT NULL REFERENCES notebooks(id),
  student_id UUID REFERENCES users(id),
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL DEFAULT '',
  answers JSONB NOT NULL DEFAULT '{}',
  checked JSONB NOT NULL DEFAULT '{}',
  earned_points INT NOT NULL DEFAULT 0,
  total_points INT NOT NULL DEFAULT 0,
  grade INT,
  attempt INT NOT NULL DEFAULT 1,
  teacher_comment TEXT,
  teacher_grade INT,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notebook_results_notebook ON notebook_results(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_results_student ON notebook_results(student_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_teacher ON notebooks(teacher_id);
