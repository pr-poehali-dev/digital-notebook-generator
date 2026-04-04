import { useState } from "react";
import Icon from "@/components/ui/icon";

const formats = [
  { id: "pdf",  label: "PDF",       icon: "FileText",  desc: "Готов к печати, высокое качество", color: "border-brand-coral bg-brand-coral-lt text-brand-coral" },
  { id: "docx", label: "Word (.docx)", icon: "FileType", desc: "Редактируемый документ",          color: "border-brand-blue bg-brand-blue-lt text-brand-blue" },
  { id: "html", label: "HTML",      icon: "Code",      desc: "Для публикации в интернете",        color: "border-brand-green bg-brand-green-lt text-brand-green" },
  { id: "png",  label: "PNG",       icon: "Image",     desc: "Изображение высокого разрешения",   color: "border-brand-yellow bg-brand-yellow-lt text-yellow-700" },
];

const notebooks = [
  { id: 1, title: "Алгебра 9 класс",    emoji: "📐" },
  { id: 2, title: "Конспект по истории", emoji: "📜" },
  { id: 3, title: "Биология — клетка",  emoji: "🔬" },
];

export default function ExportPage() {
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [selectedNotebook, setSelectedNotebook] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setDone(true); }, 2000);
    setTimeout(() => setDone(false), 4000);
  };

  const selectedNb = notebooks.find((n) => n.id === selectedNotebook);

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-extrabold text-foreground">Экспорт</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Сохрани тетрадь в нужном формате</p>
      </div>

      {/* Select notebook */}
      <div className="notebook-card p-6 mb-5">
        <h2 className="font-heading font-bold text-base mb-3 text-foreground">1. Выбери тетрадь</h2>
        <div className="space-y-2">
          {notebooks.map((nb) => (
            <label
              key={nb.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedNotebook === nb.id
                  ? "border-primary bg-brand-violet-lt"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <input
                type="radio"
                name="notebook"
                value={nb.id}
                checked={selectedNotebook === nb.id}
                onChange={() => setSelectedNotebook(nb.id)}
                className="sr-only"
              />
              <span className="text-xl">{nb.emoji}</span>
              <span className="font-semibold text-sm text-foreground">{nb.title}</span>
              {selectedNotebook === nb.id && (
                <Icon name="CheckCircle2" size={16} className="ml-auto text-primary" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Select format */}
      <div className="notebook-card p-6 mb-5">
        <h2 className="font-heading font-bold text-base mb-3 text-foreground">2. Выбери формат</h2>
        <div className="grid grid-cols-2 gap-3">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFormat(f.id)}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                selectedFormat === f.id
                  ? f.color + " border-2"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <Icon name={f.icon} fallback="File" size={20} className="mt-0.5 shrink-0" />
              <div>
                <div className="font-heading font-bold text-sm">{f.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{f.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-heading font-bold text-base transition-all active:scale-98 ${
          done
            ? "bg-brand-green-lt text-brand-green"
            : "bg-primary text-white hover:bg-primary/90"
        }`}
      >
        {exporting && (
          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        )}
        <Icon name={done ? "CheckCircle2" : "Download"} size={18} />
        {exporting ? "Экспортируем..." : done ? "Готово! Файл сохранён" : `Экспортировать «${selectedNb?.emoji} ${selectedNb?.title}» в ${selectedFormat.toUpperCase()}`}
      </button>

      {done && (
        <p className="text-center text-xs text-muted-foreground mt-3 animate-fade-in">
          Файл сохранён в папке Загрузки
        </p>
      )}
    </div>
  );
}
