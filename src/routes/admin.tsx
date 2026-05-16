import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "دخول الأدمن — ناصح" }] }),
});

const ADMIN_EMAIL = "admin@naseh.store";
const DEFAULT_ADMIN_PASSWORD = "01278006248";

function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
        if (roles?.some((r) => r.role === "admin")) navigate({ to: "/admin/dashboard" });
      }
    };
    check();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("كلمة المرور 6 أحرف على الأقل");
      return;
    }
    setBusy(true);
    try {
      // Try sign in first
      let { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
      if (error) {
        // If no account yet, create it (first-time setup)
        const { error: signUpErr } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (signUpErr) throw new Error("كلمة المرور غير صحيحة");
        // sign in after signup
        const retry = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
        if (retry.error) throw new Error("كلمة المرور غير صحيحة");
      }
      // promote to admin if first user
      await supabase.rpc("bootstrap_admin");
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.user.id);
        if (!roles?.some((r) => r.role === "admin")) {
          toast.error("كلمة المرور غير صحيحة");
          await supabase.auth.signOut();
          return;
        }
      }
      toast.success("أهلاً بيكي 🌟");
      navigate({ to: "/admin/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "كلمة المرور غير صحيحة");
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
          <p className="text-sm text-muted-foreground mt-1">ادخلي كلمة المرور للدخول</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            required
            minLength={6}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white focus:border-pink outline-none text-center tracking-widest"
          />
          <button type="submit" disabled={busy} className="w-full bg-navy text-white py-3 rounded-2xl font-bold shadow-soft hover:scale-[1.02] transition-all disabled:opacity-50">
            {busy ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-4">
          أول مرة؟ كلمة المرور اللي هتدخليها هتبقى كلمة مرور الأدمن الدائمة.
        </p>
        <Link to="/" className="block text-center text-xs text-pink mt-4 font-semibold">← العودة للمتجر</Link>
      </div>
    </div>
  );
}
