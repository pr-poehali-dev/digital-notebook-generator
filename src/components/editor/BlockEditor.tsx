import { useState } from "react";
import { NotebookBlock } from "@/types/notebook";
import Icon from "@/components/ui/icon";

interface Props {
  block:       NotebookBlock;
  isFirst:     boolean;
  isLast:      boolean;
  onChange:    (b: NotebookBlock) => void;
  onDelete:    () => void;
  onMoveUp:    () => void;
  onMoveDown:  () => void;
}

const BLOCK_LABELS: Record<NotebookBlock["type"], string> = {
  "text":        "Текстовый блок",
  "video":       "Видеоурок",
  "quiz-radio":  "Тест: один ответ",
  "quiz-multi":  "Тест: несколько ответов",
  "quiz-match":  "Соответствие",
  "quiz-text":   "Текстовый ответ",
  "glossary":    "Глоссарий",
  "task":        "Практическое задание",
  "reflection":  "Рефлексия",
  "homework":    "Домашнее задание",
  "timer":       "Таймер",
  "file-upload": "Загрузка файла",
};

const BLOCK_COLORS: Partial<Record<NotebookBlock["type"], string>> = {
  "text":        "#7c3aed",
  "video":       "#e11d48",
  "quiz-radio":  "#2563eb",
  "quiz-multi":  "#0891b2",
  "quiz-match":  "#16a34a",
  "quiz-text":   "#d97706",
  "glossary":    "#0f766e",
  "task":        "#d97706",
  "reflection":  "#e11d48",
  "homework":    "#7c3aed",
  "timer":       "#0891b2",
  "file-upload": "#16a34a",
};

export default function BlockEditor({ block, isFirst, isLast, onChange, onDelete, onMoveUp, onMoveDown }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const color = BLOCK_COLORS[block.type] ?? "#7c3aed";

  const set = <K extends keyof NotebookBlock>(k: K, v: NotebookBlock[K]) =>
    onChange({ ...block, [k]: v } as NotebookBlock);

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden animate-fade-in group">
      {/* Block header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "18" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        </div>
        <span className="text-xs font-semibold text-muted-foreground flex-1">{BLOCK_LABELS[block.type]}</span>

        {/* Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onMoveUp} disabled={isFirst} className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted disabled:opacity-30">
            <Icon name="ChevronUp" size={13} className="text-muted-foreground" />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted disabled:opacity-30">
            <Icon name="ChevronDown" size={13} className="text-muted-foreground" />
          </button>
          {deleteConfirm ? (
            <div className="flex items-center gap-1">
              <button onClick={onDelete} className="text-[10px] font-bold text-destructive hover:underline">Да</button>
              <span className="text-muted-foreground text-[10px]">/</span>
              <button onClick={() => setDeleteConfirm(false)} className="text-[10px] text-muted-foreground hover:underline">Нет</button>
            </div>
          ) : (
            <button onClick={() => setDeleteConfirm(true)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10">
              <Icon name="Trash2" size={13} className="text-destructive" />
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted ml-1">
            <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={13} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Block content */}
      {expanded && (
        <div className="p-4">
          {block.type === "text" && (
            <div className="space-y-3">
              <input value={block.title} onChange={(e) => set("title" as keyof NotebookBlock, e.target.value as never)}
                placeholder="Заголовок блока"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary" />
              <textarea value={block.content.replace(/<[^>]+>/g, "")}
                onChange={(e) => set("content" as keyof NotebookBlock, `<p>${e.target.value}</p>` as never)}
                placeholder="Содержимое блока..."
                rows={4}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
            </div>
          )}

          {block.type === "video" && (
            <div className="space-y-3">
              <input value={block.title} onChange={(e) => set("title" as keyof NotebookBlock, e.target.value as never)}
                placeholder="Заголовок видео"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary" />
              <input value={block.url} onChange={(e) => set("url" as keyof NotebookBlock, e.target.value as never)}
                placeholder="URL видео (YouTube embed: https://www.youtube.com/embed/...)"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono text-xs" />
              {block.url && (
                <div className="rounded-xl overflow-hidden aspect-video bg-muted">
                  <iframe src={block.url} className="w-full h-full" allowFullScreen title="video" />
                </div>
              )}
            </div>
          )}

          {(block.type === "quiz-radio" || block.type === "quiz-multi") && (
            <div className="space-y-3">
              <input
                value={block.question}
                onChange={(e) => set("question" as keyof NotebookBlock, e.target.value as never)}
                placeholder="Текст вопроса"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
              />
              <div className="space-y-2">
                {block.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type={block.type === "quiz-radio" ? "radio" : "checkbox"}
                      checked={block.type === "quiz-radio" ? block.correct === i : block.correct.includes(i)}
                      onChange={() => {
                        if (block.type === "quiz-radio") {
                          set("correct" as keyof NotebookBlock, i as never);
                        } else {
                          const prev = block.correct;
                          const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
                          set("correct" as keyof NotebookBlock, next as never);
                        }
                      }}
                      className="accent-primary shrink-0"
                    />
                    <input
                      value={opt}
                      onChange={(e) => {
                        const opts = [...block.options];
                        opts[i] = e.target.value;
                        set("options" as keyof NotebookBlock, opts as never);
                      }}
                      className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => {
                        const opts = block.options.filter((_, j) => j !== i);
                        set("options" as keyof NotebookBlock, opts as never);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10"
                    >
                      <Icon name="X" size={12} className="text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => set("options" as keyof NotebookBlock, [...block.options, `Вариант ${block.options.length + 1}`] as never)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Icon name="Plus" size={12} /> Добавить вариант
              </button>
              <p className="text-[10px] text-muted-foreground">Отметьте правильный(е) ответ(ы)</p>
            </div>
          )}

          {block.type === "quiz-match" && (
            <div className="space-y-3">
              <input value={block.question} onChange={(e) => set("question" as keyof NotebookBlock, e.target.value as never)}
                placeholder="Текст задания"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary" />
              <div className="space-y-2">
                {block.pairs.map((pair, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={pair.left}
                      onChange={(e) => {
                        const pairs = [...block.pairs];
                        pairs[i] = { ...pairs[i], left: e.target.value };
                        set("pairs" as keyof NotebookBlock, pairs as never);
                      }}
                      placeholder="Левая часть"
                      className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary" />
                    <Icon name="ArrowRight" size={14} className="text-muted-foreground shrink-0" />
                    <input value={pair.right}
                      onChange={(e) => {
                        const pairs = [...block.pairs];
                        pairs[i] = { ...pairs[i], right: e.target.value };
                        set("pairs" as keyof NotebookBlock, pairs as never);
                      }}
                      placeholder="Правая часть"
                      className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary" />
                    <button onClick={() => { const p = block.pairs.filter((_, j) => j !== i); set("pairs" as keyof NotebookBlock, p as never); }}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10">
                      <Icon name="X" size={12} className="text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => set("pairs" as keyof NotebookBlock, [...block.pairs, { left: "", right: "" }] as never)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                <Icon name="Plus" size={12} /> Добавить пару
              </button>
            </div>
          )}

          {block.type === "quiz-text" && (
            <div className="space-y-3">
              <input value={block.question} onChange={(e) => set("question" as keyof NotebookBlock, e.target.value as never)}
                placeholder="Текст вопроса"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary" />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Правильный ответ</label>
                  <input value={block.correctAnswer} onChange={(e) => set("correctAnswer" as keyof NotebookBlock, e.target.value as never)}
                    placeholder="Введите правильный ответ"
                    className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={block.caseSensitive}
                      onChange={(e) => set("caseSensitive" as keyof NotebookBlock, e.target.checked as never)}
                      className="accent-primary" />
                    Учитывать регистр
                  </label>
                </div>
              </div>
            </div>
          )}

          {block.type === "glossary" && (
            <div className="space-y-3">
              <input value={block.title} onChange={(e) => set("title" as keyof NotebookBlock, e.target.value as never)}
                placeholder="Заголовок глоссария"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary" />
              <div className="space-y-2">
                {block.terms.map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={t.term}
                      onChange={(e) => { const ts = [...block.terms]; ts[i] = { ...ts[i], term: e.target.value }; set("terms" as keyof NotebookBlock, ts as never); }}
                      placeholder="Термин" className="w-32 border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-primary" />
                    <input value={t.definition}
                      onChange={(e) => { const ts = [...block.terms]; ts[i] = { ...ts[i], definition: e.target.value }; set("terms" as keyof NotebookBlock, ts as never); }}
                      placeholder="Определение" className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary" />
                    <button onClick={() => { const ts = block.terms.filter((_, j) => j !== i); set("terms" as keyof NotebookBlock, ts as never); }}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10">
                      <Icon name="X" size={12} className="text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => set("terms" as keyof NotebookBlock, [...block.terms, { term: "", definition: "" }] as never)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                <Icon name="Plus" size={12} /> Добавить термин
              </button>
            </div>
          )}

          {block.type === "task" && (
            <div className="space-y-3">
              <input value={block.title} onChange={(e) => set("title" as keyof NotebookBlock, e.target.value as never)}
                placeholder="Название задания"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary" />
              <textarea value={block.description} onChange={(e) => set("description" as keyof NotebookBlock, e.target.value as never)}
                placeholder="Описание задания" rows={3}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
              <div className="flex gap-3 items-center">
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Сложность</label>
                  <select value={block.level} onChange={(e) => set("level" as keyof NotebookBlock, e.target.value as never)}
                    className="border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none">
                    <option value="easy">Лёгкое</option>
                    <option value="medium">Среднее</option>
                    <option value="hard">Сложное</option>
                  </select>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer mt-4">
                  <input type="checkbox" checked={block.allowFile} onChange={(e) => set("allowFile" as keyof NotebookBlock, e.target.checked as never)} className="accent-primary" />
                  Разрешить загрузку файла
                </label>
              </div>
            </div>
          )}

          {block.type === "reflection" && (
            <div className="space-y-3">
              <div className="space-y-2">
                {block.questions.map((q, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={q}
                      onChange={(e) => { const qs = [...block.questions]; qs[i] = e.target.value; set("questions" as keyof NotebookBlock, qs as never); }}
                      placeholder="Вопрос для рефлексии"
                      className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary" />
                    <button onClick={() => { const qs = block.questions.filter((_, j) => j !== i); set("questions" as keyof NotebookBlock, qs as never); }}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10">
                      <Icon name="X" size={12} className="text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => set("questions" as keyof NotebookBlock, [...block.questions, ""] as never)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                <Icon name="Plus" size={12} /> Добавить вопрос
              </button>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Максимум самооценки</label>
                <select value={block.selfRatingMax} onChange={(e) => set("selfRatingMax" as keyof NotebookBlock, Number(e.target.value) as never)}
                  className="border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none">
                  <option value={5}>1–5</option>
                  <option value={10}>1–10</option>
                </select>
              </div>
            </div>
          )}

          {block.type === "homework" && (
            <div className="space-y-3">
              <input value={block.title} onChange={(e) => set("title" as keyof NotebookBlock, e.target.value as never)}
                placeholder="Заголовок"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary" />
              <div className="space-y-2">
                {block.tasks.map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={t.text}
                      onChange={(e) => { const ts = [...block.tasks]; ts[i] = { ...ts[i], text: e.target.value }; set("tasks" as keyof NotebookBlock, ts as never); }}
                      placeholder="Описание задания" className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary" />
                    <input value={t.source}
                      onChange={(e) => { const ts = [...block.tasks]; ts[i] = { ...ts[i], source: e.target.value }; set("tasks" as keyof NotebookBlock, ts as never); }}
                      placeholder="§ / стр." className="w-24 border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary" />
                    <button onClick={() => { const ts = block.tasks.filter((_, j) => j !== i); set("tasks" as keyof NotebookBlock, ts as never); }}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-destructive/10">
                      <Icon name="X" size={12} className="text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => set("tasks" as keyof NotebookBlock, [...block.tasks, { text: "", source: "" }] as never)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                <Icon name="Plus" size={12} /> Добавить задание
              </button>
              <input value={block.dueDate ?? ""} onChange={(e) => set("dueDate" as keyof NotebookBlock, e.target.value as never)}
                placeholder="Срок сдачи (напр. «Следующий урок»)"
                className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary" />
            </div>
          )}

          {block.type === "timer" && (
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Подпись</label>
                <input value={block.label} onChange={(e) => set("label" as keyof NotebookBlock, e.target.value as never)}
                  className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1">Минут</label>
                <input type="number" min={1} max={120} value={Math.round(block.seconds / 60)}
                  onChange={(e) => set("seconds" as keyof NotebookBlock, (Number(e.target.value) * 60) as never)}
                  className="w-20 border border-border rounded-lg px-2.5 py-1.5 text-sm text-center focus:outline-none focus:border-primary" />
              </div>
            </div>
          )}

          {block.type === "file-upload" && (
            <div className="space-y-3">
              <input value={block.label} onChange={(e) => set("label" as keyof NotebookBlock, e.target.value as never)}
                placeholder="Подпись поля загрузки"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              <input value={block.acceptedTypes} onChange={(e) => set("acceptedTypes" as keyof NotebookBlock, e.target.value as never)}
                placeholder=".pdf,.jpg,.png,.docx"
                className="w-full border border-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
