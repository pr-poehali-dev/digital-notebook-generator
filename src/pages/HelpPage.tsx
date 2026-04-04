import { useState } from "react";
import Icon from "@/components/ui/icon";

const faqs = [
  {
    q: "Как создать новую тетрадь?",
    a: "Перейдите в раздел «Конструктор» или нажмите «Новая тетрадь» на Главной. Задайте название, выберите предмет и начните писать в редакторе.",
  },
  {
    q: "Как вставить формулу?",
    a: "В редакторе нажмите кнопку Σ (формула) на панели инструментов. В открывшемся окне введите формулу текстом — например, E = mc² — и нажмите «Вставить».",
  },
  {
    q: "Как добавить изображение?",
    a: "Нажмите кнопку с иконкой изображения на панели инструментов и вставьте URL картинки. Изображение появится в тексте.",
  },
  {
    q: "В каких форматах можно экспортировать?",
    a: "Поддерживаются PDF, Word (.docx), HTML и PNG. Выберите нужный формат в разделе «Экспорт».",
  },
  {
    q: "Как использовать шаблон?",
    a: "В разделе «Шаблоны» выберите подходящий и нажмите «Использовать». Шаблон откроется в редакторе с готовой структурой.",
  },
  {
    q: "Сохраняются ли тетради автоматически?",
    a: "Пока нет — используйте кнопку «Сохранить» в редакторе. Автосохранение появится в следующей версии.",
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(query.toLowerCase()) ||
      f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-extrabold text-foreground">Справка</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Ответы на частые вопросы</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по справке..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        />
      </div>

      {/* Quick help cards */}
      {!query && (
        <div className="grid grid-cols-3 gap-3 mb-8 stagger">
          {[
            { icon: "PenLine",    label: "Редактор",  color: "bg-brand-coral-lt text-brand-coral" },
            { icon: "Download",   label: "Экспорт",   color: "bg-brand-green-lt text-brand-green" },
            { icon: "LayoutGrid", label: "Шаблоны",   color: "bg-brand-yellow-lt text-yellow-700" },
          ].map((c) => (
            <div key={c.label} className={`notebook-card p-4 flex flex-col items-center gap-2 text-center animate-fade-in ${c.color} border-0`}>
              <Icon name={c.icon} fallback="Circle" size={22} />
              <span className="font-heading font-bold text-sm">{c.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* FAQ */}
      <div className="space-y-2 stagger">
        {filtered.map((f, i) => (
          <div
            key={i}
            className="notebook-card overflow-hidden animate-fade-in"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-heading font-semibold text-sm text-foreground">{f.q}</span>
              <Icon
                name={open === i ? "ChevronUp" : "ChevronDown"}
                size={16}
                className="text-muted-foreground shrink-0 ml-3 transition-transform"
              />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed animate-fade-in border-t border-border pt-3">
                {f.a}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-10 text-sm">Ничего не найдено</p>
        )}
      </div>

      {/* Contact */}
      <div className="mt-8 notebook-card p-5 flex items-center gap-4 bg-brand-violet-lt border-primary/20">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon name="MessageCircle" size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-heading font-bold text-sm text-foreground">Не нашли ответ?</p>
          <p className="text-xs text-muted-foreground">Напишите нам — ответим в течение дня</p>
        </div>
        <button className="btn-primary text-xs px-4 py-2">
          Написать
        </button>
      </div>
    </div>
  );
}
