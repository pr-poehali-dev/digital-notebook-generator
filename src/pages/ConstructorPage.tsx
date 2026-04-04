import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

type FormatCommand = "bold" | "italic" | "underline" | "strikeThrough";

interface ToolbarBtn {
  cmd: FormatCommand | string;
  icon: string;
  label: string;
  isFormat?: boolean;
}

const toolbarGroups: ToolbarBtn[][] = [
  [
    { cmd: "bold",          icon: "Bold",          label: "Жирный",    isFormat: true },
    { cmd: "italic",        icon: "Italic",        label: "Курсив",    isFormat: true },
    { cmd: "underline",     icon: "Underline",     label: "Подчёркнутый", isFormat: true },
    { cmd: "strikeThrough", icon: "Strikethrough", label: "Зачёркнутый", isFormat: true },
  ],
  [
    { cmd: "h1",       icon: "Heading1", label: "Заголовок 1" },
    { cmd: "h2",       icon: "Heading2", label: "Заголовок 2" },
    { cmd: "h3",       icon: "Heading3", label: "Заголовок 3" },
  ],
  [
    { cmd: "insertUnorderedList", icon: "List",        label: "Маркированный список" },
    { cmd: "insertOrderedList",   icon: "ListOrdered", label: "Нумерованный список" },
    { cmd: "blockquote",          icon: "Quote",       label: "Цитата" },
  ],
  [
    { cmd: "formula", icon: "Sigma",      label: "Формула" },
    { cmd: "image",   icon: "ImagePlus",  label: "Изображение" },
    { cmd: "link",    icon: "Link",       label: "Ссылка" },
  ],
];

const subjects = ["Математика", "Физика", "Химия", "Биология", "История", "Литература", "Другое"];

export default function ConstructorPage() {
  const [title, setTitle] = useState("Новая тетрадь");
  const [subject, setSubject] = useState("Математика");
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [formulaText, setFormulaText] = useState("");
  const [saved, setSaved] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((cmd: string) => {
    if (cmd === "formula") {
      setShowFormulaModal(true);
      return;
    }
    if (cmd === "image") {
      const url = prompt("Вставьте URL изображения:");
      if (url) document.execCommand("insertImage", false, url);
      return;
    }
    if (cmd === "link") {
      const url = prompt("Введите URL ссылки:");
      const text = window.getSelection()?.toString() || url || "ссылка";
      if (url) document.execCommand("insertHTML", false, `<a href="${url}" target="_blank" style="color:#7c3aed;text-decoration:underline">${text}</a>`);
      return;
    }
    if (cmd === "blockquote") {
      document.execCommand("formatBlock", false, "blockquote");
      return;
    }
    if (cmd === "h1" || cmd === "h2" || cmd === "h3") {
      document.execCommand("formatBlock", false, cmd);
      return;
    }
    document.execCommand(cmd, false);
    updateActiveFormats();
  }, []);

  const insertFormula = () => {
    if (!formulaText) return;
    document.execCommand("insertHTML", false, `<span class="formula">${formulaText}</span>&nbsp;`);
    setFormulaText("");
    setShowFormulaModal(false);
  };

  const updateActiveFormats = () => {
    const fmts = new Set<string>();
    if (document.queryCommandState("bold"))          fmts.add("bold");
    if (document.queryCommandState("italic"))        fmts.add("italic");
    if (document.queryCommandState("underline"))     fmts.add("underline");
    if (document.queryCommandState("strikeThrough")) fmts.add("strikeThrough");
    setActiveFormats(fmts);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen animate-fade-in">
      {/* Top bar */}
      <div className="bg-white border-b border-border px-6 py-3 flex items-center gap-4">
        <div className="flex-1 flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-heading font-extrabold text-xl text-foreground bg-transparent border-none outline-none focus:ring-0 w-auto min-w-0 flex-1 max-w-xs"
            placeholder="Название тетради"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-xs font-semibold bg-brand-violet-lt text-primary rounded-xl px-3 py-1.5 border-none outline-none cursor-pointer"
          >
            {subjects.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              saved
                ? "bg-brand-green-lt text-brand-green"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            <Icon name={saved ? "Check" : "Save"} size={15} />
            {saved ? "Сохранено!" : "Сохранить"}
          </button>
          <button className="btn-ghost flex items-center gap-1.5 text-sm">
            <Icon name="Share2" size={15} />
            Поделиться
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-border px-6 py-2 flex items-center gap-1 flex-wrap">
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {group.map((btn) => (
              <button
                key={btn.cmd}
                title={btn.label}
                onClick={() => execCommand(btn.cmd)}
                className={`editor-toolbar-btn ${btn.isFormat && activeFormats.has(btn.cmd) ? "active" : ""}`}
              >
                <Icon name={btn.icon} fallback="Circle" size={15} />
              </button>
            ))}
            {gi < toolbarGroups.length - 1 && (
              <div className="w-px h-5 bg-border mx-1" />
            )}
          </div>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button className="editor-toolbar-btn" title="Линованный фон">
            <Icon name="AlignLeft" size={15} />
          </button>
          <button className="editor-toolbar-btn" title="Полноэкранный режим">
            <Icon name="Maximize2" size={15} />
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-3xl mx-auto py-10 px-4">
          {/* Notebook paper */}
          <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
            {/* Header strip */}
            <div className="h-2 bg-gradient-to-r from-primary via-brand-coral to-brand-yellow" />

            <div className="px-10 py-8">
              {/* Editor */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                className="wysiwyg-content notebook-lines font-body text-foreground text-base focus:outline-none"
                data-placeholder="Начните писать здесь... Используйте панель инструментов для форматирования текста, добавления формул и изображений."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Formula modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-96 animate-scale-in">
            <h3 className="font-heading font-bold text-lg mb-1">Вставить формулу</h3>
            <p className="text-muted-foreground text-sm mb-4">Введите формулу в текстовом виде (LaTeX или обычный текст)</p>
            <input
              autoFocus
              value={formulaText}
              onChange={(e) => setFormulaText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && insertFormula()}
              placeholder="Например: E = mc²  или  ax² + bx + c = 0"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm font-mono mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="btn-ghost text-sm"
              >
                Отмена
              </button>
              <button
                onClick={insertFormula}
                className="btn-primary text-sm"
              >
                Вставить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder CSS */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
