import { useState } from "react";
import Icon from "@/components/ui/icon";
import { apiLogin, apiRegister, User } from "@/lib/api";

interface Props {
  onSuccess: (token: string, user: User) => void;
}

export default function AuthPage({ onSuccess }: Props) {
  const [mode, setMode]       = useState<"login" | "register">("login");
  const [role, setRole]       = useState<"teacher" | "student">("teacher");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      let res;
      if (mode === "login") {
        res = await apiLogin(email.trim(), password);
      } else {
        if (!name.trim()) { setError("Введите имя"); setLoading(false); return; }
        res = await apiRegister(email.trim(), password, name.trim(), role);
      }
      localStorage.setItem("nb_token", res.token);
      onSuccess(res.token, res.user);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon name="BookOpen" size={28} className="text-white" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-foreground mb-1">Тетрадки</h1>
          <p className="text-muted-foreground text-sm">Интерактивные электронные тетради</p>
        </div>

        <div className="bg-white rounded-3xl border border-border p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex bg-muted rounded-2xl p-1 mb-6">
            <button onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === "login" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>
              Войти
            </button>
            <button onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === "register" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>
              Зарегистрироваться
            </button>
          </div>

          {/* Role selector (only for register) */}
          {mode === "register" && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Кто я?</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setRole("teacher")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === "teacher" ? "border-primary bg-brand-violet-lt" : "border-border hover:border-primary/40"}`}>
                  <span className="text-2xl">👩‍🏫</span>
                  <span className="font-semibold text-sm">Учитель</span>
                  <span className="text-[11px] text-muted-foreground text-center leading-tight">Создаю тетради и смотрю результаты</span>
                </button>
                <button onClick={() => setRole("student")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${role === "student" ? "border-primary bg-brand-violet-lt" : "border-border hover:border-primary/40"}`}>
                  <span className="text-2xl">🎒</span>
                  <span className="font-semibold text-sm">Ученик</span>
                  <span className="text-[11px] text-muted-foreground text-center leading-tight">Прохожу задания и тесты</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {role === "teacher" ? "Имя и фамилия" : "Имя ученика"}
                </label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={role === "teacher" ? "Анна Петровна Иванова" : "Иван Иванов"}
                  className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="example@school.ru"
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Пароль</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Минимум 6 символов" : "Введите пароль"}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="w-full border-2 border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 flex items-center gap-2">
              <Icon name="AlertCircle" size={14} />
              {error}
            </div>
          )}

          <button onClick={submit} disabled={loading || !email || !password}
            className="w-full mt-5 py-3 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            {loading ? <><Icon name="Loader2" size={16} className="animate-spin" /> Загрузка...</> :
              mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>

          {mode === "login" && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Нет аккаунта?{" "}
              <button onClick={() => setMode("register")} className="text-primary font-semibold hover:underline">
                Зарегистрируйтесь
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
