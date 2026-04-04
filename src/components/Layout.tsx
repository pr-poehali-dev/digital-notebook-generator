import { useState } from "react";
import Icon from "@/components/ui/icon";

type Page = "home" | "constructor" | "notebooks" | "export" | "templates" | "help" | "profile";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: string; color: string }[] = [
  { id: "home",        label: "Главная",      icon: "Home",       color: "text-brand-violet" },
  { id: "constructor", label: "Конструктор",  icon: "PenLine",    color: "text-brand-coral" },
  { id: "notebooks",   label: "Мои тетради",  icon: "BookOpen",   color: "text-brand-blue" },
  { id: "export",      label: "Экспорт",      icon: "Download",   color: "text-brand-green" },
  { id: "templates",   label: "Шаблоны",      icon: "LayoutGrid", color: "text-brand-yellow" },
  { id: "help",        label: "Справка",      icon: "HelpCircle", color: "text-muted-foreground" },
  { id: "profile",     label: "Профиль",      icon: "User",       color: "text-muted-foreground" },
];

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          flex flex-col bg-white border-r border-border transition-all duration-300 z-20
          ${sidebarOpen ? "w-56" : "w-16"}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-border ${!sidebarOpen && "justify-center"}`}>
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-white text-base">📓</span>
          </div>
          {sidebarOpen && (
            <span className="font-heading font-800 text-lg text-foreground leading-none">
              Тетрадка
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-item w-full ${currentPage === item.id ? "active" : ""} ${!sidebarOpen && "justify-center px-2"}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon name={item.icon} fallback="Circle" size={18} className={currentPage === item.id ? "text-primary" : item.color} />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle button */}
        <div className="px-2 pb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`nav-item w-full ${!sidebarOpen && "justify-center px-2"}`}
          >
            <Icon name={sidebarOpen ? "PanelLeftClose" : "PanelLeftOpen"} size={18} className="text-muted-foreground" />
            {sidebarOpen && <span className="text-sm text-muted-foreground">Свернуть</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}