import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import StartScreen from "@/pages/StartScreen";
import NotebookSession from "@/pages/NotebookSession";

interface SessionMeta {
  name: string;
  className: string;
  taskNumber: string;
}

export default function App() {
  const [meta, setMeta] = useState<SessionMeta | null>(null);

  return (
    <TooltipProvider>
      <Toaster />
      {meta ? (
        <NotebookSession
          meta={meta}
          onRestart={() => setMeta(null)}
        />
      ) : (
        <StartScreen onStart={setMeta} />
      )}
    </TooltipProvider>
  );
}
