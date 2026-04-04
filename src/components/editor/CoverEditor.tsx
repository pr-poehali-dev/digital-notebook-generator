import { NotebookCover } from "@/types/notebook";

interface Props {
  cover: NotebookCover;
  onChange: (cover: NotebookCover) => void;
}

const ACCENT_COLORS = [
  "#7c3aed", "#2563eb", "#16a34a", "#d97706",
  "#e11d48", "#0891b2", "#0f766e", "#9333ea",
];

const SUBJECTS = ["Физика", "Математика", "Химия", "Биология", "История", "Литература", "Русский язык", "Английский язык", "Обществознание", "География", "Информатика", "Другое"];
const GRADES   = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

export default function CoverEditor({ cover, onChange }: Props) {
  const set = <K extends keyof NotebookCover>(k: K, v: NotebookCover[K]) =>
    onChange({ ...cover, [k]: v });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Preview */}
      <div
        className="rounded-3xl p-8 text-white text-center shadow-lg relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${cover.color}dd, ${cover.color})` }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.15) 10px, rgba(255,255,255,.15) 11px)" }} />
        <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Электронная тетрадь</p>
        <h1 className="font-heading font-extrabold text-4xl mb-2">{cover.subject || "Предмет"}</h1>
        <p className="font-heading font-bold text-xl mb-4">{cover.grade ? `${cover.grade} класс` : "Класс"}</p>
        <div className="bg-white/20 backdrop-blur rounded-2xl px-6 py-3 inline-block">
          <p className="font-semibold text-sm">{cover.topic || "Тема / модуль"}</p>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/70">
          <span>{cover.authorName || "Автор"}</span>
          <span>·</span>
          <span>{cover.schoolYear}</span>
        </div>
      </div>

      {/* Fields */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-heading font-bold text-base">Данные тетради</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Предмет</label>
            <select
              value={cover.subject}
              onChange={(e) => set("subject", e.target.value)}
              className="w-full border-2 border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-background"
            >
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Класс</label>
            <select
              value={cover.grade}
              onChange={(e) => set("grade", e.target.value)}
              className="w-full border-2 border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-background"
            >
              {GRADES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Тема / модуль</label>
          <input
            value={cover.topic}
            onChange={(e) => set("topic", e.target.value)}
            placeholder="Название темы или модуля"
            className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">ФИО автора</label>
            <input
              value={cover.authorName}
              onChange={(e) => set("authorName", e.target.value)}
              placeholder="Иванова Мария Александровна"
              className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Учебный год</label>
            <input
              value={cover.schoolYear}
              onChange={(e) => set("schoolYear", e.target.value)}
              placeholder="2025–2026"
              className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2">Цвет оформления</label>
          <div className="flex gap-2 flex-wrap">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => set("color", c)}
                className="w-8 h-8 rounded-full border-4 transition-all"
                style={{
                  background: c,
                  borderColor: cover.color === c ? "white" : "transparent",
                  outline: cover.color === c ? `3px solid ${c}` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
