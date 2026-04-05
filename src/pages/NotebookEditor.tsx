import { useState } from "react";
import { Notebook, Section, SectionId, NotebookBlock } from "@/types/notebook";
import { nanoid } from "nanoid";
import Icon from "@/components/ui/icon";
import BlockEditor from "@/components/editor/BlockEditor";
import AddBlockMenu from "@/components/editor/AddBlockMenu";
import CoverEditor from "@/components/editor/CoverEditor";

interface Props {
  notebook: Notebook;
  onChange:  (nb: Notebook) => void;
  onBack:    () => void;
  onPreview: () => void;
  onResults?: () => void;
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

export default function NotebookEditor({ notebook, onChange, onBack, onPreview, onResults }: Props) {
  const [activeSection, setActiveSection] = useState<SectionId>("cover");
  const [saved, setSaved] = useState(false);

  const section = notebook.sections.find((s) => s.id === activeSection)!;

  const updateSection = (updated: Section) => {
    onChange({
      ...notebook,
      updatedAt: new Date().toISOString(),
      sections: notebook.sections.map((s) => (s.id === updated.id ? updated : s)),
    });
  };

  const addBlock = (type: NotebookBlock["type"]) => {
    const base = { id: nanoid(), type, section: activeSection } as NotebookBlock;
    let block: NotebookBlock;

    switch (type) {
      case "text":         block = { ...base, type: "text",        title: "Новый блок", content: "<p>Начните писать...</p>" } as NotebookBlock; break;
      case "video":        block = { ...base, type: "video",       title: "Видеоурок", url: "" } as NotebookBlock; break;
      case "quiz-radio":   block = { ...base, type: "quiz-radio",  question: "Вопрос?", options: ["Вариант 1", "Вариант 2", "Вариант 3"], correct: 0, points: 1 } as NotebookBlock; break;
      case "quiz-multi":   block = { ...base, type: "quiz-multi",  question: "Вопрос?", options: ["Вариант 1", "Вариант 2", "Вариант 3"], correct: [0], points: 2 } as NotebookBlock; break;
      case "quiz-match":   block = { ...base, type: "quiz-match",  question: "Установите соответствие:", pairs: [{ left: "А", right: "1" }, { left: "Б", right: "2" }], points: 2 } as NotebookBlock; break;
      case "quiz-text":    block = { ...base, type: "quiz-text",   question: "Вопрос?", correctAnswer: "", caseSensitive: false, points: 1 } as NotebookBlock; break;
      case "glossary":     block = { ...base, type: "glossary",    title: "Ключевые термины", terms: [{ term: "Термин", definition: "Определение" }] } as NotebookBlock; break;
      case "task":         block = { ...base, type: "task",        title: "Задание", description: "Описание задания", level: "medium", allowFile: false, allowText: true } as NotebookBlock; break;
      case "reflection":   block = { ...base, type: "reflection",  questions: ["Что нового я узнал?", "Какие трудности возникли?"], selfRatingMax: 5 } as NotebookBlock; break;
      case "homework":     block = { ...base, type: "homework",    title: "Домашнее задание", tasks: [{ text: "Задание из учебника", source: "" }], allowFile: true, allowLink: false } as NotebookBlock; break;
      case "timer":        block = { ...base, type: "timer",       label: "Таймер", seconds: 300 } as NotebookBlock; break;
      case "file-upload":  block = { ...base, type: "file-upload", label: "Загрузите файл с решением", acceptedTypes: ".pdf,.jpg,.png,.docx" } as NotebookBlock; break;
      default:             return;
    }

    updateSection({ ...section, blocks: [...section.blocks, block] });
  };

  const updateBlock = (updated: NotebookBlock) => {
    updateSection({
      ...section,
      blocks: section.blocks.map((b) => (b.id === updated.id ? updated : b)),
    });
  };

  const deleteBlock = (id: string) => {
    updateSection({ ...section, blocks: section.blocks.filter((b) => b.id !== id) });
  };

  const moveBlock = (id: string, dir: "up" | "down") => {
    const idx = section.blocks.findIndex((b) => b.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === section.blocks.length - 1) return;
    const blocks = [...section.blocks];
    const swap = dir === "up" ? idx - 1 : idx + 1;
    [blocks[idx], blocks[swap]] = [blocks[swap], blocks[idx]];
    updateSection({ ...section, blocks });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalBlocks = notebook.sections.reduce((a, s) => a + s.blocks.length, 0);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — sections */}
      <aside className="w-56 bg-white border-r border-border flex flex-col shrink-0">
        {/* Back */}
        <div className="px-3 py-4 border-b border-border">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
            <Icon name="ChevronLeft" size={16} />
            <span className="font-medium">Все тетради</span>
          </button>
        </div>

        {/* Cover info */}
        <div className="px-3 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: notebook.cover.color }}>
              {notebook.cover.subject.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-xs text-foreground truncate">{notebook.cover.topic}</p>
              <p className="text-[10px] text-muted-foreground">{notebook.cover.subject} · {notebook.cover.grade} кл.</p>
            </div>
          </div>
        </div>

        {/* Sections nav */}
        <nav className="flex-1 py-2 px-2 overflow-y-auto space-y-0.5">
          {notebook.sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-left transition-all ${
                activeSection === s.id
                  ? "bg-brand-violet-lt text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon name={SECTION_ICONS[s.id]} fallback="Circle" size={15}
                className={activeSection === s.id ? "text-primary" : "text-muted-foreground"} />
              <span className="text-xs flex-1 leading-snug">{s.title}</span>
              {s.blocks.length > 0 && (
                <span className="text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                  style={{ background: s.color + "22", color: s.color }}>
                  {s.blocks.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-border text-xs text-muted-foreground text-center">
          {totalBlocks} блоков
        </div>
      </aside>

      {/* Main editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-border px-6 py-3 flex items-center gap-3 shrink-0">
          <h2 className="font-heading font-bold text-base text-foreground">{section.title}</h2>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                saved ? "bg-brand-green-lt text-brand-green" : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              <Icon name={saved ? "Check" : "Save"} size={14} />
              {saved ? "Сохранено" : "Сохранить"}
            </button>
            <button
              onClick={onPreview}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors"
            >
              <Icon name="Play" size={14} />
              Предпросмотр
            </button>
            {onResults && (
              <button
                onClick={onResults}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors"
              >
                <Icon name="BarChart3" size={14} />
                Результаты
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">
            {/* Cover section */}
            {activeSection === "cover" && (
              <CoverEditor
                cover={notebook.cover}
                onChange={(cover) => onChange({ ...notebook, cover, updatedAt: new Date().toISOString() })}
              />
            )}

            {/* Contents section */}
            {activeSection === "contents" && (
              <div className="bg-white rounded-2xl border border-border p-6 animate-fade-in">
                <h3 className="font-heading font-bold text-base mb-4">Содержание тетради</h3>
                <div className="space-y-2">
                  {notebook.sections.filter((s) => s.id !== "cover" && s.id !== "contents").map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                      <Icon name={SECTION_ICONS[s.id]} fallback="Circle" size={14} style={{ color: s.color }} />
                      <span className="flex-1 text-sm font-medium text-foreground">{s.title}</span>
                      <span className="text-xs text-muted-foreground">{s.blocks.length} блоков</span>
                      <button onClick={() => setActiveSection(s.id)} className="text-xs text-primary hover:underline">
                        Перейти →
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Содержание формируется автоматически из разделов тетради
                </p>
              </div>
            )}

            {/* Results section */}
            {activeSection === "results" && (
              <div className="bg-white rounded-2xl border border-border p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="BarChart3" size={18} className="text-primary" />
                  <h3 className="font-heading font-bold text-base">Раздел итогов</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Итоговый балл",         desc: "Автоматический подсчёт по всем заданиям", icon: "Star" },
                    { label: "График прогресса",      desc: "Визуализация результатов ученика",         icon: "TrendingUp" },
                    { label: "Комментарии учителя",   desc: "Поле для обратной связи",                  icon: "MessageSquare" },
                    { label: "Рекомендации",          desc: "Темы для повторения и доп. материалы",     icon: "BookOpen" },
                  ].map((c) => (
                    <div key={c.label} className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                      <Icon name={c.icon} fallback="Circle" size={16} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-xs text-foreground">{c.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground bg-brand-yellow-lt rounded-xl p-3">
                  💡 Раздел итогов заполняется автоматически после того, как ученик пройдёт все задания тетради.
                </p>
              </div>
            )}

            {/* Regular sections — blocks */}
            {activeSection !== "cover" && activeSection !== "contents" && activeSection !== "results" && (
              <>
                {section.blocks.length === 0 ? (
                  <div className="text-center py-16 animate-fade-in">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="font-heading font-bold text-base text-foreground mb-1">Раздел пуст</p>
                    <p className="text-sm text-muted-foreground">Добавьте блоки с помощью меню ниже</p>
                  </div>
                ) : (
                  section.blocks.map((block, idx) => (
                    <BlockEditor
                      key={block.id}
                      block={block}
                      isFirst={idx === 0}
                      isLast={idx === section.blocks.length - 1}
                      onChange={updateBlock}
                      onDelete={() => deleteBlock(block.id)}
                      onMoveUp={() => moveBlock(block.id, "up")}
                      onMoveDown={() => moveBlock(block.id, "down")}
                    />
                  ))
                )}
              </>
            )}

            {/* Add block menu */}
            {activeSection !== "cover" && activeSection !== "contents" && activeSection !== "results" && (
              <AddBlockMenu sectionId={activeSection} onAdd={addBlock} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}