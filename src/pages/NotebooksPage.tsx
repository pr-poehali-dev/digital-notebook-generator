import { useState } from "react";
import Icon from "@/components/ui/icon";

interface NotebooksPageProps {
  onNavigate: (page: string) => void;
}

const notebooks = [
  { id: 1, title: "Алгебра 9 класс",      subject: "Математика", pages: 24, updated: "Сегодня",    emoji: "📐", color: "bg-brand-violet-lt" },
  { id: 2, title: "Конспект по истории",   subject: "История",    pages: 18, updated: "Вчера",      emoji: "📜", color: "bg-brand-coral-lt" },
  { id: 3, title: "Биология — клетка",     subject: "Биология",   pages: 12, updated: "3 дня назад",emoji: "🔬", color: "bg-brand-green-lt" },
  { id: 4, title: "Физика. Механика",      subject: "Физика",     pages: 30, updated: "Неделю назад",emoji: "⚡", color: "bg-brand-blue-lt" },
  { id: 5, title: "Химические реакции",    subject: "Химия",      pages: 8,  updated: "2 недели назад",emoji: "🧪", color: "bg-brand-yellow-lt" },
  { id: 6, title: "Литература. Пушкин",    subject: "Литература", pages: 15, updated: "Месяц назад", emoji: "📖", color: "bg-brand-coral-lt" },
];

const filterSubjects = ["Все", "Математика", "Физика", "Химия", "Биология", "История", "Литература"];

export default function NotebooksPage({ onNavigate }: NotebooksPageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Все");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = notebooks.filter((nb) => {
    const matchSearch = nb.title.toLowerCase().includes(search.toLowerCase()) || nb.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Все" || nb.subject === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-foreground">Мои тетради</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{notebooks.length} тетрадей</p>
        </div>
        <button
          onClick={() => onNavigate("constructor")}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Icon name="Plus" size={16} />
          Новая тетрадь
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск тетрадей..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {filterSubjects.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                filter === s
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-1 border border-border rounded-xl p-1 bg-white">
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          >
            <Icon name="LayoutGrid" size={15} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-lg transition-colors ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          >
            <Icon name="List" size={15} />
          </button>
        </div>
      </div>

      {/* Notebooks */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-heading font-bold text-lg text-foreground">Ничего не найдено</p>
          <p className="text-muted-foreground text-sm">Попробуйте другой запрос</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-3 gap-4 stagger">
          {filtered.map((nb) => (
            <div
              key={nb.id}
              className="notebook-card p-5 cursor-pointer group animate-fade-in"
              onClick={() => onNavigate("constructor")}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${nb.color}`}>
                <span className="text-2xl">{nb.emoji}</span>
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground mb-1 line-clamp-2">{nb.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{nb.subject} · {nb.pages} страниц</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon name="Clock" size={11} />
                  {nb.updated}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted" onClick={(e) => { e.stopPropagation(); onNavigate("export"); }}>
                    <Icon name="Download" size={13} className="text-muted-foreground" />
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-destructive/10" onClick={(e) => e.stopPropagation()}>
                    <Icon name="Trash2" size={13} className="text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2 stagger">
          {filtered.map((nb) => (
            <div
              key={nb.id}
              className="notebook-card px-5 py-4 cursor-pointer flex items-center gap-4 group animate-fade-in"
              onClick={() => onNavigate("constructor")}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${nb.color}`}>
                <span className="text-xl">{nb.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-sm text-foreground">{nb.title}</h3>
                <p className="text-xs text-muted-foreground">{nb.subject} · {nb.pages} страниц</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{nb.updated}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted" onClick={(e) => { e.stopPropagation(); onNavigate("export"); }}>
                  <Icon name="Download" size={13} className="text-muted-foreground" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-destructive/10" onClick={(e) => e.stopPropagation()}>
                  <Icon name="Trash2" size={13} className="text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
