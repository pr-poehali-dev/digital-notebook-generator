import { Notebook, Section } from "@/types/notebook";
import { nanoid } from "nanoid";

export const DEFAULT_SECTIONS: Omit<Section, "blocks">[] = [
  { id: "cover",          title: "Титульный лист",      icon: "BookMarked",   color: "#7c3aed" },
  { id: "contents",       title: "Содержание",           icon: "List",         color: "#2563eb" },
  { id: "homework-check", title: "Проверка д/з",         icon: "ClipboardCheck",color: "#0891b2" },
  { id: "new-material",   title: "Новый материал",       icon: "Lightbulb",    color: "#16a34a" },
  { id: "practice",       title: "Закрепление",          icon: "Zap",          color: "#d97706" },
  { id: "reflection",     title: "Рефлексия",            icon: "Heart",        color: "#e11d48" },
  { id: "homework",       title: "Домашнее задание",     icon: "House",        color: "#7c3aed" },
  { id: "results",        title: "Итоги",                icon: "BarChart3",    color: "#0f766e" },
];

export function createBlankNotebook(): Notebook {
  return {
    id: nanoid(),
    cover: {
      subject: "Физика",
      grade: "7",
      topic: "Введение в физику",
      authorName: "",
      schoolYear: "2025–2026",
      color: "#7c3aed",
    },
    sections: DEFAULT_SECTIONS.map((s) => ({ ...s, blocks: [] })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: false,
  };
}

export function createDemoNotebook(): Notebook {
  const id = "demo-1";
  return {
    id,
    cover: {
      subject: "Физика",
      grade: "7",
      topic: "Строение вещества",
      authorName: "Иванова М.А.",
      schoolYear: "2025–2026",
      color: "#16a34a",
    },
    sections: DEFAULT_SECTIONS.map((s) => {
      if (s.id === "new-material") {
        return {
          ...s,
          blocks: [
            {
              id: nanoid(), type: "text", section: "new-material",
              title: "Из чего состоит вещество?",
              content: "<p>Все вещества состоят из <strong>молекул</strong>, которые в свою очередь состоят из <strong>атомов</strong>. Молекулы находятся в непрерывном движении — это явление называется <em>броуновским движением</em>.</p>",
            },
            {
              id: nanoid(), type: "video", section: "new-material",
              title: "Видеоурок: Строение вещества",
              url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              description: "Посмотри видеоурок и ответь на вопросы ниже",
            },
            {
              id: nanoid(), type: "glossary", section: "new-material",
              title: "Ключевые термины",
              terms: [
                { term: "Молекула", definition: "Наименьшая частица вещества, сохраняющая его химические свойства" },
                { term: "Атом",     definition: "Наименьшая химически неделимая частица элемента" },
                { term: "Диффузия", definition: "Самопроизвольное взаимное проникновение молекул одного вещества в другое" },
              ],
            },
          ],
        };
      }
      if (s.id === "practice") {
        return {
          ...s,
          blocks: [
            {
              id: nanoid(), type: "quiz-radio", section: "practice",
              question: "Из чего состоит молекула воды?",
              options: ["Из одного атома кислорода", "Из двух атомов водорода и одного атома кислорода", "Из трёх атомов водорода", "Из атомов только одного элемента"],
              correct: 1,
              explanation: "Молекула воды H₂O состоит из 2 атомов водорода (H) и 1 атома кислорода (O).",
              points: 2,
            },
            {
              id: nanoid(), type: "quiz-match", section: "practice",
              question: "Установите соответствие между понятием и определением",
              pairs: [
                { left: "Молекула",  right: "Наименьшая частица вещества" },
                { left: "Диффузия", right: "Взаимное проникновение молекул" },
                { left: "Атом",     right: "Наименьшая частица элемента" },
              ],
              points: 3,
            },
          ],
        };
      }
      if (s.id === "reflection") {
        return {
          ...s,
          blocks: [
            {
              id: nanoid(), type: "reflection", section: "reflection",
              questions: ["Что нового я узнал на этом уроке?", "Какие трудности у меня возникли?", "Что было наиболее интересным?"],
              selfRatingMax: 5,
            },
          ],
        };
      }
      if (s.id === "homework") {
        return {
          ...s,
          blocks: [
            {
              id: nanoid(), type: "homework", section: "homework",
              title: "Домашнее задание",
              tasks: [
                { text: "Прочитать параграф и ответить на вопросы 1–5", source: "§ 5, стр. 32" },
                { text: "Выполнить задачи", source: "Сборник задач, №№ 1.12–1.15" },
              ],
              dueDate: "Следующий урок",
              allowFile: true,
              allowLink: false,
            },
          ],
        };
      }
      return { ...s, blocks: [] };
    }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: true,
  };
}
