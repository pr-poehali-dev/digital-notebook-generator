import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import ConstructorPage from "@/pages/ConstructorPage";
import NotebooksPage from "@/pages/NotebooksPage";
import ExportPage from "@/pages/ExportPage";
import TemplatesPage from "@/pages/TemplatesPage";
import HelpPage from "@/pages/HelpPage";
import ProfilePage from "@/pages/ProfilePage";

type Page = "home" | "constructor" | "notebooks" | "export" | "templates" | "help" | "profile";

export default function App() {
  const [page, setPage] = useState<Page>("home");

  const navigate = (p: string) => setPage(p as Page);

  const renderPage = () => {
    switch (page) {
      case "home":        return <HomePage onNavigate={navigate} />;
      case "constructor": return <ConstructorPage />;
      case "notebooks":   return <NotebooksPage onNavigate={navigate} />;
      case "export":      return <ExportPage />;
      case "templates":   return <TemplatesPage onNavigate={navigate} />;
      case "help":        return <HelpPage />;
      case "profile":     return <ProfilePage />;
      default:            return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <Layout currentPage={page} onNavigate={navigate}>
        {renderPage()}
      </Layout>
    </TooltipProvider>
  );
}
