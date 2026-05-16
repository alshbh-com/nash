import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getAdminSession, logoutAdmin } from "@/lib/admin-auth.functions";
import { LayoutDashboard, ShoppingCart, Package, Truck, LogOut, Menu, X } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "لوحة التحكم — ناصح" }] }),
});

const NAV = [
  { to: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "الطلبات", icon: ShoppingCart },
  { to: "/admin/products", label: "المنتجات", icon: Package },
  { to: "/admin/shipping", label: "الشحن", icon: Truck },
];

function AdminLayout() {
  const navigate = useNavigate();
  const loc = useLocation();
  const checkAdminSession = useServerFn(getAdminSession);
  const clearSession = useServerFn(logoutAdmin);
  const [authed, setAuthed] = useState<"loading" | "yes" | "no">("loading");
  const [open, setOpen] = useState(false);

  const isLogin = loc.pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    let cancelled = false;
    const check = async () => {
      setAuthed("loading");
      try {
        const session = await checkAdminSession();
        if (cancelled) return;
        if (session.authed) setAuthed("yes");
        else {
          setAuthed("no");
          navigate({ to: "/admin/login" });
        }
      } catch {
        if (!cancelled) {
          setAuthed("no");
          navigate({ to: "/admin/login" });
        }
      }
    };
    check();
    return () => { cancelled = true; };
  }, [checkAdminSession, isLogin, loc.pathname, navigate]);

  const logout = async () => { await clearSession(); setAuthed("no"); navigate({ to: "/admin/login" }); };

  if (isLogin) {
    return <div className="min-h-screen bg-background"><Outlet /></div>;
  }

  if (authed !== "yes") {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جاري التحقق...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-60 bg-navy text-white flex-col fixed inset-y-0 right-0">
        <div className="p-5 border-b border-white/10">
          <div className="text-2xl font-extrabold">⭐ ناصح</div>
          <div className="text-xs opacity-70">لوحة التحكم</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm ${active ? "bg-white/15" : "hover:bg-white/5"}`}>
                <n.icon className="w-4 h-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="m-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-destructive/80 font-semibold text-sm">
          <LogOut className="w-4 h-4" /> خروج
        </button>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="relative w-64 bg-navy text-white p-4 mr-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-extrabold">⭐ ناصح</div>
              <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-1">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-white/10">
                  <n.icon className="w-4 h-4" /> {n.label}
                </Link>
              ))}
              <button onClick={logout} className="w-full mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 font-semibold text-sm">
                <LogOut className="w-4 h-4" /> خروج
              </button>
            </nav>
          </aside>
        </div>
      )}

      <main className="flex-1 lg:mr-60 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)}><Menu className="w-6 h-6" /></button>
          <div className="font-bold text-navy">لوحة التحكم</div>
          <button onClick={logout}><LogOut className="w-5 h-5" /></button>
        </header>
        <div className="p-4 md:p-8 pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
