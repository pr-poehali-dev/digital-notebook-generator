import Icon from "@/components/ui/icon";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const stats = [
  { value: "12", label: "тетрадей создано",   color: "bg-brand-violet-lt text-brand-violet" },
  { value: "3",  label: "шаблона сохранено",  color: "bg-brand-yellow-lt text-yellow-700" },
  { value: "5",  label: "экспортов за месяц", color: "bg-brand-green-lt text-brand-green" },
];

const recentNotebooks = [
  { title: "Алгебра 9 класс", subject: "Математика", updated: "Сегодня", color: "bg-brand-violet-lt", emoji: "📐" },
  { title: "Конспект по истории", subject: "История",    updated: "Вчера",   color: "bg-brand-coral-lt",  emoji: "📜" },
  { title: "Биология — клетка", subject: "Биология",   updated: "3 дня назад", color: "bg-brand-green-lt",  emoji: "🔬" },
];

const quickActions = [
  { label: "Новая тетрадь",  icon: "PenLine",    page: "constructor", bg: "bg-primary text-white hover:bg-primary/90" },
  { label: "Мои тетради",    icon: "BookOpen",   page: "notebooks",   bg: "bg-brand-blue-lt text-brand-blue hover:bg-blue-100" },
  { label: "Шаблоны",        icon: "LayoutGrid", page: "templates",   bg: "bg-brand-yellow-lt text-yellow-700 hover:bg-yellow-100" },
  { label: "Экспортировать", icon: "Download",   page: "export",      bg: "bg-brand-green-lt text-brand-green hover:bg-green-100" },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1">Привет! Готов к учёбе? 👋</p>
        <h1 className="font-heading text-3xl font-extrabold text-foreground">Добро пожаловать в Тетрадку</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 stagger">
        {stats.map((s) => (
          <div key={s.label} className="notebook-card p-5 animate-fade-in">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${s.color}`}>
              <span className="font-heading font-extrabold text-lg">{s.value}</span>
            </div>
            <p className="text-foreground font-semibold text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="font-heading font-bold text-lg mb-3 text-foreground">Быстрые действия</h2>
        <div className="grid grid-cols-4 gap-3 stagger">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => onNavigate(a.page)}
              className={`animate-fade-in flex flex-col items-center gap-2 py-4 px-3 rounded-2xl font-semibold text-sm transition-all duration-150 active:scale-95 hover:-translate-y-0.5 ${a.bg}`}
            >
              <Icon name={a.icon} fallback="Circle" size={22} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent notebooks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-lg text-foreground">Недавние тетради</h2>
          <button
            onClick={() => onNavigate("notebooks")}
            className="text-primary text-sm font-semibold hover:underline"
          >
            Все тетради →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 stagger">
          {recentNotebooks.map((nb) => (
            <div
              key={nb.title}
              className="notebook-card p-5 cursor-pointer animate-fade-in"
              onClick={() => onNavigate("constructor")}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${nb.color}`}>
                <span className="text-xl">{nb.emoji}</span>
              </div>
              <h3 className="font-heading font-bold text-sm text-foreground mb-0.5">{nb.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{nb.subject}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon name="Clock" size={12} />
                {nb.updated}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
