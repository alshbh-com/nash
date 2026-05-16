import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminSession, loginAdmin } from "@/lib/admin-auth.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "دخول الأدمن — ناصح" }] }),
});

const DEFAULT_ADMIN_PASSWORD = "01278006248";

function AdminLogin() {
  const navigate = useNavigate();
  const login = useServerFn(loginAdmin);
  const checkSession = useServerFn(getAdminSession);
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkSession().then((session) => {
      if (!cancelled && session.authed) navigate({ to: "/admin" });
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [checkSession, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== DEFAULT_ADMIN_PASSWORD) { toast.error("كلمة المرور غير صحيحة"); return; }
    setBusy(true);
    try {
      await login({ data: { password } });
      toast.success("أهلاً بك 🌟");
      window.location.assign("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-card rounded-3xl p-8 shadow-card">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">⭐</div>
          <h1 className="text-2xl font-bold text-navy">لوحة تحكم الأدمن</h1>
          <p className="text-sm text-muted-foreground mt-1">ادخل كلمة المرور للدخول</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input type="password" required minLength={6} autoFocus value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور"
            className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white focus:border-pink outline-none text-center tracking-widest" />
          <button type="submit" disabled={busy} className="w-full bg-navy text-white py-3 rounded-2xl font-bold shadow-soft hover:scale-[1.02] transition-all disabled:opacity-50">
            {busy ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          الجلسة تظل مفعّلة لفترة طويلة بدون إعادة إدخال كلمة المرور.
        </p>
        <Link to="/" className="block text-center text-xs text-pink mt-4 font-semibold">← العودة للمتجر</Link>
      </div>
    </div>
  );
}
