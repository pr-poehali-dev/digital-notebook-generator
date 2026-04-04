import { TextInputQuestion } from "@/data/questions";

interface Props {
  question: TextInputQuestion;
  answers: Record<string, string>;
  checked: boolean;
  onChange: (label: string, value: string) => void;
}

export default function QuestionTextInput({ question, answers, checked, onChange }: Props) {
  return (
    <div>
      <h2 className="font-heading font-bold text-xl text-foreground mb-6 leading-snug">
        {question.text}
      </h2>
      <div className="space-y-4">
        {question.fields.map((field) => {
          const val       = answers[field.label] ?? "";
          const isCorrect = checked && val.trim().toLowerCase() === field.correct.toLowerCase();
          const isWrong   = checked && val.trim().toLowerCase() !== field.correct.toLowerCase();

          return (
            <div key={field.label}>
              <label className="block text-sm font-semibold text-foreground mb-1.5">{field.label}</label>
              <input
                type="text"
                value={val}
                disabled={checked}
                onChange={(e) => onChange(field.label, e.target.value)}
                placeholder="Введите ответ..."
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-colors ${
                  isCorrect ? "border-green-500 bg-green-50 text-green-800" :
                  isWrong   ? "border-red-400 bg-red-50 text-red-700" :
                  "border-border bg-white focus:border-primary"
                }`}
              />
              {isWrong && (
                <p className="text-xs text-green-700 mt-1">
                  Правильный ответ: <strong>{field.correct}</strong>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
