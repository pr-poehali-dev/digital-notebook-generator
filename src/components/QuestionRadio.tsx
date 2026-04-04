import { RadioQuestion } from "@/data/questions";

interface Props {
  question: RadioQuestion;
  answer: number | null;
  checked: boolean;
  onChange: (idx: number) => void;
}

export default function QuestionRadio({ question, answer, checked, onChange }: Props) {
  return (
    <div>
      <h2 className="font-heading font-bold text-xl text-foreground mb-6 leading-snug">
        {question.text}
      </h2>
      <div className="space-y-3">
        {question.options.map((opt, i) => {
          const isSelected = answer === i;
          const isCorrect  = checked && i === question.correct;
          const isWrong    = checked && isSelected && i !== question.correct;

          return (
            <label
              key={i}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 ${
                isCorrect ? "border-green-500 bg-green-50" :
                isWrong   ? "border-red-400 bg-red-50" :
                isSelected ? "border-primary bg-brand-violet-lt" :
                "border-border bg-white hover:border-primary/40 hover:bg-muted/40"
              }`}
            >
              <input
                type="radio"
                name={`q${question.id}`}
                checked={isSelected}
                onChange={() => !checked && onChange(i)}
                disabled={checked}
                className="mt-0.5 accent-primary shrink-0 w-4 h-4"
              />
              <span className={`text-sm leading-relaxed ${
                isCorrect ? "text-green-800 font-semibold" :
                isWrong   ? "text-red-700" :
                "text-foreground"
              }`}>
                {opt}
              </span>
              {isCorrect && <span className="ml-auto text-green-600 shrink-0">✓</span>}
              {isWrong   && <span className="ml-auto text-red-500 shrink-0">✗</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}
