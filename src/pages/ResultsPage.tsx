import { useState, useEffect } from "react";
import { Notebook } from "@/types/notebook";
import { ResultRecord, apiGetResults, apiUpdateResult } from "@/lib/api";
import Icon from "@/components/ui/icon";

interface Props {
  notebook: Notebook;
  onBack: () => void;
}

export default function ResultsPage({ notebook, onBack }: Props) {
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editGrade, setEditGrade]     = useState<number | null>(null);
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    apiGetResults(notebook.id)
      .then(setResults)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [notebook.id]);

  const startEdit = (r: ResultRecord) => {
    setEditing(r.id);
    setEditGrade(r.teacher_grade ?? r.grade ?? null);
    setEditComment(r.teacher_comment ?? "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    await apiUpdateResult(editing, editGrade, editComment);
    setResults((prev) => prev.map((r) => r.id === editing ? { ...r, teacher_grade: editGrade, teacher_comment: editComment } : r));
    setEditing(null);
    setSaving(false);
  };

  const filtered = results.filter((r) =>
    !filter || r.student_name.toLowerCase().includes(filter.toLowerCase()) || (r.student_class || "").toLowerCase().includes(filter.toLowerCase())
  );

  // Статистика
  const total = results.length;
  const avgPct = total > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.total_points > 0 ? (r.earned_points / r.total_points) * 100 : 0), 0) / total)
    : 0;
  const grade5 = results.filter((r) => (r.teacher_grade ?? r.grade) === 5).length;
  const grade4 = results.filter((r) => (r.teacher_grade ?? r.grade) === 4).length;
  const grade3 = results.filter((r) => (r.teacher_grade ?? r.grade) === 3).length;
  const grade2 = results.filter((r) => (r.teacher_grade ?? r.grade) === 2).length;

  const gradeColor = (g: number | null) => {
    if (!g) return "bg-muted text-muted-foreground";
    if (g === 5) return "bg-green-100 text-green-700";
    if (g === 4) return "bg-blue-100 text-blue-700";
    if (g === 3) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="ChevronLeft" size={16} /> Назад
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-extrabold text-lg truncate">{notebook.cover.subject} — {notebook.cover.topic}</h1>
          <p className="text-xs text-muted-foreground">{notebook.cover.grade} класс · Результаты учеников</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats summary */}
        {total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-2xl border border-border p-4 text-center">
              <p className="font-heading font-extrabold text-3xl text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground mt-0.5">прохождений</p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-4 text-center">
              <p className="font-heading font-extrabold text-3xl text-primary">{avgPct}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">средний балл</p>
            </div>
            <div className="bg-green-50 rounded-2xl border border-green-200 p-4 text-center">
              <p className="font-heading font-extrabold text-3xl text-green-700">{grade5}</p>
              <p className="text-xs text-green-600 mt-0.5">оценок «5»</p>
            </div>
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 text-center">
              <p className="font-heading font-extrabold text-3xl text-blue-700">{grade4}</p>
              <p className="text-xs text-blue-600 mt-0.5">оценок «4»</p>
            </div>
            <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-4 text-center">
              <p className="font-heading font-extrabold text-3xl text-yellow-700">{grade3 + grade2}</p>
              <p className="text-xs text-yellow-600 mt-0.5">оценок «3» и «2»</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={filter} onChange={(e) => setFilter(e.target.value)}
              placeholder="Найти ученика..."
              className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
          </div>
          <p className="text-sm text-muted-foreground">{filtered.length} записей</p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="Loader2" size={28} className="animate-spin mx-auto mb-2" />
            Загружаю результаты...
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-border">
            <p className="text-5xl mb-3">📭</p>
            <p className="font-heading font-bold text-xl mb-2">Пока нет результатов</p>
            <p className="text-muted-foreground text-sm">Ученики ещё не проходили эту тетрадь</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Ученик</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Класс</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Попытка</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Баллы</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Авто</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Оценка учителя</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Комментарий</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Дата</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm">{r.student_name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.student_class || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-lg font-semibold">#{r.attempt}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold">
                      {r.earned_points}/{r.total_points}
                      {r.total_points > 0 && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({Math.round((r.earned_points / r.total_points) * 100)}%)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-extrabold px-2 py-0.5 rounded-lg ${gradeColor(r.grade)}`}>
                        {r.grade ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editing === r.id ? (
                        <div className="flex items-center gap-1 justify-center">
                          {[2, 3, 4, 5].map((g) => (
                            <button key={g} onClick={() => setEditGrade(editGrade === g ? null : g)}
                              className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${editGrade === g ? "bg-primary text-white" : "bg-muted hover:bg-primary/10"}`}>
                              {g}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className={`text-sm font-extrabold px-2 py-0.5 rounded-lg ${gradeColor(r.teacher_grade)}`}>
                          {r.teacher_grade ?? "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editing === r.id ? (
                        <input value={editComment} onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Комментарий..."
                          className="w-full border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary" />
                      ) : (
                        <span className="text-xs text-muted-foreground">{r.teacher_comment || "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground whitespace-nowrap">
                      {r.finished_at ? new Date(r.finished_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editing === r.id ? (
                        <div className="flex gap-1">
                          <button onClick={saveEdit} disabled={saving}
                            className="px-2 py-1 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-40">
                            {saving ? "..." : "✓"}
                          </button>
                          <button onClick={() => setEditing(null)}
                            className="px-2 py-1 border border-border rounded-lg text-xs hover:bg-muted">
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(r)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Icon name="Pencil" size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
