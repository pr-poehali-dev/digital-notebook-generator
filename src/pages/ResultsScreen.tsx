import Icon from "@/components/ui/icon";

interface Props {
  meta: { name: string; className: string; taskNumber: string };
  correct: number;
  total: number;
  onRestart: () => void;
}

function getGrade(correct: number, total: number): { grade: number; label: string; color: string; bg: string } {
  const pct = correct / total;
  if (pct >= 0.9) return { grade: 5, label: "Отлично!",          color: "text-green-700",  bg: "bg-green-50 border-green-300" };
  if (pct >= 0.7) return { grade: 4, label: "Хорошо!",           color: "text-blue-700",   bg: "bg-blue-50 border-blue-300" };
  if (pct >= 0.5) return { grade: 3, label: "Удовлетворительно", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-300" };
  return              { grade: 2, label: "Нужно повторить",    color: "text-red-700",    bg: "bg-red-50 border-red-300" };
}

const gradeEmoji: Record<number, string> = { 5: "🏆", 4: "⭐", 3: "📖", 2: "💪" };

export default function ResultsScreen({ meta, correct, total, onRestart }: Props) {
  const wrong = total - correct;
  const pct   = Math.round((correct / total) * 100);
  const { grade, label, color, bg } = getGrade(correct, total);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a6b2e] via-[#2d8a40] to-[#1a6b2e] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{gradeEmoji[grade]}</div>
          <h1 className="font-heading font-extrabold text-2xl text-foreground mb-1">Результаты</h1>
          <p className="text-muted-foreground text-sm">{meta.name} · {meta.className} · Урок {meta.taskNumber}</p>
        </div>

        {/* Grade card */}
        <div className={`rounded-2xl border-2 p-6 text-center mb-6 ${bg}`}>
          <p className="text-7xl font-heading font-black mb-1" style={{ color: grade === 5 ? "#16a34a" : grade === 4 ? "#1d4ed8" : grade === 3 ? "#a16207" : "#dc2626" }}>
            {grade}
          </p>
          <p className={`font-heading font-bold text-lg ${color}`}>{label}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-2xl">
            <p className="font-heading font-extrabold text-2xl text-green-700">{correct}</p>
            <p className="text-xs text-green-600 font-semibold mt-0.5">верно</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-2xl">
            <p className="font-heading font-extrabold text-2xl text-red-600">{wrong}</p>
            <p className="text-xs text-red-500 font-semibold mt-0.5">ошибок</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-2xl">
            <p className="font-heading font-extrabold text-2xl text-foreground">{pct}%</p>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">результат</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Выполнено</span>
            <span>{correct} из {total}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: grade === 5 ? "#16a34a" : grade === 4 ? "#2563eb" : grade === 3 ? "#d97706" : "#dc2626"
              }}
            />
          </div>
        </div>

        {/* Grading scale */}
        <div className="bg-muted rounded-2xl p-4 mb-6 text-xs space-y-1">
          <p className="font-semibold text-foreground mb-2">Шкала оценок:</p>
          {[
            { grade: 5, label: "Отлично",           range: "90–100%" },
            { grade: 4, label: "Хорошо",            range: "70–89%" },
            { grade: 3, label: "Удовлетворительно", range: "50–69%" },
            { grade: 2, label: "Неудовлетворительно",range: "0–49%" },
          ].map((g) => (
            <div key={g.grade} className={`flex justify-between ${g.grade === grade ? "font-bold text-foreground" : "text-muted-foreground"}`}>
              <span>{g.grade} — {g.label}</span>
              <span>{g.range}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-border font-heading font-bold text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Icon name="RotateCcw" size={16} />
            Начать заново
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-white font-heading font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            <Icon name="Printer" size={16} />
            Распечатать
          </button>
        </div>
      </div>
    </div>
  );
}
