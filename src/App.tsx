import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Notebook } from "@/types/notebook";
import { createBlankNotebook, createDemoNotebook } from "@/data/defaultNotebook";
import DashboardPage from "@/pages/DashboardPage";
import NotebookEditor from "@/pages/NotebookEditor";
import StudentView from "@/pages/StudentView";

type AppView = "dashboard" | "editor" | "student";

export default function App() {
  const [view, setView] = useState<AppView>("dashboard");
  const [notebooks, setNotebooks] = useState<Notebook[]>([createDemoNotebook()]);
  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);

  const handleCreate = () => {
    const nb = createBlankNotebook();
    setNotebooks((prev) => [nb, ...prev]);
    setActiveNotebook(nb);
    setView("editor");
  };

  const handleOpen = (nb: Notebook, mode: "edit" | "student") => {
    setActiveNotebook(nb);
    setView(mode === "edit" ? "editor" : "student");
  };

  const handleChange = (updated: Notebook) => {
    setNotebooks((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setActiveNotebook(updated);
  };

  const handleDelete = (id: string) => {
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <TooltipProvider>
      <Toaster />
      {view === "dashboard" && (
        <DashboardPage
          notebooks={notebooks}
          onOpen={handleOpen}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
      )}
      {view === "editor" && activeNotebook && (
        <NotebookEditor
          notebook={activeNotebook}
          onChange={handleChange}
          onBack={() => setView("dashboard")}
          onPreview={() => setView("student")}
        />
      )}
      {view === "student" && activeNotebook && (
        <StudentView
          notebook={activeNotebook}
          onBack={() => setView(activeNotebook ? "editor" : "dashboard")}
        />
      )}
    </TooltipProvider>
  );
}
