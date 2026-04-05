import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Notebook } from "@/types/notebook";
import { createBlankNotebook, createDemoNotebook } from "@/data/defaultNotebook";
import DashboardPage from "@/pages/DashboardPage";
import NotebookEditor from "@/pages/NotebookEditor";
import StudentView from "@/pages/StudentView";
import AuthPage from "@/pages/AuthPage";
import ResultsPage from "@/pages/ResultsPage";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { User, apiSaveNotebook, apiGetNotebooks } from "@/lib/api";

type AppView = "dashboard" | "editor" | "student" | "results";

function AppInner() {
  const { user, loading, setUser } = useAuth();
  const [view, setView] = useState<AppView>("dashboard");
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
  const [nbLoaded, setNbLoaded] = useState(false);

  // Загружаем тетради после авторизации (учитель) или из localStorage (гость)
  useEffect(() => {
    if (loading) return;
    if (user?.role === "teacher") {
      apiGetNotebooks()
        .then((rows) => {
          if (rows.length > 0) {
            setNotebooks(rows.map((r) => r.notebook as Notebook));
          } else {
            setNotebooks([createDemoNotebook()]);
          }
        })
        .catch(() => setNotebooks([createDemoNotebook()]))
        .finally(() => setNbLoaded(true));
    } else {
      // Ученик или гость — просто демо
      setNotebooks([createDemoNotebook()]);
      setNbLoaded(true);
    }
  }, [user, loading]);

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

  const handleChange = async (updated: Notebook) => {
    setNotebooks((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setActiveNotebook(updated);
    // Автосохранение в БД для учителей
    if (user?.role === "teacher") {
      try { await apiSaveNotebook(updated); } catch { /* silent */ }
    }
  };

  const handleDelete = (id: string) => {
    setNotebooks((prev) => prev.filter((n) => n.id !== id));
  };

  if (loading || !nbLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-xl">📓</span>
          </div>
          <p className="text-muted-foreground text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={(_token: string, u: User) => setUser(u)} />;
  }

  return (
    <>
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
          onResults={() => setView("results")}
        />
      )}
      {view === "student" && activeNotebook && (
        <StudentView
          notebook={activeNotebook}
          onBack={() => setView(activeNotebook ? "editor" : "dashboard")}
        />
      )}
      {view === "results" && activeNotebook && (
        <ResultsPage
          notebook={activeNotebook}
          onBack={() => setView("editor")}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <AppInner />
      </TooltipProvider>
    </AuthProvider>
  );
}
