import { useState } from "react";
import { questions, Question } from "@/data/questions";
import QuestionRadio from "@/components/QuestionRadio";
import QuestionDropdownMatch from "@/components/QuestionDropdownMatch";
import QuestionTextInput from "@/components/QuestionTextInput";
import ResultsScreen from "@/pages/ResultsScreen";
import Icon from "@/components/ui/icon";

interface SessionMeta {
  name: string;
  className: string;
  taskNumber: string;
}

interface Props {
  meta: SessionMeta;
  onRestart: () => void;
}

type Answers = Record<number, number | null | Record<string, string>>;

function isRadioCorrect(q: Extract<Question, { type: "radio" }>, ans: unknown): boolean {
  return typeof ans === "number" && ans === q.correct;
}

function isDropdownCorrect(q: Extract<Question, { type: "dropdown-match" }>, ans: unknown): boolean {
  if (typeof ans !== "object" || ans === null) return false;
  const a = ans as Record<string, string>;
  return q.items.every((item) => a[item.label] === item.correct);
}

function isTextCorrect(q: Extract<Question, { type: "text-input" }>, ans: unknown): boolean {
  if (typeof ans !== "object" || ans === null) return false;
  const a = ans as Record<string, string>;
  return q.fields.every((f) => (a[f.label] ?? "").trim().toLowerCase() === f.correct.toLowerCase());
}

function countCorrect(answers: Answers): number {
  return questions.reduce((acc, q) => {
    const ans = answers[q.id];
    if (q.type === "radio")            return acc + (isRadioCorrect(q, ans) ? 1 : 0);
    if (q.type === "dropdown-match")   return acc + (isDropdownCorrect(q, ans) ? 1 : 0);
    if (q.type === "text-input")       return acc + (isTextCorrect(q, ans) ? 1 : 0);
    return acc;
  }, 0);
}

export default function NotebookSession({ meta, onRestart }: Props) {
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState<Answers>({});
  const [checked, setChecked]   = useState<Record<number, boolean>>({});
  const [showResults, setShowResults] = useState(false);

  const q = questions[current];
  const isChecked = !!checked[q.id];
  const ans = answers[q.id];

  const setRadio = (idx: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
    setChecked((prev) => ({ ...prev, [q.id]: false }));
  };

  const setDropdown = (label: string, value: string) => {
    setAnswers((prev) => {
      const prev_ans = (typeof prev[q.id] === "object" && prev[q.id] !== null ? prev[q.id] : {}) as Record<string, string>;
      return { ...prev, [q.id]: { ...prev_ans, [label]: value } };
    });
    setChecked((prev) => ({ ...prev, [q.id]: false }));
  };

  const setTextField = (label: string, value: string) => {
    setAnswers((prev) => {
      const prev_ans = (typeof prev[q.id] === "object" && prev[q.id] !== null ? prev[q.id] : {}) as Record<string, string>;
      return { ...prev, [q.id]: { ...prev_ans, [label]: value } };
    });
    setChecked((prev) => ({ ...prev, [q.id]: false }));
  };

  const handleCheck = () => {
    setChecked((prev) => ({ ...prev, [q.id]: true }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  if (showResults) {
    const correct = countCorrect(answers);
    return (
      <ResultsScreen
        meta={meta}
        correct={correct}
        total={questions.length}
        onRestart={onRestart}
      />
    );
  }

  // Status bar counts
  const done   = Object.keys(checked).filter((k) => checked[Number(k)]).length;
  const errors = Object.keys(checked).filter((k) => {
    const id = Number(k);
    const qn = questions.find((x) => x.id === id)!;
    const a  = answers[id];
    if (qn.type === "radio")          return !isRadioCorrect(qn, a);
    if (qn.type === "dropdown-match") return !isDropdownCorrect(qn, a);
    if (qn.type === "text-input")     return !isTextCorrect(qn, a);
    return false;
  }).length;

  return (
    <div className="min-h-screen bg-[#f0f7f0] flex flex-col">
      {/* Top nav — tabs */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-1 py-1 overflow-x-auto">
            {questions.map((qn, i) => (
              <button
                key={qn.id}
                onClick={() => setCurrent(i)}
                className={`shrink-0 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  i === current
                    ? "bg-primary text-white"
                    : checked[qn.id]
                    ? "bg-green-100 text-green-700"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => setShowResults(true)}
              className="shrink-0 px-4 py-2 text-xs font-semibold bg-brand-yellow-lt text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-1"
            >
              <Icon name="BarChart3" size={13} />
              Итоги
            </button>
          </div>
        </div>
      </header>

      {/* Meta strip */}
      <div className="bg-white border-b border-border/50 py-1.5 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{meta.name}</span>
          <span>Класс: <strong>{meta.className}</strong></span>
          <span>Урок {meta.taskNumber}</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-red-500">ошибок: {errors}</span>
            <span className="text-green-600">выполнено: {done}</span>
            <span className="text-muted-foreground">пропущено: {questions.length - done}</span>
          </div>
        </div>
      </div>

      {/* Question area */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-border p-8 min-h-96 animate-fade-in" key={q.id}>
            {q.type === "radio" && (
              <QuestionRadio
                question={q}
                answer={typeof ans === "number" ? ans : null}
                checked={isChecked}
                onChange={setRadio}
              />
            )}
            {q.type === "dropdown-match" && (
              <QuestionDropdownMatch
                question={q}
                answers={(typeof ans === "object" && ans !== null ? ans : {}) as Record<string, string>}
                checked={isChecked}
                onChange={setDropdown}
              />
            )}
            {q.type === "text-input" && (
              <QuestionTextInput
                question={q}
                answers={(typeof ans === "object" && ans !== null ? ans : {}) as Record<string, string>}
                checked={isChecked}
                onChange={setTextField}
              />
            )}
          </div>
        </div>
      </main>

      {/* Bottom nav */}
      <footer className="bg-white border-t border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="px-6 py-2.5 rounded-xl border-2 border-border font-heading font-bold text-sm text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Назад
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">
              {current + 1} / {questions.length}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCheck}
              disabled={isChecked}
              className="px-6 py-2.5 rounded-xl border-2 border-[#888] font-heading font-bold text-sm text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Проверить
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl border-2 border-[#888] font-heading font-bold text-sm text-foreground hover:bg-muted disabled:opacity-40 transition-colors disabled:cursor-not-allowed"
            >
              {current === questions.length - 1 ? "Итоги →" : "Вперёд →"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
