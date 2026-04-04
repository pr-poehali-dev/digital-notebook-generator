import { useState } from "react";
import Icon from "@/components/ui/icon";

const achievements = [
  { emoji: "🚀", label: "Первая тетрадь",    done: true },
  { emoji: "📚", label: "5 тетрадей",         done: true },
  { emoji: "⭐", label: "Использовал шаблон", done: true },
  { emoji: "📤", label: "Первый экспорт",     done: false },
  { emoji: "🔥", label: "7 дней подряд",      done: false },
  { emoji: "🏆", label: "20 тетрадей",        done: false },
];

export default function ProfilePage() {
  const [name, setName] = useState("Алексей Иванов");
  const [email] = useState("alex@example.com");
  const [editingName, setEditingName] = useState(false);
  const [tmpName, setTmpName] = useState(name);

  const saveName = () => {
    setName(tmpName);
    setEditingName(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-extrabold text-foreground">Профиль</h1>
      </div>

      {/* Avatar + info */}
      <div className="notebook-card p-6 mb-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-brand-coral flex items-center justify-center text-3xl shrink-0 shadow-md">
          🎓
        </div>
        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center gap-2 mb-1">
              <input
                autoFocus
                value={tmpName}
                onChange={(e) => setTmpName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                className="font-heading font-extrabold text-xl text-foreground border-b-2 border-primary outline-none bg-transparent"
              />
              <button onClick={saveName} className="text-primary hover:text-primary/80">
                <Icon name="Check" size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-heading font-extrabold text-xl text-foreground">{name}</h2>
              <button onClick={() => { setTmpName(name); setEditingName(true); }} className="text-muted-foreground hover:text-foreground">
                <Icon name="Pencil" size={14} />
              </button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">{email}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="tag-chip bg-brand-violet-lt text-primary text-[11px]">Ученик</span>
            <span className="tag-chip bg-brand-yellow-lt text-yellow-700 text-[11px]">⭐ Активный</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5 stagger">
        {[
          { value: "12", label: "Тетрадей",   color: "text-primary" },
          { value: "3",  label: "Шаблонов",   color: "text-brand-green" },
          { value: "5",  label: "Экспортов",  color: "text-brand-coral" },
        ].map((s) => (
          <div key={s.label} className="notebook-card p-4 text-center animate-fade-in">
            <p className={`font-heading font-extrabold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="notebook-card p-5 mb-5">
        <h2 className="font-heading font-bold text-base mb-4 text-foreground">Достижения</h2>
        <div className="grid grid-cols-3 gap-3 stagger">
          {achievements.map((a, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-center animate-fade-in ${
                a.done ? "bg-brand-violet-lt" : "bg-muted opacity-50"
              }`}
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-xs font-semibold text-foreground leading-tight">{a.label}</span>
              {a.done && <Icon name="CheckCircle2" size={12} className="text-primary" />}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="notebook-card p-5">
        <h2 className="font-heading font-bold text-base mb-3 text-foreground">Настройки</h2>
        <div className="space-y-1">
          {[
            { icon: "Bell",      label: "Уведомления" },
            { icon: "Lock",      label: "Безопасность" },
            { icon: "Palette",   label: "Внешний вид" },
            { icon: "LogOut",    label: "Выйти из аккаунта", danger: true },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.danger
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon name={item.icon} fallback="Circle" size={16} className={item.danger ? "text-destructive" : "text-muted-foreground"} />
              {item.label}
              {!item.danger && <Icon name="ChevronRight" size={14} className="ml-auto text-muted-foreground" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
