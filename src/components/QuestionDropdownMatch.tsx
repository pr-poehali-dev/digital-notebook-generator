import { DropdownMatchQuestion } from "@/data/questions";

interface Props {
  question: DropdownMatchQuestion;
  answers: Record<string, string>;
  checked: boolean;
  onChange: (label: string, value: string) => void;
}

export default function QuestionDropdownMatch({ question, answers, checked, onChange }: Props) {
  return (
    <div>
      <h2 className="font-heading font-bold text-xl text-foreground mb-6 leading-snug">
        {question.text}
      </h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {question.items.map((item) => {
          const val       = answers[item.label] ?? "";
          const isCorrect = checked && val === item.correct;
          const isWrong   = checked && val !== "" && val !== item.correct;
          const isEmpty   = checked && val === "";

          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground w-40 shrink-0">{item.label}</span>
              <div className="flex-1 relative">
                <select
                  value={val}
                  disabled={checked}
                  onChange={(e) => onChange(item.label, e.target.value)}
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm font-medium appearance-none focus:outline-none transition-colors pr-8 ${
                    isCorrect ? "border-green-500 bg-green-50 text-green-800" :
                    isWrong   ? "border-red-400 bg-red-50 text-red-700" :
                    isEmpty   ? "border-orange-300 bg-orange-50" :
                    "border-border bg-[#fffde7] hover:border-primary/50"
                  }`}
                >
                  <option value="" disabled></option>
                  {question.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▼</span>
                {isCorrect && <span className="absolute -right-5 top-1/2 -translate-y-1/2 text-green-600 text-sm">✓</span>}
                {isWrong   && <span className="absolute -right-5 top-1/2 -translate-y-1/2 text-red-500 text-sm">✗</span>}
              </div>
            </div>
          );
        })}
      </div>
      {checked && (
        <div className="mt-4 p-3 bg-muted rounded-xl">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Правильные ответы:</p>
          <div className="grid grid-cols-2 gap-1">
            {question.items.map((item) => (
              <p key={item.label} className="text-xs text-foreground">
                <span className="font-medium">{item.label}:</span> {item.correct}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
