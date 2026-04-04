import { useState } from "react";
import Icon from "@/components/ui/icon";

interface TemplatesPageProps {
  onNavigate: (page: string) => void;
}

const templates = [
  { id: 1, title: "Конспект лекции",       subject: "Универсальный", emoji: "📋", desc: "Структура для записи лекции: тема, план, тезисы",   color: "bg-brand-violet-lt", popular: true },
  { id: 2, title: "Решение задач",          subject: "Математика",    emoji: "🔢", desc: "Условие, решение, ответ — удобная разметка",        color: "bg-brand-blue-lt",   popular: true },
  { id: 3, title: "Лабораторная работа",   subject: "Наука",         emoji: "🧪", desc: "Цель, гипотеза, ход работы, вывод",                 color: "bg-brand-green-lt",  popular: false },
  { id: 4, title: "Глоссарий терминов",    subject: "Любой предмет", emoji: "📖", desc: "Словарь терминов с определениями и примерами",      color: "bg-brand-yellow-lt", popular: false },
  { id: 5, title: "Шпаргалка",            subject: "Универсальный", emoji: "⚡", desc: "Компактный формат для ключевых фактов и формул",    color: "bg-brand-coral-lt",  popular: true },
  { id: 6, title: "Анализ текста",         subject: "Литература",    emoji: "✍️", desc: "Структура разбора литературного произведения",      color: "bg-brand-violet-lt", popular: false },
  { id: 7, title: "Хронология событий",    subject: "История",       emoji: "📅", desc: "Временная шкала с датами и описаниями",             color: "bg-brand-blue-lt",   popular: false },
  { id: 8, title: "Сравнительная таблица", subject: "Любой предмет", emoji: "📊", desc: "Таблица для сравнения объектов, явлений или теорий", color: "bg-brand-green-lt",  popular: false },
];

const categories = ["Все", "Популярные", "Математика", "Наука", "История", "Литература", "Универсальный"];

export default function TemplatesPage({ onNavigate }: TemplatesPageProps) {
  const [cat, setCat] = useState("Все");
  const [search, setSearch] = useState("");

  const filtered = templates.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "Все" || (cat === "Популярные" ? t.popular : t.subject === cat || t.subject === "Любой предмет");
    return matchSearch && matchCat;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-extrabold text-foreground">Шаблоны</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Готовые структуры для любых учебных задач</p>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск шаблонов..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                cat === c
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-4 stagger">
        {filtered.map((t) => (
          <div key={t.id} className="notebook-card p-5 cursor-pointer group animate-fade-in relative">
            {t.popular && (
              <span className="absolute top-3 right-3 tag-chip bg-brand-yellow-lt text-yellow-700 text-[10px]">
                ⭐ Популярный
              </span>
            )}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${t.color}`}>
              <span className="text-2xl">{t.emoji}</span>
            </div>
            <h3 className="font-heading font-bold text-sm text-foreground mb-1">{t.title}</h3>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{t.desc}</p>
            <div className="flex items-center justify-between">
              <span className="tag-chip bg-muted text-muted-foreground">{t.subject}</span>
              <button
                onClick={() => onNavigate("constructor")}
                className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
              >
                Использовать
                <Icon name="ArrowRight" size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
