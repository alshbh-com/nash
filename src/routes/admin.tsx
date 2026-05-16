import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "دخول الأدمن — ناصح" }] }),
});

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        // try to bootstrap as first admin
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.rpc("bootstrap_admin");
          toast.success("تم إنشاء حساب الأدمن بنجاح 🎉");
          navigate({ to: "/admin/dashboard" });
        } else {
          toast.success("تم إنشاء الحساب، فعّلي البريد ثم سجلي دخول");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          await supabase.rpc("bootstrap_admin"); // promote if first user
          const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.user.id);
          if (!roles?.some((r) => r.role === "admin")) {
            toast.error("ليس لديك صلاحيات أدمن");
            await supabase.auth.signOut();
            return;
          }
        }
        navigate({ to: "/admin/dashboard" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حصل خطأ";
      toast.error(msg);
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
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "سجلي دخول لإدارة المتجر" : "إنشاء حساب أدمن (أول مستخدم فقط)"}
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني"
            className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white focus:border-pink outline-none" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور"
            className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-white focus:border-pink outline-none" />
          <button type="submit" disabled={busy} className="w-full bg-navy text-white py-3 rounded-2xl font-bold shadow-soft hover:scale-[1.02] transition-all disabled:opacity-50">
            {busy ? "جاري..." : mode === "signin" ? "دخول" : "إنشاء حساب"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-center text-sm text-pink font-semibold mt-4">
          {mode === "signin" ? "أول مرة؟ إنشاء حساب أدمن" : "← العودة لتسجيل الدخول"}
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground mt-4">العودة للمتجر</Link>
      </div>
    </div>
  );
}
