import { useState } from "react";
import { Notebook } from "@/types/notebook";
import { createDemoNotebook } from "@/data/defaultNotebook";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";

interface Props {
  notebooks: Notebook[];
  onOpen:    (nb: Notebook, mode: "edit" | "student") => void;
  onCreate:  () => void;
  onDelete:  (id: string) => void;
}

const SUBJECT_COLORS: Record<string, string> = {
  "#7c3aed": "from-violet-500 to-purple-600",
  "#16a34a": "from-green-500 to-emerald-600",
  "#2563eb": "from-blue-500 to-indigo-600",
  "#d97706": "from-amber-400 to-orange-500",
  "#e11d48": "from-rose-500 to-pink-600",
  "#0891b2": "from-cyan-500 to-sky-600",
};

function gradientFor(color: string) {
  return SUBJECT_COLORS[color] ?? "from-violet-500 to-purple-600";
}

export default function DashboardPage({ notebooks, onOpen, onCreate, onDelete }: Props) {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = notebooks.filter(
    (nb) =>
      nb.cover.subject.toLowerCase().includes(search.toLowerCase()) ||
      nb.cover.topic.toLowerCase().includes(search.toLowerCase()) ||
      nb.cover.authorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-lg">📓</div>
            <div>
              <h1 className="font-heading font-extrabold text-lg leading-none text-foreground">ЭлТетрадь</h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Конструктор электронных тетрадей</p>
            </div>
          </div>

          <div className="flex-1 relative max-w-sm">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск тетрадей..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold leading-none">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{user.role === "teacher" ? "Учитель" : "Ученик"}</p>
                </div>
                <button onClick={logout} title="Выйти"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Icon name="LogOut" size={15} />
                </button>
              </div>
            )}
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all active:scale-95"
            >
              <Icon name="Plus" size={16} />
              Создать тетрадь
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Тетрадей создано",  value: notebooks.length,                                  icon: "BookOpen",  color: "text-primary bg-brand-violet-lt" },
            { label: "Опубликовано",      value: notebooks.filter((n) => n.published).length,        icon: "Globe",     color: "text-brand-green bg-brand-green-lt" },
            { label: "Черновики",         value: notebooks.filter((n) => !n.published).length,       icon: "FileEdit",  color: "text-brand-coral bg-brand-coral-lt" },
            { label: "Предметов",         value: new Set(notebooks.map((n) => n.cover.subject)).size, icon: "LayoutGrid",color: "text-brand-blue bg-brand-blue-lt" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <Icon name={s.icon} fallback="Circle" size={18} />
              </div>
              <div>
                <p className="font-heading font-extrabold text-xl text-foreground leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-foreground">
            {search ? `Результаты поиска: ${filtered.length}` : "Мои тетради"}
          </h2>
        </div>

        {/* Notebooks grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-heading font-bold text-xl text-foreground mb-2">
              {search ? "Ничего не найдено" : "Тетрадей пока нет"}
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              {search ? "Попробуйте другой запрос" : "Создайте первую электронную тетрадь"}
            </p>
            {!search && (
              <button
                onClick={onCreate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-heading font-bold hover:bg-primary/90 transition-all"
              >
                <Icon name="Plus" size={18} />
                Создать тетрадь
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5 stagger">
            {filtered.map((nb) => (
              <div key={nb.id} className="group bg-white rounded-3xl border border-border shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 overflow-hidden animate-fade-in">
                {/* Color stripe */}
                <div className={`h-2 bg-gradient-to-r ${gradientFor(nb.cover.color)}`} />

                <div className="p-5">
                  {/* Subject + grade */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-heading font-bold px-2.5 py-0.5 rounded-full text-white"
                          style={{ background: nb.cover.color }}
                        >
                          {nb.cover.subject}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">{nb.cover.grade} класс</span>
                      </div>
                      <h3 className="font-heading font-bold text-base text-foreground leading-snug line-clamp-2">
                        {nb.cover.topic}
                      </h3>
                    </div>
                    {nb.published ? (
                      <span className="shrink-0 tag-chip bg-brand-green-lt text-brand-green text-[10px] ml-2">✓ Опубл.</span>
                    ) : (
                      <span className="shrink-0 tag-chip bg-muted text-muted-foreground text-[10px] ml-2">Черновик</span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Icon name="User" size={11} />
                      {nb.cover.authorName || "Без автора"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={11} />
                      {nb.cover.schoolYear}
                    </span>
                  </div>

                  {/* Blocks count */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Icon name="Layers" size={11} />
                    {nb.sections.reduce((a, s) => a + s.blocks.length, 0)} блоков ·{" "}
                    {nb.sections.filter((s) => s.blocks.length > 0).length} разделов заполнено
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpen(nb, "edit")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <Icon name="PenLine" size={13} />
                      Редактировать
                    </button>
                    <button
                      onClick={() => onOpen(nb, "student")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-green-lt text-brand-green text-xs font-semibold hover:bg-green-100 transition-colors"
                    >
                      <Icon name="Play" size={13} />
                      Открыть
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(nb.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-destructive/10 transition-colors"
                    >
                      <Icon name="Trash2" size={14} className="text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* New notebook card */}
            <button
              onClick={onCreate}
              className="group bg-white rounded-3xl border-2 border-dashed border-border hover:border-primary/40 p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:bg-brand-violet-lt/30 min-h-48 animate-fade-in"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Icon name="Plus" size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-heading font-bold text-sm text-muted-foreground group-hover:text-primary transition-colors">
                Новая тетрадь
              </p>
            </button>
          </div>
        )}
      </main>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-80 shadow-xl animate-scale-in">
            <div className="text-center mb-5">
              <p className="text-3xl mb-2">🗑️</p>
              <h3 className="font-heading font-bold text-lg">Удалить тетрадь?</h3>
              <p className="text-sm text-muted-foreground mt-1">Это действие нельзя отменить</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-border font-semibold text-sm"
              >
                Отмена
              </button>
              <button
                onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null); }}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-white font-semibold text-sm"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}