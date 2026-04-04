import { useState } from "react";
import Icon from "@/components/ui/icon";

interface StartScreenProps {
  onStart: (data: { name: string; className: string; taskNumber: string }) => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [name, setName]            = useState("");
  const [className, setClassName]  = useState("");
  const [taskNumber, setTaskNumber]= useState("");
  const [error, setError]          = useState("");

  const handleStart = () => {
    if (!name.trim()) { setError("Введите фамилию и имя"); return; }
    if (!className.trim()) { setError("Введите класс"); return; }
    setError("");
    onStart({ name: name.trim(), className: className.trim(), taskNumber: taskNumber.trim() || "1" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a6b2e] via-[#2d8a40] to-[#1a6b2e] relative overflow-hidden">
      {/* Background gears decorative */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-16 -left-16 text-white/5 text-[20rem] font-black">⚙</div>
        <div className="absolute -bottom-20 -right-10 text-white/5 text-[18rem] font-black">⚙</div>
        <div className="absolute top-1/4 right-10 text-white/5 text-[8rem] font-black">⚙</div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-4">
        {/* Header badge */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white/15 backdrop-blur rounded-2xl px-6 py-2 mb-4">
            <p className="text-white/90 text-sm font-semibold tracking-widest uppercase">Электронная тетрадь</p>
          </div>
          <h1 className="font-heading font-extrabold text-6xl text-[#f5e642] leading-none mb-1 drop-shadow-lg">
            ФИЗИКА
          </h1>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="h-px flex-1 bg-white/20" />
            <p className="font-heading font-bold text-white text-2xl">7 КЛАСС</p>
            <div className="h-px flex-1 bg-white/20" />
          </div>
          {/* ФГОС badge */}
          <div className="mt-3 inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-[#f5e642] bg-transparent">
            <span className="font-heading font-extrabold text-[#f5e642] text-sm leading-tight text-center">ФГОС</span>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
          <p className="text-center font-heading font-bold text-foreground text-base mb-6">
            Введите ваши данные и нажмите кнопку «Начать»
          </p>

          <div className="grid grid-cols-[1fr_auto_auto] gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Фамилия и имя</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="Иванов Иван"
                className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Класс</label>
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="7А"
                maxLength={4}
                className="w-20 border-2 border-border rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">№ задания:</label>
              <input
                value={taskNumber}
                onChange={(e) => setTaskNumber(e.target.value)}
                placeholder="1"
                maxLength={3}
                className="w-20 border-2 border-border rounded-xl px-3 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors text-center"
              />
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center mb-3 animate-fade-in">{error}</p>
          )}

          <button
            onClick={handleStart}
            className="w-full bg-[#4caf50] hover:bg-[#388e3c] text-white font-heading font-bold text-lg py-3.5 rounded-2xl transition-all duration-150 active:scale-98 shadow-md flex items-center justify-center gap-2"
          >
            <Icon name="Play" size={20} />
            Начать
          </button>
        </div>

        {/* Characters hint */}
        <p className="text-center text-white/50 text-xs mt-4">
          Выполни задания и получи оценку автоматически
        </p>
      </div>
    </div>
  );
}
