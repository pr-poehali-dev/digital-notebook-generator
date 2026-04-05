import { useState, useEffect } from "react";
import { Notebook, NotebookBlock, SectionId } from "@/types/notebook";
import { StudentAnswers } from "@/types/notebook";
import Icon from "@/components/ui/icon";
import { exportNotebookHTML } from "@/lib/exportHTML";
import { apiSaveResult } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Props {
  notebook: Notebook;
  onBack:   () => void;
}

const SECTION_ICONS: Record<SectionId, string> = {
  "cover":          "BookMarked",
  "contents":       "List",
  "homework-check": "ClipboardCheck",
  "new-material":   "Lightbulb",
  "practice":       "Zap",
  "reflection":     "Heart",
  "homework":       "House",
  "results":        "BarChart3",
};

// ─── Тип «задание» для навигации ─────────────────────────────────────────────

interface TaskItem {
  blockId:   string;
  sectionId: SectionId;
  label:     string;     // «Задание 1», «Задание 2» …
  type:      NotebookBlock["type"];
  checked:   boolean;
  answered:  boolean;
}

// ─── Block renderer (student view) ──────────────────────────────────────────

function BlockView({
  block, answers, checked, onAnswer, onCheck,
}: {
  block:    NotebookBlock;
  answers:  StudentAnswers;
  checked:  Record<string, boolean>;
  onAnswer: (id: string, val: unknown) => void;
  onCheck:  (id: string) => void;
}) {
  const ans = answers[block.id];
  const isChecked = !!checked[block.id];

  if (block.type === "text") {
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-heading font-bold text-lg mb-3">{block.title}</h3>
        <div className="text-sm text-foreground leading-relaxed wysiwyg-content"
          dangerouslySetInnerHTML={{ __html: block.content }} />
      </div>
    );
  }

  if (block.type === "video") {
    return (
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="font-heading font-bold text-base mb-1">{block.title}</h3>
        {block.description && <p className="text-sm text-muted-foreground mb-3">{block.description}</p>}
        {block.url ? (
          <div className="rounded-xl overflow-hidden aspect-video bg-muted">
            <iframe src={block.url} className="w-full h-full" allowFullScreen title={block.title} />
          </div>
        ) : (
          <div className="h-32 bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-sm">
            Видео не добавлено
          </div>
        )}
      </div>
    );
  }

  if (block.type === "quiz-radio") {
    const selected = typeof ans === "number" ? ans : null;
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="font-heading font-semibold text-base mb-4">{block.question}</p>
        <div className="space-y-2 mb-4">
          {block.options.map((opt, i) => {
            const isSel = selected === i;
            const isRight = isChecked && i === block.correct;
            const isWrong = isChecked && isSel && i !== block.correct;
            return (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                isRight ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" :
                isSel ? "border-primary bg-brand-violet-lt" : "border-border hover:border-primary/30"
              }`}>
                <input type="radio" checked={isSel} disabled={isChecked}
                  onChange={() => onAnswer(block.id, i)} className="accent-primary" />
                <span className="text-sm flex-1">{opt}</span>
                {isRight && <Icon name="CheckCircle2" size={16} className="text-green-600" />}
                {isWrong && <Icon name="XCircle" size={16} className="text-red-500" />}
              </label>
            );
          })}
        </div>
        {isChecked && block.explanation && (
          <div className="bg-green-50 rounded-xl p-3 text-sm text-green-800 mb-3">
            💡 {block.explanation}
          </div>
        )}
        {!isChecked && (
          <button onClick={() => onCheck(block.id)} disabled={selected === null}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors">
            Проверить
          </button>
        )}
        {isChecked && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${selected === block.correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            <Icon name={selected === block.correct ? "CheckCircle2" : "XCircle"} size={13} />
            {selected === block.correct ? "Верно!" : "Неверно"}
          </div>
        )}
      </div>
    );
  }

  if (block.type === "quiz-multi") {
    const selected: number[] = Array.isArray(ans) ? (ans as number[]) : [];
    const allCorrect = isChecked && JSON.stringify([...selected].sort()) === JSON.stringify([...block.correct].sort());
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="font-heading font-semibold text-base mb-1">{block.question}</p>
        <p className="text-xs text-muted-foreground mb-4">Выберите все правильные варианты</p>
        <div className="space-y-2 mb-4">
          {block.options.map((opt, i) => {
            const isSel = selected.includes(i);
            const isRight = isChecked && block.correct.includes(i);
            const isWrong = isChecked && isSel && !block.correct.includes(i);
            return (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                isRight ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" :
                isSel ? "border-primary bg-brand-violet-lt" : "border-border hover:border-primary/30"
              }`}>
                <input type="checkbox" checked={isSel} disabled={isChecked}
                  onChange={() => {
                    const next = isSel ? selected.filter((x) => x !== i) : [...selected, i];
                    onAnswer(block.id, next);
                  }} className="accent-primary" />
                <span className="text-sm flex-1">{opt}</span>
              </label>
            );
          })}
        </div>
        {!isChecked ? (
          <button onClick={() => onCheck(block.id)} disabled={selected.length === 0}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors">
            Проверить
          </button>
        ) : (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${allCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            <Icon name={allCorrect ? "CheckCircle2" : "XCircle"} size={13} />
            {allCorrect ? "Верно!" : `Неверно. Правильно: ${block.correct.map(i => block.options[i]).join(", ")}`}
          </div>
        )}
      </div>
    );
  }

  if (block.type === "quiz-match") {
    const userPairs = (ans && typeof ans === "object") ? (ans as Record<string, string>) : {};
    const rights = block.pairs.map((p) => p.right);
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="font-heading font-semibold text-base mb-4">{block.question}</p>
        <div className="space-y-2 mb-4">
          {block.pairs.map((pair) => {
            const val = userPairs[pair.left] ?? "";
            const isRight = isChecked && val === pair.right;
            const isWrong = isChecked && val !== pair.right;
            return (
              <div key={pair.left} className="flex items-center gap-3">
                <span className="text-sm font-medium w-1/3 bg-muted rounded-lg px-3 py-2">{pair.left}</span>
                <Icon name="ArrowRight" size={14} className="text-muted-foreground shrink-0" />
                <select value={val} disabled={isChecked}
                  onChange={(e) => onAnswer(block.id, { ...userPairs, [pair.left]: e.target.value })}
                  className={`flex-1 border-2 rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors appearance-none ${
                    isRight ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border"
                  }`}>
                  <option value="">— выберите —</option>
                  {rights.map((r) => <option key={r}>{r}</option>)}
                </select>
                {isRight && <Icon name="Check" size={14} className="text-green-600 shrink-0" />}
                {isWrong && <Icon name="X" size={14} className="text-red-500 shrink-0" />}
              </div>
            );
          })}
        </div>
        {!isChecked ? (
          <button onClick={() => onCheck(block.id)}
            disabled={Object.keys(userPairs).length < block.pairs.length}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors">
            Проверить
          </button>
        ) : (
          <div className="text-xs text-muted-foreground mt-2 bg-muted rounded-xl p-3">
            <p className="font-semibold mb-1">Правильные ответы:</p>
            {block.pairs.map(p => <p key={p.left}>{p.left} → {p.right}</p>)}
          </div>
        )}
      </div>
    );
  }

  if (block.type === "quiz-text") {
    const val = typeof ans === "string" ? ans : "";
    const isRight = isChecked && (block.caseSensitive ? val === block.correctAnswer : val.toLowerCase() === block.correctAnswer.toLowerCase());
    const isWrong = isChecked && !isRight;
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="font-heading font-semibold text-base mb-3">{block.question}</p>
        <input value={val} disabled={isChecked}
          onChange={(e) => onAnswer(block.id, e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isChecked && val.trim() && onCheck(block.id)}
          placeholder="Введите ответ..."
          className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none transition-colors ${
            isRight ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-border focus:border-primary"
          }`} />
        {!isChecked ? (
          <button onClick={() => onCheck(block.id)} disabled={!val.trim()}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors">
            Проверить
          </button>
        ) : (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${isRight ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            <Icon name={isRight ? "CheckCircle2" : "XCircle"} size={13} />
            {isRight ? "Верно!" : `Правильный ответ: ${block.correctAnswer}`}
          </div>
        )}
      </div>
    );
  }

  if (block.type === "glossary") {
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
          <Icon name="BookOpen" size={16} className="text-primary" />
          {block.title}
        </h3>
        <div className="space-y-3">
          {block.terms.map((t) => (
            <div key={t.term} className="flex gap-3 pb-3 border-b border-border/50 last:border-0">
              <span className="font-heading font-bold text-sm text-primary w-32 shrink-0">{t.term}</span>
              <span className="text-sm text-foreground">{t.definition}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "task") {
    const levelColors: Record<string, string> = { easy: "bg-green-100 text-green-700", medium: "bg-yellow-100 text-yellow-700", hard: "bg-red-100 text-red-700" };
    const levelLabels: Record<string, string> = { easy: "Лёгкое", medium: "Среднее", hard: "Сложное" };
    const val = typeof ans === "string" ? ans : "";
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-heading font-bold text-base">{block.title}</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelColors[block.level]}`}>{levelLabels[block.level]}</span>
        </div>
        <p className="text-sm text-foreground mb-4">{block.description}</p>
        {block.allowText && (
          <textarea value={val} onChange={(e) => onAnswer(block.id, e.target.value)}
            placeholder="Запишите решение здесь..." rows={4}
            className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none" />
        )}
        {block.allowFile && (
          <div className="mt-3 border-2 border-dashed border-border rounded-xl p-4 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary/40 transition-colors">
            <Icon name="Upload" size={18} className="mx-auto mb-1" />
            Прикрепите файл с решением
          </div>
        )}
      </div>
    );
  }

  if (block.type === "reflection") {
    const stored = (ans && typeof ans === "object") ? (ans as Record<string, unknown>) : {};
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
          <Icon name="Heart" size={16} className="text-rose-500" />
          Рефлексия
        </h3>
        <div className="space-y-4">
          {block.questions.map((q) => (
            <div key={q}>
              <label className="block text-sm font-medium text-foreground mb-1.5">{q}</label>
              <textarea
                value={typeof stored[q] === "string" ? (stored[q] as string) : ""}
                onChange={(e) => onAnswer(block.id, { ...stored, [q]: e.target.value })}
                rows={2} placeholder="Ваш ответ..."
                className="w-full border-2 border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Самооценка: <span className="text-primary font-bold">{typeof stored["rating"] === "number" ? stored["rating"] : "—"}</span> / {block.selfRatingMax}
            </label>
            <div className="flex gap-1">
              {Array.from({ length: block.selfRatingMax }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => onAnswer(block.id, { ...stored, rating: n })}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                    (stored["rating"] as number) >= n ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-primary/20"
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "homework") {
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="House" size={16} className="text-primary" />
          <h3 className="font-heading font-bold text-base">{block.title}</h3>
          {block.dueDate && (
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="Clock" size={11} /> {block.dueDate}
            </span>
          )}
        </div>
        <div className="space-y-2 mb-4">
          {block.tasks.map((t, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <div>
                <p className="text-sm text-foreground">{t.text}</p>
                {t.source && <p className="text-xs text-muted-foreground mt-0.5">{t.source}</p>}
              </div>
            </div>
          ))}
        </div>
        {block.allowFile && (
          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary/40 transition-colors">
            <Icon name="Upload" size={18} className="mx-auto mb-1" />
            Прикрепите выполненное задание
          </div>
        )}
      </div>
    );
  }

  if (block.type === "timer") {
    return <TimerBlock label={block.label} seconds={block.seconds} />;
  }

  return null;
}

function TimerBlock({ label, seconds: initial }: { label: string; seconds: number }) {
  const [left, setLeft] = useState(initial);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) { setRunning(false); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-heading font-extrabold text-lg ${left === 0 ? "bg-red-500" : "bg-primary"}`}>
        {left === 0 ? "!" : `${mm}:${ss}`}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{left === 0 ? "Время вышло!" : "Отсчёт времени"}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setRunning(!running)} disabled={left === 0}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary text-white disabled:opacity-40 hover:bg-primary/90">
          {running ? "Пауза" : "Старт"}
        </button>
        <button onClick={() => { setLeft(initial); setRunning(false); }}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-border hover:bg-muted">
          Сброс
        </button>
      </div>
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

function ResultsView({ notebook, answers, checked, studentName, studentClass }: {
  notebook: Notebook;
  answers: StudentAnswers;
  checked: Record<string, boolean>;
  studentName: string;
  studentClass: string;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  let totalPoints = 0;
  let earnedPoints = 0;

  notebook.sections.forEach((s) => {
    s.blocks.forEach((b) => {
      if (b.type === "quiz-radio") {
        totalPoints += b.points;
        if (checked[b.id] && answers[b.id] === b.correct) earnedPoints += b.points;
      } else if (b.type === "quiz-multi") {
        totalPoints += b.points;
        const sel = answers[b.id];
        if (checked[b.id] && Array.isArray(sel) && JSON.stringify([...sel].sort()) === JSON.stringify([...b.correct].sort())) earnedPoints += b.points;
      } else if (b.type === "quiz-text") {
        totalPoints += b.points;
        const val = typeof answers[b.id] === "string" ? (answers[b.id] as string) : "";
        const ok = b.caseSensitive ? val === b.correctAnswer : val.toLowerCase() === b.correctAnswer.toLowerCase();
        if (checked[b.id] && ok) earnedPoints += b.points;
      } else if (b.type === "quiz-match") {
        totalPoints += b.points;
        const pairs = (answers[b.id] && typeof answers[b.id] === "object") ? (answers[b.id] as Record<string, string>) : {};
        if (checked[b.id] && b.pairs.every((p) => pairs[p.left] === p.right)) earnedPoints += b.points;
      }
    });
  });

  const pct   = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const grade = pct >= 90 ? 5 : pct >= 70 ? 4 : pct >= 50 ? 3 : 2;
  const gradeColors: Record<number, string> = { 5: "text-green-600", 4: "text-blue-600", 3: "text-yellow-600", 2: "text-red-600" };

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      await apiSaveResult({
        notebook_id: notebook.id,
        student_name: studentName,
        student_class: studentClass,
        answers,
        checked,
        earned_points: earnedPoints,
        total_points: totalPoints,
        grade,
      });
      setSaved(true);
      onSaved?.();
    } catch {
      // silent
    }
    setSaving(false);
  };

  // Автосохранение при первом показе результатов
  useEffect(() => {
    if (studentName && !saved) { handleSave(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-border p-8 text-center">
        <p className="text-5xl mb-3">{grade === 5 ? "🏆" : grade === 4 ? "⭐" : grade === 3 ? "📖" : "💪"}</p>
        <p className={`font-heading font-extrabold text-7xl mb-2 ${gradeColors[grade]}`}>{grade}</p>
        <p className="text-muted-foreground text-sm">Баллов: {earnedPoints} из {totalPoints} · {pct}%</p>
        <div className="h-3 bg-muted rounded-full mt-4 overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        {studentName && (
          <p className="text-xs text-muted-foreground mt-3">
            {saved ? (
              <span className="inline-flex items-center gap-1 text-green-600"><Icon name="CheckCircle2" size={12} /> Результат сохранён</span>
            ) : saving ? (
              <span className="inline-flex items-center gap-1"><Icon name="Loader2" size={12} className="animate-spin" /> Сохраняю...</span>
            ) : null}
          </p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-200">
          <p className="font-heading font-extrabold text-2xl text-green-700">{earnedPoints}</p>
          <p className="text-xs text-green-600 mt-0.5">верно (баллов)</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-200">
          <p className="font-heading font-extrabold text-2xl text-red-600">{totalPoints - earnedPoints}</p>
          <p className="text-xs text-red-500 mt-0.5">не зачтено</p>
        </div>
        <div className="bg-muted rounded-2xl p-4 text-center">
          <p className="font-heading font-extrabold text-2xl text-foreground">{totalPoints}</p>
          <p className="text-xs text-muted-foreground mt-0.5">всего баллов</p>
        </div>
      </div>
    </div>
  );
}

// ─── Start Screen (ввод имени ученика) ───────────────────────────────────────

function StartScreen({ notebook, onStart }: { notebook: Notebook; onStart: (name: string, cls: string) => void }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [cls,  setCls]  = useState("");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl p-8 text-white text-center mb-6 shadow-lg" style={{ background: `linear-gradient(135deg, ${notebook.cover.color}dd, ${notebook.cover.color})` }}>
          <p className="text-white/70 text-xs uppercase tracking-widest mb-2">Электронная тетрадь</p>
          <h1 className="font-heading font-extrabold text-3xl mb-1">{notebook.cover.subject}</h1>
          <p className="font-heading font-bold text-lg mb-3">{notebook.cover.grade} класс</p>
          <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 inline-block">
            <p className="text-sm font-semibold">{notebook.cover.topic}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
          <h2 className="font-heading font-bold text-lg mb-4 text-center">Представься, пожалуйста</h2>
          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Имя и фамилия</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                onKeyDown={(e) => e.key === "Enter" && name.trim() && onStart(name.trim(), cls.trim())}
                className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Класс <span className="text-muted-foreground font-normal">(необязательно)</span></label>
              <input value={cls} onChange={(e) => setCls(e.target.value)}
                placeholder="9А"
                onKeyDown={(e) => e.key === "Enter" && name.trim() && onStart(name.trim(), cls.trim())}
                className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <button onClick={() => onStart(name.trim(), cls.trim())} disabled={!name.trim()}
            className="w-full py-3 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            <Icon name="Play" size={16} /> Начать тетрадь
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main StudentView ─────────────────────────────────────────────────────────

const QUIZ_TYPES: NotebookBlock["type"][] = ["quiz-radio", "quiz-multi", "quiz-match", "quiz-text"];

export default function StudentView({ notebook, onBack }: Props) {
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<SectionId>("cover");
  const [answers,  setAnswers]  = useState<StudentAnswers>({});
  const [checked,  setChecked]  = useState<Record<string, boolean>>({});
  const [taskNav,  setTaskNav]  = useState(false);
  const [taskIdx,  setTaskIdx]  = useState(0);
  const [exportMenu, setExportMenu] = useState(false);

  const visibleSections = notebook.sections.filter(
    (s) => s.id === "cover" || s.id === "contents" || s.id === "results" || s.blocks.length > 0
  );
  const activeSection = notebook.sections.find((s) => s.id === activeSectionId)!;
  const activeIdx = visibleSections.findIndex((s) => s.id === activeSectionId);

  // Собираем все интерактивные задания из тетради
  const allTasks: TaskItem[] = [];
  let taskCounter = 0;
  notebook.sections.forEach((s) => {
    s.blocks.forEach((b) => {
      if (QUIZ_TYPES.includes(b.type) || b.type === "task") {
        taskCounter++;
        let label = `Задание ${taskCounter}`;
        if (b.type === "quiz-radio" || b.type === "quiz-multi" || b.type === "quiz-match" || b.type === "quiz-text") {
          label = `Вопрос ${taskCounter}`;
        }
        allTasks.push({
          blockId:  b.id,
          sectionId: s.id,
          label,
          type:     b.type,
          checked:  !!checked[b.id],
          answered: answers[b.id] !== undefined,
        });
      }
    });
  });

  const currentTask = allTasks[taskIdx];

  const onAnswer = (id: string, val: unknown) => setAnswers((prev) => ({ ...prev, [id]: val }));
  const onCheck  = (id: string) => setChecked((prev) => ({ ...prev, [id]: true }));

  const goToTask = (idx: number) => {
    const task = allTasks[idx];
    if (task) {
      setTaskIdx(idx);
      setActiveSectionId(task.sectionId);
      setTaskNav(true);
    }
  };

  const handleExportPDF = () => {
    setExportMenu(false);
    window.print();
  };

  const handleExportHTML = () => {
    setExportMenu(false);
    const html = exportNotebookHTML(notebook);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `${notebook.cover.subject}_${notebook.cover.grade}кл_${notebook.cover.topic}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Блок для режима задания
  const taskBlock = currentTask
    ? notebook.sections.flatMap((s) => s.blocks).find((b) => b.id === currentTask.blockId)
    : null;

  // Показываем стартовый экран
  if (!started) {
    return <StartScreen notebook={notebook} onStart={(n, c) => { setStudentName(n || user?.name || ""); setStudentClass(c); setStarted(true); }} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-border flex flex-col shrink-0">
        <div className="px-3 py-3 border-b border-border flex items-center gap-2">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ChevronLeft" size={14} /> Назад
          </button>
          <div className="ml-auto relative">
            <button
              onClick={() => setExportMenu(!exportMenu)}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Icon name="Download" size={13} /> Сохранить
            </button>
            {exportMenu && (
              <div className="absolute right-0 top-7 bg-white border border-border rounded-2xl shadow-xl z-50 py-1.5 w-44 animate-scale-in">
                <button onClick={handleExportPDF}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                  <Icon name="FileText" size={14} className="text-red-500" /> PDF
                </button>
                <button onClick={handleExportHTML}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                  <Icon name="Code" size={14} className="text-blue-500" /> HTML-файл
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cover mini */}
        <div className="px-3 py-3 border-b border-border">
          <div className="w-full rounded-xl p-2.5 text-white text-center" style={{ background: notebook.cover.color }}>
            <p className="font-heading font-extrabold text-xs">{notebook.cover.subject}</p>
            <p className="text-[10px] opacity-80 leading-snug">{notebook.cover.grade} кл. · {notebook.cover.topic}</p>
          </div>
          {studentName && (
            <p className="text-[11px] text-muted-foreground text-center mt-2 font-medium truncate">
              👤 {studentName}{studentClass ? ` · ${studentClass}` : ""}
            </p>
          )}
        </div>

        {/* Mode toggle */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex bg-muted rounded-xl p-0.5 text-xs">
            <button onClick={() => setTaskNav(false)}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${!taskNav ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>
              Разделы
            </button>
            <button onClick={() => { setTaskNav(true); setTaskIdx(0); }}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${taskNav ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>
              Задания
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-2 overflow-y-auto space-y-0.5">
          {!taskNav ? (
            // Раздельный вид
            visibleSections.map((s) => (
              <button key={s.id} onClick={() => setActiveSectionId(s.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-left transition-all ${
                  activeSectionId === s.id ? "bg-brand-violet-lt text-primary font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                <Icon name={SECTION_ICONS[s.id]} fallback="Circle" size={15} className={activeSectionId === s.id ? "text-primary" : ""} />
                <span className="text-xs flex-1 leading-snug">{s.title}</span>
              </button>
            ))
          ) : (
            // Режим заданий — все вопросы пронумерованы
            allTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-4 text-center">В тетради нет<br/>интерактивных заданий</p>
            ) : (
              allTasks.map((t, i) => (
                <button key={t.blockId} onClick={() => goToTask(i)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-left transition-all ${
                    taskNav && taskIdx === i ? "bg-brand-violet-lt text-primary font-semibold" : "text-muted-foreground hover:bg-muted"
                  }`}>
                  <span className={`w-6 h-6 rounded-lg text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                    t.checked ? "bg-green-100 text-green-700" : t.answered ? "bg-yellow-100 text-yellow-700" : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-xs flex-1 leading-snug truncate">{t.label}</span>
                  {t.checked && <Icon name="CheckCircle2" size={11} className="text-green-500 shrink-0" />}
                </button>
              ))
            )
          )}
        </nav>

        {/* Task progress */}
        {taskNav && allTasks.length > 0 && (
          <div className="px-3 py-3 border-t border-border">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Проверено</span>
              <span>{allTasks.filter(t => t.checked).length} / {allTasks.length}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(allTasks.filter(t => t.checked).length / allTasks.length) * 100}%` }} />
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-border px-6 py-3 flex items-center gap-3 shrink-0">
          {taskNav ? (
            <>
              <h2 className="font-heading font-bold text-base">
                {currentTask?.label ?? "Задания"}
              </h2>
              <span className="text-xs text-muted-foreground">
                {taskIdx + 1} из {allTasks.length}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button disabled={taskIdx === 0}
                  onClick={() => goToTask(taskIdx - 1)}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold disabled:opacity-40 hover:bg-muted">
                  ← Назад
                </button>
                {/* Jump to any task */}
                <div className="flex gap-1 flex-wrap max-w-xs">
                  {allTasks.map((t, i) => (
                    <button key={t.blockId} onClick={() => goToTask(i)}
                      title={t.label}
                      className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all ${
                        i === taskIdx ? "bg-primary text-white" :
                        t.checked ? "bg-green-100 text-green-700" :
                        t.answered ? "bg-yellow-100 text-yellow-700" :
                        "bg-muted text-muted-foreground hover:bg-primary/10"
                      }`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { if (taskIdx < allTasks.length - 1) { goToTask(taskIdx + 1); } else { setActiveSectionId("results"); setTaskNav(false); } }}
                  className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90">
                  {taskIdx === allTasks.length - 1 ? "Итоги →" : "Вперёд →"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-heading font-bold text-base">{activeSection.title}</h2>
              <div className="ml-auto flex items-center gap-2">
                <button disabled={activeIdx === 0}
                  onClick={() => setActiveSectionId(visibleSections[activeIdx - 1].id)}
                  className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold disabled:opacity-40 hover:bg-muted">
                  ← Назад
                </button>
                <button disabled={activeIdx === visibleSections.length - 1}
                  onClick={() => setActiveSectionId(visibleSections[activeIdx + 1].id)}
                  className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold disabled:opacity-40 hover:bg-primary/90">
                  Вперёд →
                </button>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-3xl mx-auto py-8 px-4 space-y-4 animate-fade-in" key={taskNav ? `task-${taskIdx}` : activeSectionId}>
            {taskNav ? (
              // Показываем одно задание
              taskBlock ? (
                <BlockView block={taskBlock} answers={answers} checked={checked} onAnswer={onAnswer} onCheck={onCheck} />
              ) : (
                <div className="text-center py-20 text-muted-foreground">Задание не найдено</div>
              )
            ) : (
              // Полный вид раздела
              <>
                {activeSectionId === "cover" && (
                  <div className="rounded-3xl p-10 text-white text-center shadow-lg" style={{ background: `linear-gradient(135deg, ${notebook.cover.color}dd, ${notebook.cover.color})` }}>
                    <p className="text-white/70 text-xs uppercase tracking-widest mb-2">Электронная тетрадь</p>
                    <h1 className="font-heading font-extrabold text-5xl mb-2">{notebook.cover.subject}</h1>
                    <p className="font-heading font-bold text-2xl mb-4">{notebook.cover.grade} класс</p>
                    <div className="bg-white/20 backdrop-blur rounded-2xl px-6 py-3 inline-block mb-4">
                      <p className="font-semibold">{notebook.cover.topic}</p>
                    </div>
                    <div className="flex items-center justify-center gap-6 text-sm text-white/70">
                      <span>{notebook.cover.authorName}</span>
                      <span>·</span>
                      <span>{notebook.cover.schoolYear}</span>
                    </div>
                  </div>
                )}
                {activeSectionId === "contents" && (
                  <div className="bg-white rounded-2xl border border-border p-6">
                    <h3 className="font-heading font-bold text-lg mb-4">Содержание</h3>
                    {visibleSections.filter((s) => s.id !== "cover" && s.id !== "contents").map((s, i) => (
                      <button key={s.id} onClick={() => setActiveSectionId(s.id)}
                        className="w-full flex items-center gap-3 py-3 border-b border-border/50 hover:bg-muted/30 rounded-lg px-2 transition-colors">
                        <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                        <Icon name={SECTION_ICONS[s.id]} fallback="Circle" size={14} style={{ color: s.color }} />
                        <span className="flex-1 text-sm font-medium text-left">{s.title}</span>
                        <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
                {activeSectionId === "results" && (
                  <ResultsView notebook={notebook} answers={answers} checked={checked} studentName={studentName} studentClass={studentClass} />
                )}
                {activeSectionId !== "cover" && activeSectionId !== "contents" && activeSectionId !== "results" &&
                  activeSection.blocks.map((block) => (
                    <BlockView key={block.id} block={block} answers={answers} checked={checked} onAnswer={onAnswer} onCheck={onCheck} />
                  ))
                }
              </>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close export menu */}
      {exportMenu && <div className="fixed inset-0 z-40" onClick={() => setExportMenu(false)} />}
    </div>
  );
}