import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminUser } from "@/lib/admin-auth.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "دخول الأدمن — ناصح" }] }),
});

const ADMIN_EMAIL = "admin@naseh.store";
const DEFAULT_ADMIN_PASSWORD = "01278006248";

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== DEFAULT_ADMIN_PASSWORD) { toast.error("كلمة المرور غير صحيحة"); return; }
    setBusy(true);
    try {
      // Make sure the admin user exists with the right password and role
      await ensureAdminUser();
      const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
      if (error) throw new Error("تعذّر تسجيل الدخول، حاول مرة أخرى");
      toast.success("أهلاً بك 🌟");
      navigate({ to: "/admin" });
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
