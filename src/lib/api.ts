import func2url from "../../backend/func2url.json";

const AUTH_URL      = func2url.auth;
const NOTEBOOKS_URL = func2url.notebooks;
const RESULTS_URL   = func2url.results;

function getToken(): string {
  return localStorage.getItem("nb_token") || "";
}

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { "Content-Type": "application/json", "X-Auth-Token": t } : { "Content-Type": "application/json" };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: "teacher" | "student";
}

export async function apiRegister(email: string, password: string, name: string, role: "teacher" | "student"): Promise<{ token: string; user: User }> {
  const r = await fetch(`${AUTH_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, role }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Ошибка регистрации");
  return data;
}

export async function apiLogin(email: string, password: string): Promise<{ token: string; user: User }> {
  const r = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Ошибка входа");
  return data;
}

export async function apiMe(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  const r = await fetch(`${AUTH_URL}/me`, { headers: authHeaders() });
  if (!r.ok) return null;
  const data = await r.json();
  return data.user;
}

export async function apiLogout(): Promise<void> {
  await fetch(`${AUTH_URL}/logout`, { method: "POST", headers: authHeaders() });
  localStorage.removeItem("nb_token");
}

// ─── Notebooks ───────────────────────────────────────────────────────────────

export async function apiSaveNotebook(notebook: object): Promise<void> {
  const r = await fetch(`${NOTEBOOKS_URL}/save`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ notebook }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Ошибка сохранения");
}

export async function apiGetNotebooks(): Promise<{ id: string; notebook: object; updated_at: string }[]> {
  const r = await fetch(NOTEBOOKS_URL, { headers: authHeaders() });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Ошибка загрузки");
  return data.notebooks;
}

export async function apiGetNotebook(id: string): Promise<object> {
  const r = await fetch(`${NOTEBOOKS_URL}/${id}`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Тетрадь не найдена");
  return data.notebook;
}

// ─── Results ─────────────────────────────────────────────────────────────────

export interface ResultRecord {
  id: string;
  student_name: string;
  student_class: string;
  earned_points: number;
  total_points: number;
  grade: number | null;
  attempt: number;
  teacher_comment: string | null;
  teacher_grade: number | null;
  started_at: string | null;
  finished_at: string | null;
}

export async function apiSaveResult(payload: {
  notebook_id: string;
  student_name: string;
  student_class: string;
  answers: object;
  checked: object;
  earned_points: number;
  total_points: number;
  grade: number | null;
}): Promise<{ id: string; attempt: number }> {
  const r = await fetch(`${RESULTS_URL}/save`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Ошибка сохранения результата");
  return data;
}

export async function apiGetResults(notebookId: string): Promise<ResultRecord[]> {
  const r = await fetch(`${RESULTS_URL}?notebook_id=${notebookId}`, { headers: authHeaders() });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Ошибка загрузки результатов");
  return data.results;
}

export async function apiUpdateResult(resultId: string, teacherGrade: number | null, teacherComment: string): Promise<void> {
  const r = await fetch(`${RESULTS_URL}/update`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ result_id: resultId, teacher_grade: teacherGrade, teacher_comment: teacherComment }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Ошибка обновления");
}
