import { useState } from "react";
import { SectionId, BlockType } from "@/types/notebook";
import Icon from "@/components/ui/icon";

interface Props {
  sectionId: SectionId;
  onAdd: (type: BlockType) => void;
}

interface BlockOption {
  type: BlockType;
  label: string;
  desc: string;
  icon: string;
  color: string;
  sections?: SectionId[];
}

const ALL_BLOCKS: BlockOption[] = [
  { type: "text",        label: "Текстовый блок",         desc: "Опорный конспект, теория, пояснения",           icon: "FileText",    color: "#7c3aed" },
  { type: "video",       label: "Видеоурок",              desc: "Встроенное видео (YouTube, VK и др.)",           icon: "Play",        color: "#e11d48" },
  { type: "quiz-radio",  label: "Тест: один ответ",       desc: "Вопрос с одним правильным вариантом",            icon: "CircleDot",   color: "#2563eb" },
  { type: "quiz-multi",  label: "Тест: несколько ответов",desc: "Вопрос с несколькими правильными вариантами",    icon: "CheckSquare", color: "#0891b2" },
  { type: "quiz-match",  label: "Соответствие",           desc: "Задание на сопоставление пар",                   icon: "ArrowLeftRight",color:"#16a34a" },
  { type: "quiz-text",   label: "Текстовый ответ",        desc: "Поле для ввода краткого ответа",                 icon: "PenLine",     color: "#d97706" },
  { type: "glossary",    label: "Глоссарий",              desc: "Список ключевых терминов с определениями",       icon: "BookOpen",    color: "#0f766e" },
  { type: "task",        label: "Практическое задание",   desc: "Открытое задание с уровнем сложности",           icon: "Zap",         color: "#d97706" },
  { type: "reflection",  label: "Рефлексия",              desc: "Вопросы для самооценки и обратной связи",        icon: "Heart",       color: "#e11d48" },
  { type: "homework",    label: "Домашнее задание",       desc: "Список заданий из учебника со сроком сдачи",     icon: "House",       color: "#7c3aed" },
  { type: "timer",       label: "Таймер",                 desc: "Обратный отсчёт для контрольных заданий",        icon: "Timer",       color: "#0891b2" },
  { type: "file-upload", label: "Загрузка файла",         desc: "Поле для прикрепления фото/документа решения",   icon: "Upload",      color: "#16a34a" },
];

export default function AddBlockMenu({ onAdd }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="animate-fade-in">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-2xl text-sm font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-brand-violet-lt/20 transition-all"
        >
          <Icon name="Plus" size={18} />
          Добавить блок
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-lg p-5 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base">Выберите тип блока</h3>
            <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted">
              <Icon name="X" size={16} className="text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ALL_BLOCKS.map((b) => (
              <button
                key={b.type}
                onClick={() => { onAdd(b.type); setOpen(false); }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/40 text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center" style={{ background: b.color + "18" }}>
                  <Icon name={b.icon} fallback="Circle" size={16} style={{ color: b.color }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-foreground leading-snug">{b.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-1">{b.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
