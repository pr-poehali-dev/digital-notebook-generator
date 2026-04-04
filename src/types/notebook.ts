// ─── Типы блоков контента ───────────────────────────────────────────────────

export type BlockType =
  | "text"          // Текстовый блок (опорный конспект)
  | "video"         // Видео YouTube / VK
  | "quiz-radio"    // Тест: один правильный ответ
  | "quiz-multi"    // Тест: несколько правильных ответов
  | "quiz-match"    // Задание на соответствие
  | "quiz-text"     // Поле для текстового ответа
  | "glossary"      // Глоссарий терминов
  | "task"          // Практическое задание (открытый ответ)
  | "reflection"    // Блок рефлексии
  | "homework"      // Домашнее задание
  | "timer"         // Таймер для задания
  | "file-upload";  // Загрузка файла

export interface BaseBlock {
  id: string;
  type: BlockType;
  section: SectionId;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  title: string;
  content: string; // HTML
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  title: string;
  url: string;
  description?: string;
}

export interface QuizRadioBlock extends BaseBlock {
  type: "quiz-radio";
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
  points: number;
}

export interface QuizMultiBlock extends BaseBlock {
  type: "quiz-multi";
  question: string;
  options: string[];
  correct: number[]; // indices
  explanation?: string;
  points: number;
}

export interface QuizMatchBlock extends BaseBlock {
  type: "quiz-match";
  question: string;
  pairs: { left: string; right: string }[];
  points: number;
}

export interface QuizTextBlock extends BaseBlock {
  type: "quiz-text";
  question: string;
  correctAnswer: string;
  caseSensitive: boolean;
  points: number;
  explanation?: string;
}

export interface GlossaryBlock extends BaseBlock {
  type: "glossary";
  title: string;
  terms: { term: string; definition: string }[];
}

export interface TaskBlock extends BaseBlock {
  type: "task";
  title: string;
  description: string;
  level: "easy" | "medium" | "hard";
  allowFile: boolean;
  allowText: boolean;
}

export interface ReflectionBlock extends BaseBlock {
  type: "reflection";
  questions: string[];
  selfRatingMax: number; // 5 or 10
}

export interface HomeworkBlock extends BaseBlock {
  type: "homework";
  title: string;
  tasks: { text: string; source: string }[]; // source = учебник/стр.
  dueDate?: string;
  allowFile: boolean;
  allowLink: boolean;
}

export interface TimerBlock extends BaseBlock {
  type: "timer";
  label: string;
  seconds: number;
}

export interface FileUploadBlock extends BaseBlock {
  type: "file-upload";
  label: string;
  acceptedTypes: string; // e.g. ".pdf,.jpg,.png"
}

export type NotebookBlock =
  | TextBlock | VideoBlock
  | QuizRadioBlock | QuizMultiBlock | QuizMatchBlock | QuizTextBlock
  | GlossaryBlock | TaskBlock | ReflectionBlock | HomeworkBlock
  | TimerBlock | FileUploadBlock;

// ─── Разделы тетради ────────────────────────────────────────────────────────

export type SectionId =
  | "cover"       // Титульный лист
  | "contents"    // Содержание
  | "homework-check"  // Проверка д/з
  | "new-material"    // Новый материал
  | "practice"        // Закрепление
  | "reflection"      // Рефлексия
  | "homework"        // Домашнее задание
  | "results";        // Итоги

export interface Section {
  id: SectionId;
  title: string;
  icon: string;
  color: string;
  blocks: NotebookBlock[];
}

// ─── Тетрадь ────────────────────────────────────────────────────────────────

export interface NotebookCover {
  subject: string;
  grade: string;
  topic: string;
  authorName: string;
  schoolYear: string;
  color: string; // hex accent
}

export interface Notebook {
  id: string;
  cover: NotebookCover;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

// ─── Состояние ученика ───────────────────────────────────────────────────────

export type StudentAnswers = Record<string, unknown>; // blockId → answer

export interface StudentSession {
  studentName: string;
  className: string;
  notebookId: string;
  answers: StudentAnswers;
  startedAt: string;
}
